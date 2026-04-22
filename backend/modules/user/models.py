import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class UserPlan(str, enum.Enum):
    free     = "free"
    monthly  = "monthly"
    per_use  = "per_use"


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    email           = Column(String(255), unique=True, nullable=False, index=True)  # 아이디(username) 저장
    hashed_password = Column(String(255), nullable=False)
    nickname        = Column(String(100), nullable=True)   # 이름
    business_name   = Column(String(200), nullable=True)   # 상호명
    business_type   = Column(String(100), nullable=True)   # 업종
    phone           = Column(String(20),  nullable=True)   # 전화번호
    user_email      = Column(String(255), nullable=True)   # 이메일
    credits         = Column(Integer, nullable=False, default=3)
    plan            = Column(Enum(UserPlan), nullable=False, default=UserPlan.free)
    is_active       = Column(Boolean, nullable=False, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    histories     = relationship("GenerationHistory", back_populates="user",
                                 cascade="all, delete-orphan")
    transactions  = relationship("CreditTransaction", back_populates="user",
                                 cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user",
                                 cascade="all, delete-orphan")