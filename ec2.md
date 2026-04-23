# 사장봇 (OwnerBot) — EC2 배포 & 팀 협업 규칙

> 2026-04 | 발표: 2026-05-14 | 작성: 유가영

---

## 1. 서버 현황 & 구분

| 구분 | 서버 이름 | 담당자 | 용도 |
|------|----------|--------|------|
| 테스트 서버 | ownerbot-test-gy | 유가영 | 기능 테스트, 오류 사전 확인 — 도메인 연결 안 함 |
| 운영 서버 (예정) | ownerbot-prod-jw | 김정원 | 최종 발표용 — 발표 전 도메인 + HTTPS 연결 |

> ⚠️ **서버 혼용 금지** — 키페어/접속 정보를 서로 섞지 않기. 도메인 연결은 최종 서버 1대에만. 발표 D-3일에 최종 서버 1개 공식 결정.

---

## 2. 접속 정보 (팀 공유용)

> ※ 실제 IP와 키 파일 위치는 아래 표에 채워서 팀 단톡에 공유해주세요.

| 항목 | 값 |
|------|----|
| EC2 퍼블릭 IP | → 직접 채우기 |
| 접속 유저명 | ubuntu |
| SSH 키 파일 | ownerbot-test-gy.pem (가영님 보관) |
| 접속 명령어 | `ssh -i ownerbot-test-gy.pem ubuntu@[퍼블릭IP]` |
| 서버 확인 주소 | http://[퍼블릭IP]:8000/health |
| API 문서 | http://[퍼블릭IP]:8000/docs |

---

## 3. 환경변수 (.env.prod) 항목 목록

> 실제 값은 단톡에 공유하지 않아요. 항목 목록만 공유하고 각자 서버에서 직접 입력해요.

| 변수명 | 용도 | 비고 |
|--------|------|------|
| OPENAI_API_KEY | OpenAI API 호출용 | OpenAI 콘솔에서 발급 |
| SECRET_KEY | JWT 서명용 | 32자 이상 랜덤 문자열 |
| DATABASE_URL | DB 연결 문자열 | `sqlite:///./owner_bot.db` |
| ALGORITHM | JWT 알고리즘 | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | 토큰 만료 시간 | 60 |
| ENV | 환경 구분 | production |

**누락 시 발생하는 오류:**
- `OPENAI_API_KEY` 누락 → 콘텐츠 생성 500 에러
- `SECRET_KEY` 누락 → 로그인/JWT 500 에러
- `DATABASE_URL` 누락 → 서버 시작 실패

---

## 4. 공통 배포 명령어 (팀 통일)

> ⚠️ **명령어 통일 필수** — 누군가는 docker-compose, 누군가는 docker compose, 다른 yml 파일로 실행하면 서버 상태가 달라져요. 아래 명령어만 사용해요.

### 최초 배포

```bash
git clone https://github.com/gyullby11/owner_bot.git
cd owner_bot
cp backend/.env.prod.example backend/.env.prod
nano backend/.env.prod   # 실제 값 입력
docker compose -f docker-compose.prod.yml up -d --build
```

### 코드 업데이트 후 재배포

```bash
cd ~/owner_bot
git pull origin main   # 또는 발표용 브랜치
docker compose -f docker-compose.prod.yml up -d --build
```

### 서버 상태 확인

```bash
docker compose ps
docker compose logs -f
```

### 서버 중지

```bash
docker compose -f docker-compose.prod.yml down
```

---

## 5. 배포 기준 브랜치 규칙

> ✅ 서버에서 직접 코드 수정 절대 금지 — 수정은 git에서, 서버는 pull만

| 시점 | 배포 브랜치 |
|------|------------|
| 지금 ~ 5월 10일 | dev 브랜치 (테스트 서버만) |
| 5월 10일 ~ 13일 | main 브랜치로 전환, 기능 동결 |
| 5월 14일 발표 | main 브랜치 최신 커밋 기준 서버 1대만 운영 |

---

## 6. DB 관련 주의사항

> ⚠️ **발표 시연 데이터 날아가지 않게 주의**
> 현재 SQLite 사용 중. Docker 컨테이너 재시작 시 데이터가 날아갈 수 있음.

### Volume 설정 확인

```yaml
# docker-compose.prod.yml에 아래 volume 설정 있는지 확인
volumes:
  - sqlite_data:/app/owner_bot.db
```

### 발표 전날 체크리스트

- [ ] 회원가입 테스트 계정 미리 만들어두기
- [ ] 크레딧 충분히 충전해두기
- [ ] 콘텐츠 생성 1회 테스트 후 히스토리 확인
- [ ] 서버 재시작 후 데이터 유지되는지 확인

---

## 7. 발표 전날 최종 체크리스트

- [ ] 최종 서버 1대 공식 결정 (테스트 or 운영)
- [ ] main 브랜치 최신 코드 배포 확인
- [ ] `http://[퍼블릭IP]:8000/health` 응답 확인
- [ ] 회원가입 → 로그인 → 콘텐츠 생성 전체 플로우 테스트
- [ ] DB 데이터 유지 확인 (서버 재시작 후)
- [ ] 현재 서버 커밋 해시 기록 (`git log --oneline -1`)
- [ ] `.env.prod` 항목 누락 없는지 확인
- [ ] CORS 오류 없는지 브라우저 콘솔 확인

---

## 8. 자주 생기는 오류 & 해결법

| 오류 | 원인 | 해결법 |
|------|------|--------|
| 500 Internal Server Error | OPENAI_API_KEY 누락 또는 잘못됨 | `.env.prod` 확인 후 docker compose 재시작 |
| CORS 오류 | 서버 도메인/IP가 CORS 허용 목록에 없음 | `main.py` allow_origins에 EC2 IP 추가 |
| 포트 8000 접속 안 됨 | AWS 보안 그룹에 포트 8000 미개방 | EC2 보안 그룹 인바운드 규칙에 8000 추가 |
| DB 데이터 사라짐 | 컨테이너 재시작 시 volume 미설정 | docker-compose.prod.yml volume 확인 |
| git pull 안 됨 | 서버에서 직접 파일 수정한 경우 | `git stash` 또는 `git checkout -- .` 후 pull |
