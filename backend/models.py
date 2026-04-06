from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    email            = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password  = Column(String(255), nullable=False)
    nickname         = Column(String(100), nullable=True)
    credits          = Column(Integer, nullable=False, default=3)
    plan             = Column(String(20), nullable=False, default="free")   # free / monthly
    is_active        = Column(Boolean, nullable=False, default=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())

    histories      = relationship("GenerationHistory", back_populates="user",
                                  cascade="all, delete-orphan")
    transactions   = relationship("CreditTransaction", back_populates="user",
                                  cascade="all, delete-orphan")
    subscriptions  = relationship("Subscription", back_populates="user",
                                  cascade="all, delete-orphan")


class GenerationHistory(Base):
    __tablename__ = "generation_history"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"),
                            nullable=True, index=True)   # NULL = 비로그인 체험
    shop_name      = Column(String(100), nullable=False)
    business_type  = Column(String(50),  nullable=False)
    region         = Column(String(100), nullable=False)
    keyword        = Column(String(100), nullable=False)
    feature        = Column(String(200), nullable=True)
    tone           = Column(String(20),  nullable=False, default="friendly")
    input_payload  = Column(Text, nullable=False)   # 입력값 JSON (재생성용)
    output_payload = Column(Text, nullable=False)   # {"blog":…,"review":…,"shorts":…,"thumbnail":…}
    credits_used   = Column(Integer, nullable=False, default=1)
    created_at     = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="histories")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    amount     = Column(Integer, nullable=False)          # 양수: 획득 / 음수: 차감
    type       = Column(String(10), nullable=False)       # earn / use / refund
    note       = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="transactions")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                               nullable=False, index=True)
    plan              = Column(String(20), nullable=False)   # monthly / per-use
    amount            = Column(Integer,   nullable=False)    # 결제금액 (원)
    status            = Column(String(20), nullable=False)   # paid / failed / refunded
    period_start      = Column(Date, nullable=True)
    period_end        = Column(Date, nullable=True)
    pg_transaction_id = Column(String(100), nullable=True)   # 추후 PG 연동
    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="subscriptions")
