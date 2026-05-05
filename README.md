# 사장봇 (OwnerBot)

> 소상공인을 위한 AI 마케팅 콘텐츠 자동 생성 플랫폼

**사장님의 마케팅, AI가 대신합니다.**
키워드 하나로 블로그·리뷰·쇼츠 대본·썸네일 문구를 즉시 자동 생성합니다.

---

## 접속 방법

### 모바일 (QR 코드 스캔)

<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dsic.duckdns.org/ownerbot/" alt="사장봇 QR코드" width="200"/>

**https://dsic.duckdns.org/ownerbot/**

> Chrome 브라우저에서 접속해 주세요. (PWA 설치 불필요)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 블로그 | 네이버 SEO 최적화 블로그 글 자동 생성 |
| 리뷰 답글 | 고객 리뷰에 대한 사장님 답글 자동 생성 |
| 쇼츠 기획 | 7컷 타임라인 쇼츠 대본 + 촬영 팁 자동 생성 |
| 썸네일 | 썸네일 문구·이미지 가이드·디자인 가이드 자동 생성 |
| 업종 자동 감지 | 상호명 입력 시 AI가 업종 자동 추천 |
| 음성 입력 | 마이크로 가게 정보 음성 입력 지원 |
| 크레딧 | 가입 시 3크레딧 무료 지급 |
| 히스토리 | 생성 이력 조회·재생성·삭제 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript (Vite) |
| 백엔드 | FastAPI (Python 3.11) |
| DB | PostgreSQL (AWS EC2) |
| AI | Claude API (claude-haiku-4-5-20251001) |
| 인증 | JWT |
| CSS | Tailwind CSS |
| 배포 | Docker + AWS EC2 + Nginx |

---

## 팀 구성

| 이름 | 역할 | 담당 |
|------|------|------|
| 유가영 | 팀장 / PM | 서비스 기획, PRD, 와이어프레임 |
| 이제민 | 팀원 | 백엔드 (FastAPI) |
| 박동제 | 팀원 | 프론트엔드 (PC 웹) |
| 김정원 | 팀원 | 프론트엔드 (PC 웹) |
| 유동주 | 1인 개발 | mockup · ERD · React 모바일 · EC2 배포 |

---

## 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/dsic777/owner_bot.git
cd owner_bot

# 2. Python 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# 3. 패키지 설치
pip install -r backend/requirements.txt

# 4. 환경변수 설정 (backend/.env)
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=your-anthropic-api-key
DATABASE_URL=postgresql://user:pass@localhost:5432/ownerbot
V2_DATABASE_URL=postgresql://user:pass@localhost:5432/ownerbot2

# 5. 서버 실행
cd backend
uvicorn main:app --reload --port 8000
```

API 문서: http://127.0.0.1:8000/docs

---

## EC2 배포 방법

```bash
cd ~/portfolio/owner_bot
git pull
docker-compose up --build -d
```

---

## 주요 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 (JWT 발급) |
| POST | /api/generate | 콘텐츠 생성 |
| GET | /api/history | 생성 이력 조회 |
| DELETE | /api/history/{id} | 이력 삭제 |
| GET | /api/mypage/me | 내 정보 조회 |
| GET | /api/mypage/credits | 크레딧 조회 |
| POST | /api/mypage/charge | 크레딧 충전 |
| GET | /api/business-types | 업종 목록 (v2 DB) |
| POST | /api/business-types/detect | 상호명으로 업종 자동 감지 |

---

해커톤: 2026-04-06 ~ 2026-05-14 | Built with FastAPI · React · Claude AI
