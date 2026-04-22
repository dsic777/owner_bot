from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    username: str
    password: str
    nickname: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    phone: Optional[str] = None
    user_email: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("비밀번호는 최소 6자 이상이어야 합니다.")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("비밀번호는 최소 6자 이상이어야 합니다.")
        return v


class UserOut(BaseModel):
    id: int
    username: str
    nickname: Optional[str]
    business_name: Optional[str]
    business_type: Optional[str]
    phone: Optional[str]
    user_email: Optional[str]
    credits: int
    plan: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

    @classmethod
    def from_orm_user(cls, user):
        return cls(
            id=user.id,
            username=user.email,
            nickname=user.nickname,
            business_name=user.business_name,
            business_type=user.business_type,
            phone=user.phone,
            user_email=user.user_email,
            credits=user.credits,
            plan=user.plan,
            is_active=user.is_active,
            created_at=user.created_at,
        )