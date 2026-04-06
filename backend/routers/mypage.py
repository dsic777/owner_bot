from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import User, CreditTransaction
from backend.schemas import UserOut, CreditTransactionOut
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/api/mypage", tags=["마이페이지"])


@router.get("/credits")
def credits_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """크레딧 잔액 + 최근 거래 내역 20건"""
    transactions = (
        db.query(CreditTransaction)
        .filter(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "credits": current_user.credits,
        "plan": current_user.plan,
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.type,
                "note": t.note,
                "created_at": t.created_at,
            }
            for t in transactions
        ],
    }
