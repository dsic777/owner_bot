from pydantic import BaseModel
from typing import Optional


class BusinessTypePublic(BaseModel):
    id: int
    name: str
    competitor_keyword: Optional[str] = None
    secondary_keyword: Optional[str] = None
    competitor_radius: Optional[int] = None
    kakao_group_code: Optional[str] = None
    kakao_category_filter: Optional[str] = None
    aliases: Optional[str] = None

    class Config:
        from_attributes = True


class DetectTypeRequest(BaseModel):
    business_name: str
    available_types: list[str]
