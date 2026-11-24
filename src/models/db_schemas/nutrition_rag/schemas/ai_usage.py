from .nutrition_rag_base import SQLAlchemyBase
from sqlalchemy import Column, INTEGER, Date, String


class AIUsage(SQLAlchemyBase):
    """
    AI requests made by one caller ("user:<id>" or "ip:<address>") on one UTC day.
    Written by helpers/ai_quota.py.
    """

    __tablename__ = "ai_usage"

    key = Column(String, primary_key=True)
    day = Column(Date, primary_key=True)
    count = Column(INTEGER, nullable=False, default=0)
