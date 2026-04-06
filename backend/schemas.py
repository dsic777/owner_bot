from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── 인증 ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nickname: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    nickname: Optional[str]
    credits: int
    plan: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── 콘텐츠 생성 ───────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    shop_name: str
    business_type: str
    region: str
    keyword: str
    feature: Optional[str] = None
    tone: str = "friendly"   # friendly / professional / emotional


class HistoryOut(BaseModel):
    id: int
    shop_name: str
    business_type: str
    region: str
    keyword: str
    feature: Optional[str]
    tone: str
    output_payload: str      # JSON 문자열 — 프론트에서 파싱
    credits_used: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── 마이페이지 ────────────────────────────────────────────────────
class CreditTransactionOut(BaseModel):
    id: int
    amount: int
    type: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
