# cavybot 지침 자동 입력 실행기
# - 실행할 때마다 GitHub에서 '최신 지침'을 자동으로 받아 적용합니다(지침 업데이트 자동화).
# - 한 번 입력한 프로젝트 URL(config.json)은 $HOME\cavybot-auto\config.json 에 보관되어 계속 재사용됩니다.
# 사용: PowerShell에서  powershell -ExecutionPolicy Bypass -File run.ps1   또는  실행.bat 더블클릭

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Branch  = "claude/cavybot-project-structure-l2aip0"
$Base    = Join-Path $HOME "cavybot-auto"
$Repo    = Join-Path $Base "repo"
$SaveCfg = Join-Path $Base "config.json"     # URL 영구 보관 위치
New-Item -ItemType Directory -Force -Path $Base | Out-Null

function Need-Node {
  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js(npm)가 없습니다. https://nodejs.org 에서 LTS 설치 후 다시 실행하세요." -ForegroundColor Red
    Write-Host "   (winget이 있으면: winget install OpenJS.NodeJS.LTS )" -ForegroundColor DarkGray
    Read-Host "Enter로 종료"; exit 1
  }
}

try {
  Need-Node

  Write-Host "[1/5] 최신 지침 다운로드..." -ForegroundColor Cyan
  $zip = Join-Path $Base "repo.zip"
  Invoke-WebRequest "https://github.com/qhrud0000-blip/cavybot/archive/refs/heads/$Branch.zip" -OutFile $zip
  if (Test-Path $Repo) { Remove-Item $Repo -Recurse -Force }
  Expand-Archive $zip -DestinationPath $Repo -Force
  $proj = Join-Path ((Get-ChildItem -Directory (Join-Path $Repo "cavybot-*"))[0].FullName) "auto-입력"
  Set-Location $proj

  Write-Host "[2/5] 설정(config.json) 준비..." -ForegroundColor Cyan
  if (Test-Path $SaveCfg) { Copy-Item $SaveCfg "config.json" -Force }   # 이전 URL 복원
  elseif (-not (Test-Path "config.json")) { Copy-Item "config.example.json" "config.json" -Force }

  Write-Host "[3/5] 의존성 설치(처음만 시간 걸림)..." -ForegroundColor Cyan
  & npm.cmd install
  & npm.cmd run setup

  if (-not (Test-Path $SaveCfg)) {
    Write-Host "[4/5] config.json 이 메모장으로 열립니다. 각 프로젝트 url 채우고 저장 후 닫으세요." -ForegroundColor Yellow
    Start-Process notepad "config.json" -Wait
  } else {
    Write-Host "[4/5] 저장된 URL 설정을 사용합니다. (수정하려면: notepad `"$SaveCfg`")" -ForegroundColor Cyan
  }
  Copy-Item "config.json" $SaveCfg -Force   # 최신 URL 보관

  Write-Host "[5/5] 브라우저 실행 → 직접 로그인(+2FA) 후 안내대로 진행하세요." -ForegroundColor Green
  & npm.cmd start
}
catch {
  Write-Host "`n❌ 오류: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host "Enter로 종료"
}
