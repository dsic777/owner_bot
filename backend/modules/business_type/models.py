from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func
from database import Base


class BusinessType(Base):
    __tablename__ = "business_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    order_no = Column(Integer, default=0)
    competitor_keyword = Column(String(100), nullable=True)
    secondary_keyword = Column(String(100), nullable=True)
    competitor_radius = Column(Integer, nullable=True)
    kakao_group_code = Column(String(10), nullable=True)
    kakao_category_filter = Column(String(100), nullable=True)
    aliases = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
