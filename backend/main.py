import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from api.router import api_router

from modules.user.models import User
from modules.generate.models import GenerationHistory, GuestUsage
from modules.history.models import CreditTransaction, Subscription
from modules.business_type.models import BusinessType

app = FastAPI(
    title="사장봇 API",
    description="소상공인 AI 마케팅 콘텐츠 자동 생성 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}

# React 빌드 결과물 서빙 (frontend-react/dist)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend-react", "dist")
if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
