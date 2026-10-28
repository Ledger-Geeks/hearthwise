import logging
import smtplib
from email.message import EmailMessage

from helpers.config import get_settings

logger = logging.getLogger("uvicorn.error")


def send_otp_email(to: str, code: str) -> None:
    """Send a verification code. Blocking: call it from a threadpool."""
    settings = get_settings()

    if not settings.SMTP_HOST:
        # ponytail: dev fallback so sign-up works without SMTP. Set SMTP_* in .env for real delivery.
        logger.warning(f"[otp] SMTP not configured. Verification code for {to}: {code}")
        return

    msg = EmailMessage()
    msg["Subject"] = f"Your Hearthwise code: {code}"
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USERNAME
    msg["To"] = to
    msg.set_content(
        f"Your Hearthwise verification code is {code}.\n\n"
        "It expires in 10 minutes. If you didn't create an account, you can ignore this email."
    )

    # ponytail: STARTTLS only (port 587, e.g. Gmail with an app password). Add SMTP_SSL for port 465 if needed.
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
        smtp.starttls()
        if settings.SMTP_USERNAME:
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(msg)
