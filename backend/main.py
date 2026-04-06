from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from backend.database import Base, engine
from backend.routers import auth, generate, history, mypage

# 테이블 자동 생성 (운영 시 Alembic으로 교체)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OwnerBot API",
    description="소상공인 AI 마케팅 콘텐츠 자동 생성",
    version="1.0.0",
)

# 정적 파일 / 템플릿
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
templates = Jinja2Templates(directory="backend/templates")

# 라우터 등록
app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(history.router)
app.include_router(mypage.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "OwnerBot"}
