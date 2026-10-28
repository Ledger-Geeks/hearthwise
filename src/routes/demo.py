import logging
import time
from typing import Literal

from fastapi import APIRouter, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logger = logging.getLogger("uvicorn.error")

# Public landing-page chatbot: no auth, no documents, so it answers from the model alone.
demo_router = APIRouter(
    prefix="/api/v1/demo",
    tags=["api_v1", "demo"],
)

SYSTEM_PROMPT = (
    "You are Hearthwise, a warm, concise nutrition assistant running as a product demo. "
    "Answer food and nutrition questions in 2-4 short sentences. "
    "You are not a doctor: for medical conditions, medication or allergies, tell the user to consult a professional. "
    "When it fits, mention that signed-in users get answers grounded in documents they upload."
)


class DemoMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=500)


class DemoChatRequest(BaseModel):
    messages: list[DemoMessage] = Field(min_length=1, max_length=12)


# ponytail: in-memory per-IP limit; resets on restart and isn't shared across workers.
# Behind a proxy every request shares one IP. Move to Redis + X-Forwarded-For if this goes public.
RATE_LIMIT = 10
RATE_WINDOW_SECONDS = 60
_hits: dict[str, list[float]] = {}


def _rate_limited(ip: str) -> bool:
    now = time.monotonic()
    recent = [t for t in _hits.get(ip, []) if now - t < RATE_WINDOW_SECONDS]
    limited = len(recent) >= RATE_LIMIT
    if not limited:
        recent.append(now)
    _hits[ip] = recent
    return limited


@demo_router.post("/chat")
async def demo_chat(request: Request, body: DemoChatRequest):
    if _rate_limited(request.client.host if request.client else "unknown"):
        return JSONResponse(status_code=429, content={"signal": "demo_rate_limited"})

    if body.messages[-1].role != "user":
        return JSONResponse(status_code=400, content={"signal": "demo_last_message_must_be_user"})

    client = request.app.generation_client
    roles = {"user": client.enums.USER.value, "assistant": client.enums.ASSISTANT.value}

    chat_history = [client.construct_prompt(prompt=SYSTEM_PROMPT, role=client.enums.SYSTEM.value)]
    chat_history += [client.construct_prompt(prompt=m.content, role=roles[m.role]) for m in body.messages[:-1]]

    try:
        # Provider SDKs are synchronous; keep them off the event loop.
        answer = await run_in_threadpool(
            client.generate_text,
            prompt=body.messages[-1].content,
            chat_history=chat_history,
            max_output_tokens=300,
        )
    except Exception as e:
        # Missing/invalid API key lands here; the widget tells the user how to fix it.
        logger.warning(f"[demo] generation failed: {type(e).__name__}: {e}")
        return JSONResponse(status_code=503, content={"signal": "demo_llm_unavailable"})

    if not answer:
        return JSONResponse(status_code=503, content={"signal": "demo_llm_unavailable"})

    return {"signal": "demo_answer_success", "answer": answer}


if __name__ == "__main__":
    # Self-check: `python -m routes.demo` from src/
    assert not any(_rate_limited("1.2.3.4") for _ in range(RATE_LIMIT))
    assert _rate_limited("1.2.3.4"), "11th request in the window must be limited"
    assert not _rate_limited("5.6.7.8"), "limits are per IP"
    print("demo rate limit ok")
