from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from config import settings
from .models import BusinessType
from .schemas import BusinessTypePublic, DetectTypeRequest

router = APIRouter(prefix="/business-types", tags=["business-types"])


@router.get("", response_model=list[BusinessTypePublic])
def list_business_types(db: Session = Depends(get_db)):
    return (
        db.query(BusinessType)
        .filter(BusinessType.is_active == True)
        .order_by(BusinessType.order_no, BusinessType.id)
        .all()
    )


@router.post("/detect")
def detect_business_type(req: DetectTypeRequest, db: Session = Depends(get_db)):
    if not req.business_name.strip() or not req.available_types:
        return {"type_name": None}

    # 1차: aliases 키워드 사전 매칭 (AI 호출 없이)
    normalized = req.business_name.replace(' ', '').lower()
    bts = db.query(BusinessType).filter(BusinessType.aliases.isnot(None)).all()
    for bt in bts:
        if bt.name not in req.available_types:
            continue
        for alias in bt.aliases.split(','):
            a = alias.strip().replace(' ', '').lower()
            if a and a in normalized:
                return {"type_name": bt.name}

    # 2차: Claude AI 감지
    if not settings.ANTHROPIC_API_KEY:
        return {"type_name": None}

    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        type_list = ", ".join(req.available_types)
        prompt = f"""아래 상호명을 보고 업종 목록에서 가장 적합한 업종 하나를 골라 그 이름만 출력하세요.
업종명 외 다른 말은 절대 하지 마세요.

업종 목록: {type_list}
상호명: {req.business_name}"""
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=30,
            messages=[{"role": "user", "content": prompt}],
        )
        detected = response.content[0].text.strip().strip('"').strip("'")
        if detected not in req.available_types:
            detected = None
        return {"type_name": detected}
    except Exception:
        return {"type_name": None}
