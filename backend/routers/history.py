import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import User, GenerationHistory
from backend.schemas import HistoryOut
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["히스토리"])


@router.get("", response_model=List[HistoryOut])
def list_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """내 생성 이력 최신순 50건"""
    return (
        db.query(GenerationHistory)
        .filter(GenerationHistory.user_id == current_user.id)
        .order_by(GenerationHistory.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/{history_id}", response_model=HistoryOut)
def get_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """이력 상세 조회"""
    h = db.query(GenerationHistory).filter(
        GenerationHistory.id == history_id,
        GenerationHistory.user_id == current_user.id,
    ).first()
    if not h:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다.")
    return h


@router.delete("/{history_id}", status_code=204)
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """이력 삭제"""
    h = db.query(GenerationHistory).filter(
        GenerationHistory.id == history_id,
        GenerationHistory.user_id == current_user.id,
    ).first()
    if not h:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다.")
    db.delete(h)
    db.commit()


@router.post("/{history_id}/regenerate")
async def regenerate(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """같은 입력으로 재생성 — generate 라우터로 위임"""
    from fastapi import Request
    from backend.schemas import GenerateRequest
    from backend.routers.generate import generate as do_generate

    h = db.query(GenerationHistory).filter(
        GenerationHistory.id == history_id,
        GenerationHistory.user_id == current_user.id,
    ).first()
    if not h:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다.")

    input_data = json.loads(h.input_payload)
    body = GenerateRequest(**input_data)
    return await do_generate(body=body, db=db, current_user=current_user)
