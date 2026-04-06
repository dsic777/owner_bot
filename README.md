# OwnerBot (사장봇)

> 소상공인을 위한 AI 마케팅 콘텐츠 자동 생성 플랫폼

키워드 하나로 네이버 블로그·리뷰·쇼츠 대본·썸네일 문구를 즉시 자동 생성합니다.

---

## 팀 구성

| 이름 | 역할 |
|------|------|
| 유가영 | 팀장 / PM |
| 이제민 | 백엔드 (FastAPI) |
| 박동제 | 프론트엔드 (PC 웹) |
| 김정원 | 프론트엔드 (PC 웹) |
| 유동주 | mockup · ERD · React 모바일 |

---

## 기술 스택

- **백엔드**: FastAPI + SQLAlchemy + SQLite(개발) / PostgreSQL(운영)
- **프론트엔드 (PC)**: HTML + CSS + JavaScript (Jinja2 템플릿)
- **프론트엔드 (모바일)**: React (EC2)
- **AI**: OpenAI GPT-4o (스트리밍)
- **인증**: JWT
- **배포**: AWS EC2 + Nginx

---

## 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/dsic777/owner_bot.git
cd owner_bot

# 2. 가상환경 생성 및 활성화
python -m venv myEnv
myEnv\Scripts\activate        # Windows
# source myEnv/bin/activate   # Mac/Linux

# 3. 패키지 설치
pip install -r requirements.txt

# 4. 환경변수 설정
# backend/.env 파일 생성 후 아래 내용 입력
# DATABASE_URL=sqlite:///./ownerbot.db
# SECRET_KEY=your-secret-key
# OPENAI_API_KEY=your-openai-api-key

# 5. 서버 실행
uvicorn backend.main:app --reload --port 8000
```

API 문서: http://127.0.0.1:8000/docs

---

## 주요 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/generate | 콘텐츠 생성 (스트리밍) |
| GET | /api/history | 생성 이력 조회 |
| GET | /api/mypage/credits | 크레딧 조회 |

---

해커톤 기간: 2026-04-06 ~ 2026-05-14
