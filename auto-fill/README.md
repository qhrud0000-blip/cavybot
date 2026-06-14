# 🤖 지침 자동 입력 도우미 (본인 PC 전용)

ChatGPT/Claude **프로젝트 지침**을 브라우저 자동화로 입력하는 도구입니다.
`auto-fill/instructions/*.txt`(공통+프로젝트 합본, 영문 파일명)를 각 프로젝트의 지침 칸에 넣어줍니다.

## 🔒 보안 원칙 (꼭 읽기)
- **비밀번호를 받지 않습니다.** 로그인·2단계 인증은 **열린 브라우저에서 본인이 직접** 합니다.
- 로그인 세션은 `auto-fill/.user-data/` 폴더에 저장되어 재실행 시 재사용됩니다. **이 폴더·config.json은 깃에 올라가지 않습니다(.gitignore).**
- 공용 PC에서는 사용하지 마세요(세션이 남습니다).

## 준비물
- Node.js 18+ 설치

## ⭐ 가장 쉬운 실행 (PowerShell 한 줄 — 매번 최신 지침 자동 반영)

PowerShell에 **아래 한 줄**을 붙여넣고 Enter. 저장소가 없어도 자동으로 받아 실행합니다.
재실행할 때마다 **GitHub 최신 지침을 자동으로 받아 적용**하고, 한 번 입력한 **URL 설정은 유지**됩니다.

> ⚠️ 아래 한 줄은 **PowerShell 창에 그대로 붙여넣어 실행**하세요. (`powershell -Command "..."` 래퍼로 감싸지 마세요 — 변수($t 등)가 미리 풀려 깨집니다.)
> 한글 파일명 깨짐 방지를 위해 **tar**(Windows 10+ 내장)로 압축을 풉니다.

```powershell
$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; $t="$env:TEMP\cb"; Remove-Item $t -Recurse -Force -ErrorAction SilentlyContinue; New-Item -Type Directory -Force $t | Out-Null; Invoke-WebRequest 'https://github.com/qhrud0000-blip/cavybot/archive/refs/heads/claude/cavybot-project-structure-l2aip0.zip' -OutFile "$t\r.zip"; tar -xf "$t\r.zip" -C $t; & (Get-ChildItem "$t\cavybot-*\auto-fill\run.ps1").FullName
```

- 처음 실행: `config.json`이 메모장으로 열림 → 각 프로젝트 url 채우고 저장·닫기.
- 이후 실행: URL은 `%USERPROFILE%\cavybot-auto\config.json`에 보관되어 자동 재사용.
- **더블클릭 실행**: 한 번 받은 뒤 다운로드된 폴더의 `auto-fill\run.bat` 를 더블클릭해도 동일(최신 지침 자동 갱신).

### 지침을 바꾸고 싶을 때 (업데이트 자동화)
1. GitHub에서 `프로젝트-지침/완성본/*.txt` (또는 `00`~`10` 원본)를 웹에서 편집·저장,
2. 위 한 줄(또는 `실행.bat`)을 다시 실행 → **바뀐 지침이 자동 반영**되어 입력됩니다.

---

## 수동 설치 & 실행 (원하면)
```powershell
cd auto-fill
npm.cmd install
npm.cmd run setup        # Playwright용 Chromium 1회 설치
copy config.example.json config.json
notepad config.json      # 각 프로젝트 '실제 URL' 입력 후 저장
npm.cmd start
```
> PowerShell에서 `npm`이 막히면(PSSecurityException) `npm.cmd` 로 쓰거나 먼저 `Set-ExecutionPolicy -Scope Process Bypass` 실행.

## 진행 흐름
1. 브라우저가 뜨면 **ChatGPT(chatgpt.com)·Claude(claude.ai)에 직접 로그인(+2FA)** → 터미널에서 Enter.
2. 스크립트가 프로젝트 URL로 이동합니다. 화면에서 **지침 편집 화면**을 엽니다.
   - ChatGPT: 프로젝트 → ⋮ → **프로젝트 설정 → 지침**
   - Claude: 프로젝트 → **지침 옆 연필(✎)**
3. 입력창이 보이면 Enter → **자동 입력**을 시도합니다.
   - 성공: 내용 확인 후 **저장** 클릭.
   - 실패(레이아웃 변경 등): 텍스트를 **클립보드에 복사**해 두므로 입력창 클릭 후 **Ctrl/⌘+V → 저장**.
4. 저장했으면 Enter → 다음 프로젝트.

## URL은 어디서 얻나
해당 프로젝트를 브라우저에서 연 뒤 **주소창 값**을 복사해 `config.json`의 `url`에 붙여넣으세요.
- 예) Claude: `https://claude.ai/project/xxxxxxxx`
- 예) ChatGPT: 프로젝트 페이지 주소

## 잘 안 될 때
- 자동 입력이 안 잡히면(사이트 UI 변경) `fill.mjs`의 `SELECTORS`에 입력창 선택자를 한 줄 추가하면 됩니다.
- 그래도 안 되면 클립보드 폴백으로 붙여넣기만 하면 되므로 작업은 끝까지 진행됩니다.

> ⚠️ 사이트 약관: 자동화는 본인 계정·본인 작업 편의 목적에 한해 신중히 사용하세요.
