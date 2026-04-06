from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, CreditTransaction
from backend.schemas import UserRegister, UserLogin, Token, UserOut
from backend.services.auth_service import (
    hash_password, verify_password, create_access_token, decode_token
)

router = APIRouter(prefix="/api/auth", tags=["인증"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── 현재 로그인 사용자 추출 (의존성) ──────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다.")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")
    return user


# ── 회원가입 ──────────────────────────────────────────────────────
@router.post("/register", response_model=UserOut, status_code=201)
def register(body: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        nickname=body.nickname or body.email.split("@")[0],
        credits=3,
        plan="free",
    )
    db.add(user)
    db.flush()   # user.id 확보

    # 가입 보너스 크레딧 거래 내역 기록
    db.add(CreditTransaction(
        user_id=user.id,
        amount=3,
        type="earn",
        note="가입 보너스",
    ))
    db.commit()
    db.refresh(user)
    return user


# ── 로그인 ────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀립니다.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="비활성화된 계정입니다.")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# ── 내 정보 조회 ──────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
