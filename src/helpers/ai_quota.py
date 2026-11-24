import math
from datetime import datetime, time, timedelta, timezone

from fastapi import Request
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from sqlalchemy.dialects.postgresql import insert

from helpers.config import get_settings
from models.db_schemas.nutrition_rag.schemas.ai_usage import AIUsage


def caller_key(request: Request) -> str:
    """Signed-in user id from a valid JWT, otherwise the client IP."""
    # Imported here: routes.auth reads Settings at import, which would make every importer need a .env.
    from routes.auth import ALGORITHM, SECRET_KEY

    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            sub = jwt.decode(auth[7:], SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
            if sub:
                return f"user:{sub}"
        except JWTError:
            pass
    # ponytail: X-Forwarded-For is client-controlled unless a proxy you run overwrites it;
    # without one, signed-out callers can dodge the limit by sending a fake header.
    forwarded = request.headers.get("X-Forwarded-For")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    return f"ip:{ip}"


async def check_ai_quota(db_client, key: str, limit: int, now: datetime):
    """
    Counts one AI request for `key` today (UTC). Returns None while within `limit`,
    otherwise the 429 response to send.
    """
    # One atomic upsert: concurrent requests can't both read the same count.
    stmt = (
        insert(AIUsage)
        .values(key=key, day=now.date(), count=1)
        .on_conflict_do_update(index_elements=["key", "day"], set_={"count": AIUsage.count + 1})
        .returning(AIUsage.count)
    )
    async with db_client() as session:
        count = (await session.execute(stmt)).scalar_one()
        await session.commit()

    if count <= limit:
        return None

    next_midnight = datetime.combine(now.date() + timedelta(days=1), time.min, tzinfo=timezone.utc)
    reset_in_sec = math.ceil((next_midnight - now).total_seconds())
    return JSONResponse(
        status_code=429,
        headers={"Retry-After": str(reset_in_sec)},
        content={
            "error": f"Daily AI limit reached ({limit} per day). Try again in {math.ceil(reset_in_sec / 3600)}h.",
            "remaining": 0,
            "resetInSec": reset_in_sec,
        },
    )


async def ai_quota(request: Request):
    """Call once per user action that triggers AI generation; return its result if not None."""
    return await check_ai_quota(
        request.app.db_client,
        caller_key(request),
        get_settings().AI_DAILY_LIMIT,
        datetime.now(timezone.utc),
    )


if __name__ == "__main__":
    # Self-check against the Postgres in src/.env: `python -m helpers.ai_quota` from src/
    import asyncio
    import uuid
    from sqlalchemy import delete
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
    from sqlalchemy.orm import sessionmaker

    async def main():
        s = get_settings()
        engine = create_async_engine(
            f"postgresql+asyncpg://{s.POSTGRES_USERNAME}:{s.POSTGRES_PASSWORD}"
            f"@{s.POSTGRES_HOST}:{s.POSTGRES_PORT}/{s.POSTGRES_MAIN_DATABASE}"
        )
        async with engine.begin() as conn:
            await conn.run_sync(AIUsage.__table__.create, checkfirst=True)
        db = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        alice, bob = f"test:{uuid.uuid4()}", f"test:{uuid.uuid4()}"
        day1 = datetime(2026, 1, 1, 22, 30, tzinfo=timezone.utc)
        try:
            for _ in range(3):
                assert await check_ai_quota(db, alice, 3, day1) is None, "first N requests are allowed"
            refused = await check_ai_quota(db, alice, 3, day1)
            assert refused is not None and refused.status_code == 429, "request N+1 is refused"
            assert refused.headers["Retry-After"] == "5400"  # 1h30m to UTC midnight
            assert b"Try again in 2h." in refused.body and b'"remaining":0' in refused.body
            assert await check_ai_quota(db, bob, 3, day1) is None, "limits are per caller"
            assert await check_ai_quota(db, alice, 3, day1 + timedelta(hours=2)) is None, "resets next UTC day"
        finally:
            async with db() as session:
                await session.execute(delete(AIUsage).where(AIUsage.key.in_([alice, bob])))
                await session.commit()
            await engine.dispose()
        print("ai quota ok")

    asyncio.run(main())
