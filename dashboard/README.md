# cavybot 대시보드 (인터랙티브)

드래그로 카테고리·메뉴 위치를 자유롭게 옮기는 단일 페이지 대시보드입니다.

## 실행 방법

- **⭐ 가장 간단 (설정 0):** [`cavybot-dashboard.html`](cavybot-dashboard.html) **하나만 더블클릭**.
  - CSS·JS·MCP 추천 데이터가 모두 안에 들어있어(단일 파일) 서버·인터넷 없이 열립니다.
  - 다시 빌드: `node scripts/build-standalone.mjs`
  - (단일 파일을 repo 밖으로 옮기면 `../프롬프트` 같은 내부 문서 링크만 끊깁니다. 외부 링크·금고·MCP·파일보관함은 정상)
- **분리형:** `dashboard/index.html`을 열기.
  - 단, 일부 브라우저는 `file://`에서 `fetch`(MCP 추천 데이터 로드)를 막습니다. 그럴 땐 아래 로컬 서버 사용.
- **권장(로컬 서버):**
  ```bash
  cd dashboard
  python3 -m http.server 8080
  # 브라우저에서 http://localhost:8080
  ```
- **배포:** GitHub Pages로 `dashboard/` 폴더를 그대로 호스팅 가능.

## 🚀 먼저 할 일

자동화 스택 무료 가입은 [`무료가입-체크리스트.md`](무료가입-체크리스트.md)를 따라 하세요.
(카드 없이 시작하는 추천 조합: 쿠팡파트너스 + n8n + Firecrawl + Canva/Gamma + Arting)

## 기능

- 🟦 **카테고리(컬럼)와 메뉴(아이템) 드래그 이동** — 위치는 브라우저(localStorage)에 저장. `↺ 초기화`로 복원.
- ✏️ **추가·수정·복사·삭제(CRUD)** — 카드/메뉴에 마우스를 올리면 `＋ ✎ ⧉ 🗑` 버튼. 맨 끝 `＋ 카테고리 추가`로 새 카테고리.
- 🕷️ **크롤링 카테고리 → 하위 "추천" → 🔌 MCP 추천 버튼** — 클릭 시 무료 도구·MCP 목록 패널.
- ⭐ **오늘의 추천(매일 갱신)** — 날짜 기반 로테이션. `dashboard/data/daily.json`을 GitHub Actions가 매일 자동 갱신.

## 데이터 / 자동 갱신

- `data/mcp-recommendations.json` — 추천 도구 마스터 풀(직접 편집해서 항목 추가/수정).
- `data/daily.json` — '오늘의 추천'(자동 생성, 수동 편집 불필요).
- `../scripts/update-daily.mjs` — 마스터 풀에서 오늘의 추천을 뽑는 스크립트. 로컬 실행: `node scripts/update-daily.mjs`.
- `../.github/workflows/daily-mcp-update.yml` — 매일 1회(KST 06:05) 자동 실행·커밋. (예약 실행은 기본 브랜치 기준으로 동작)

## 새 카테고리/메뉴 추가

`app.js`의 `DEFAULT_BOARD` 배열을 편집하세요. 항목 형태:
- 링크: `{ id, label, url }`
- 하위 카테고리 헤더: `{ id, type: "sub", label }`
- 특수 버튼: `{ id, label, action: "openMcp", cta: true }`
