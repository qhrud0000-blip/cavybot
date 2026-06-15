# cavybot 지침 자동 입력 실행기 (이 파일이 있는 폴더에서 동작)
# - run.bat / 한 줄 부트스트랩이 매번 GitHub 최신본을 받아 이 스크립트를 실행합니다(지침 자동 업데이트).
# - 한 번 입력한 프로젝트 URL은 %USERPROFILE%\cavybot-auto\config.json 에 보관되어 재사용됩니다.

$ErrorActionPreference = "Stop"
try { chcp 65001 > $null } catch {}
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Set-Location $PSScriptRoot                      # auto-fill 폴더
$Base    = Join-Path $HOME "cavybot-auto"
$SaveCfg = Join-Path $Base "config.json"
New-Item -ItemType Directory -Force -Path $Base | Out-Null

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js(npm)가 없습니다. https://nodejs.org 에서 LTS 설치 후 다시 실행하세요." -ForegroundColor Red
  Write-Host "(winget: winget install OpenJS.NodeJS.LTS)" -ForegroundColor DarkGray
  Read-Host "Enter로 종료"; exit 1
}

# 1) config.json 준비 (이전 URL 복원)
if (Test-Path $SaveCfg) { Copy-Item $SaveCfg "config.json" -Force }
elseif (-not (Test-Path "config.json")) { Copy-Item "config.example.json" "config.json" -Force }

# 2) 의존성 설치 (처음만 오래 걸림)
Write-Host "[설치] npm install ..." -ForegroundColor Cyan
& npm.cmd install
Write-Host "[설치] Playwright Chromium ..." -ForegroundColor Cyan
& npm.cmd run setup

# 3) 최초엔 URL 입력받기
if (-not (Test-Path $SaveCfg)) {
  Write-Host "config.json 이 열립니다. 각 프로젝트 url 채우고 저장 후 닫으세요." -ForegroundColor Yellow
  Start-Process notepad "config.json" -Wait
}
Copy-Item "config.json" $SaveCfg -Force       # 최신 URL 보관

# 4) 자동 입력 시작
Write-Host "[실행] 브라우저가 뜨면 직접 로그인(+2FA) 후 안내대로 진행하세요." -ForegroundColor Green
& npm.cmd start
