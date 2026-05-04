"""
v1 업종 초기 데이터 등록 스크립트
EC2에서: docker exec ownerbot python backend/scripts/seed_business_types.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, Base, engine
from modules.business_type.models import BusinessType

BUSINESS_TYPES = [
    {
        "name": "음식점/식당",
        "aliases": "식당,맛집,치킨,피자,김밥,국밥,한식,분식,떡볶이,순대,족발,보쌈,삼겹살,갈비,찜닭",
        "kakao_group_code": "FD6",
        "kakao_category_filter": None,
        "order_no": 1,
    },
    {
        "name": "카페/베이커리",
        "aliases": "카페,베이커리,빵,커피,디저트,아이스크림,음료,카페베이커리",
        "kakao_group_code": "CE7",
        "kakao_category_filter": None,
        "order_no": 2,
    },
    {
        "name": "피부관리/에스테틱",
        "aliases": "피부,에스테틱,스킨케어,피부관리,피부샵",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 3,
    },
    {
        "name": "헤어샵/미용실",
        "aliases": "헤어,미용실,미용,헤어샵,염색,펌,커트,헤어살롱",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 4,
    },
    {
        "name": "네일아트/속눈썹",
        "aliases": "네일,속눈썹,네일아트,젤네일,네일샵",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 5,
    },
    {
        "name": "학원/교육",
        "aliases": "학원,교육,과외,영어,수학,입시,어학,교습소",
        "kakao_group_code": "AC5",
        "kakao_category_filter": None,
        "order_no": 6,
    },
    {
        "name": "헬스/필라테스",
        "aliases": "헬스,필라테스,요가,짐,운동,피트니스,GX,크로스핏",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 7,
    },
    {
        "name": "인테리어/리모델링",
        "aliases": "인테리어,리모델링,공사,시공,인테리어샵",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 8,
    },
    {
        "name": "반려동물/펫샵",
        "aliases": "펫,강아지,고양이,애견,동물병원,펫샵,반려동물,애묘",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 9,
    },
    {
        "name": "공방/클래스",
        "aliases": "공방,클래스,공예,도자기,목공,캔들,플라워",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 10,
    },
    {
        "name": "PC방/게임방",
        "aliases": "pc방,게임,피시방,PC방,게임방,컴퓨터방",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 11,
    },
    {
        "name": "쥬얼리/액세서리샵",
        "aliases": "쥬얼리,액세서리,반지,목걸이,귀걸이,보석",
        "kakao_group_code": None,
        "kakao_category_filter": None,
        "order_no": 12,
    },
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    inserted = 0
    skipped = 0
    try:
        for bt in BUSINESS_TYPES:
            existing = db.query(BusinessType).filter(BusinessType.name == bt["name"]).first()
            if existing:
                skipped += 1
                print(f"  건너뜀 (이미 존재): {bt['name']}")
            else:
                db.add(BusinessType(**bt))
                inserted += 1
                print(f"  추가: {bt['name']}")
        db.commit()
        print(f"\n완료: {inserted}개 추가, {skipped}개 건너뜀")
    finally:
        db.close()


if __name__ == "__main__":
    main()
