from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.future import select
from models.db_schemas.nutrition_rag.schemas.user import User
from models.db_schemas.nutrition_rag.schemas.email_verification import EmailVerification
from helpers.config import get_settings
from helpers.mailer import send_otp_email
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import bcrypt
import hashlib
import hmac
import logging
import secrets

logger = logging.getLogger("uvicorn.error")

auth_router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)

# .env is loaded by pydantic Settings, not into os.environ, so read the secret from Settings.
SECRET_KEY = get_settings().JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

OTP_TTL = timedelta(minutes=10)
OTP_RESEND_COOLDOWN = timedelta(seconds=60)
OTP_MAX_ATTEMPTS = 5


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: str = None


class LoginRequest(BaseModel):
    email: str
    password: str


class VerifyOtpRequest(BaseModel):
    code: str = Field(pattern=r"^\d{6}$")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def user_payload(user: User, verified: bool) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "verified": verified,
    }


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _hash_code(user_id: int, code: str) -> str:
    # Keyed hash: a leaked table row can't be brute-forced offline without the server secret
    return hmac.new(SECRET_KEY.encode(), f"{user_id}:{code}".encode(), hashlib.sha256).hexdigest()


async def _is_verified(session, user_id: int) -> bool:
    row = await session.get(EmailVerification, user_id)
    return row is None or row.verified_at is not None


async def _issue_otp(session, user: User) -> str:
    """Create or replace the user's pending code. Caller commits."""
    code = f"{secrets.randbelow(10**6):06d}"
    row = await session.get(EmailVerification, user.id)
    if row is None:
        row = EmailVerification(user_id=user.id)
        session.add(row)
    row.code_hash = _hash_code(user.id, code)
    row.expires_at = _now() + OTP_TTL
    row.attempts = 0
    row.last_sent_at = _now()
    row.verified_at = None
    return code


async def _send_otp(email: str, code: str):
    # Delivery failure must not fail sign-up: the user can hit "resend"
    try:
        await run_in_threadpool(send_otp_email, email, code)
    except Exception as e:
        logger.warning(f"[otp] sending to {email} failed: {type(e).__name__}: {e}")


async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with request.app.db_client() as session:
        result = await session.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user


@auth_router.post("/register")
async def register(request: Request, body: RegisterRequest):
    async with request.app.db_client() as session:
        existing = await session.execute(
            select(User).where(User.email == body.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        existing_username = await session.execute(
            select(User).where(User.username == body.username)
        )
        if existing_username.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")

        user = User(
            email=body.email,
            username=body.username,
            hashed_password=hash_password(body.password),
            full_name=body.full_name,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        code = await _issue_otp(session, user)
        await session.commit()

    await _send_otp(user.email, code)

    token = create_access_token({"sub": str(user.id)})
    return JSONResponse(content={
        "access_token": token,
        "token_type": "bearer",
        "user": user_payload(user, verified=False),
    })


@auth_router.post("/login")
async def login(request: Request, body: LoginRequest):
    async with request.app.db_client() as session:
        result = await session.execute(select(User).where(User.email == body.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(body.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        verified = await _is_verified(session, user.id)

    # Unverified users still get a token: the frontend sends them to the OTP screen with it
    token = create_access_token({"sub": str(user.id)})
    return JSONResponse(content={
        "access_token": token,
        "token_type": "bearer",
        "user": user_payload(user, verified),
    })


@auth_router.post("/verify-otp")
async def verify_otp(request: Request, body: VerifyOtpRequest, current_user: User = Depends(get_current_user)):
    async with request.app.db_client() as session:
        row = await session.get(EmailVerification, current_user.id)
        if row is None or row.verified_at is not None:
            return {"user": user_payload(current_user, True)}

        if row.attempts >= OTP_MAX_ATTEMPTS:
            raise HTTPException(status_code=429, detail="Too many attempts. Request a new code.")
        if _now() > row.expires_at:
            raise HTTPException(status_code=410, detail="This code has expired. Request a new one.")

        if not hmac.compare_digest(row.code_hash, _hash_code(current_user.id, body.code)):
            row.attempts += 1
            await session.commit()
            left = OTP_MAX_ATTEMPTS - row.attempts
            detail = f"Incorrect code. {left} attempt{'s' if left != 1 else ''} left." if left else \
                "Too many attempts. Request a new code."
            raise HTTPException(status_code=400, detail=detail)

        row.verified_at = _now()
        await session.commit()

    return {"user": user_payload(current_user, True)}


@auth_router.post("/resend-otp")
async def resend_otp(request: Request, current_user: User = Depends(get_current_user)):
    async with request.app.db_client() as session:
        row = await session.get(EmailVerification, current_user.id)
        if row is None or row.verified_at is not None:
            raise HTTPException(status_code=400, detail="Email already verified")

        wait = (row.last_sent_at + OTP_RESEND_COOLDOWN - _now()).total_seconds()
        if wait > 0:
            raise HTTPException(status_code=429, detail=f"Please wait {int(wait) + 1}s before requesting another code.")

        code = await _issue_otp(session, current_user)
        await session.commit()

    await _send_otp(current_user.email, code)
    return {"sent": True, "cooldown_seconds": int(OTP_RESEND_COOLDOWN.total_seconds())}


@auth_router.get("/me")
async def me(request: Request, current_user: User = Depends(get_current_user)):
    async with request.app.db_client() as session:
        verified = await _is_verified(session, current_user.id)
    return JSONResponse(content={
        **user_payload(current_user, verified),
        "created_at": str(current_user.created_at),
    })


@auth_router.put("/me")
async def update_me(request: Request, current_user: User = Depends(get_current_user)):
    body = await request.json()
    async with request.app.db_client() as session:
        result = await session.execute(select(User).where(User.id == current_user.id))
        user = result.scalar_one_or_none()
        if body.get("full_name") is not None:
            user.full_name = body["full_name"]
        if body.get("username") is not None:
            user.username = body["username"]
        await session.commit()
        await session.refresh(user)
        verified = await _is_verified(session, user.id)

    return JSONResponse(content=user_payload(user, verified))
