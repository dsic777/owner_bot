from fastapi import APIRouter, Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from config import settings
from .schemas import BusinessTypePublic, DetectTypeRequest

router = APIRouter(prefix="/business-types", tags=["business-types"])

_v2_engine = None
_V2Session = None

def get_v2_db():
    global _v2_engine, _V2Session
    if not settings.V2_DATABASE_URL:
        yield None
        return
    if _v2_engine is None:
        _v2_engine = create_engine(settings.V2_DATABASE_URL)
        _V2Session = sessionmaker(bind=_v2_engine)
    db = _V2Session()
    try:
        yield db
    finally:
        db.close()

_V2Base = declarative_base()

class _V2BusinessType(_V2Base):
    __tablename__ = "business_types"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    is_active = Column(Boolean, default=True)
    order_no = Column(Integer, default=0)
    competitor_keyword = Column(String(100), nullable=True)
    secondary_keyword = Column(String(100), nullable=True)
    competitor_radius = Column(Integer, nullable=True)
    kakao_group_code = Column(String(10), nullable=True)
    kakao_category_filter = Column(String(100), nullable=True)
    aliases = Column(Text, nullable=True)


@router.get("", response_model=list[BusinessTypePublic])
def list_business_types(db: Session = Depends(get_v2_db)):
    if db is None:
        return []
    return (
        db.query(_V2BusinessType)
        .filter(_V2BusinessType.is_active == True)
        .order_by(_V2BusinessType.order_no, _V2BusinessType.id)
        .all()
    )


@router.post("/detect")
def detect_business_type(req: DetectTypeRequest, db: Session = Depends(get_v2_db)):
    if not req.business_name.strip() or not req.available_types:
        return {"type_name": None}

    # 1차: aliases 키워드 사전 매칭
    if db is not None:
        normalized = req.business_name.replace(' ', '').lower()
        bts = db.query(_V2BusinessType).filter(_V2BusinessType.aliases.isnot(None)).all()
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
