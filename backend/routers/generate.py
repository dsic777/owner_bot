import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.models import User, GenerationHistory, CreditTransaction
from backend.schemas import GenerateRequest
from backend.routers.auth import get_current_user
from backend.services.openai_service import stream_content

router = APIRouter(prefix="/api/generate", tags=["콘텐츠 생성"])


def _get_optional_user(
    db: Session = Depends(get_db),
    token: Optional[str] = None,
) -> Optional[User]:
    """로그인 선택적 — 비로그인도 1회 허용"""
    return None


@router.post("")
async def generate(
    body: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(
        lambda: None   # 비로그인 허용 — 아래에서 직접 토큰 검사
    ),
):
    """
    콘텐츠 생성 (스트리밍)
    - 비로그인: 1회 체험 (세션 제어는 프론트에서)
    - 로그인: credits 차감
    """
    # 크레딧 검사 (로그인 사용자)
    if current_user:
        if current_user.credits <= 0:
            raise HTTPException(status_code=402, detail="크레딧이 부족합니다.")

    input_data = body.model_dump()

    async def event_stream():
        full_output = {}
        async for chunk_type, chunk_text in stream_content(input_data):
            full_output.setdefault(chunk_type, "")
            full_output[chunk_type] += chunk_text
            yield f"data: {json.dumps({'type': chunk_type, 'text': chunk_text}, ensure_ascii=False)}\n\n"

        # 생성 완료 후 DB 저장
        history = GenerationHistory(
            user_id=current_user.id if current_user else None,
            shop_name=body.shop_name,
            business_type=body.business_type,
            region=body.region,
            keyword=body.keyword,
            feature=body.feature,
            tone=body.tone,
            input_payload=json.dumps(input_data, ensure_ascii=False),
            output_payload=json.dumps(full_output, ensure_ascii=False),
            credits_used=1,
        )
        db.add(history)

        if current_user:
            current_user.credits -= 1
            db.add(CreditTransaction(
                user_id=current_user.id,
                amount=-1,
                type="use",
                note=f"{body.shop_name} 콘텐츠 생성",
            ))

        db.commit()
        yield f"data: {json.dumps({'type': 'done', 'history_id': history.id}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
