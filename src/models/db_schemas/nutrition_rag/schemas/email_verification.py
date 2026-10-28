from .nutrition_rag_base import SQLAlchemyBase
from sqlalchemy import Column, INTEGER, DateTime, String, ForeignKey


class EmailVerification(SQLAlchemyBase):
    """
    Email OTP verification state for a user.
    No row means the account predates email verification and is treated as verified.
    """

    __tablename__ = "email_verifications"

    user_id = Column(INTEGER, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    code_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(INTEGER, default=0, nullable=False)
    last_sent_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
