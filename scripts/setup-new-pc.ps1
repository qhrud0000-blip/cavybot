# 새 노트북 빠른 세팅 (Windows) — 필수 프로그램 한 번에 설치
# 실행: PowerShell(관리자)에서  powershell -ExecutionPolicy Bypass -File 새노트북-빠른세팅.ps1
# winget(Windows 패키지 관리자, Win10/11 기본 탑재)으로 설치합니다.

$ErrorActionPreference = "Continue"

# 필요에 맞게 추가/삭제하세요
$apps = @(
  "OpenJS.NodeJS.LTS",       # Node.js (cavybot 자동화용)
  "Git.Git",                 # Git
  "Google.Chrome",           # 크롬(북마크/비번 계정 동기화)
  "Microsoft.Edge",          # 엣지(이미 있으면 무시됨)
  "Bitwarden.Bitwarden",     # 비밀번호 매니저(크로스 디바이스 자동입력)
  "7zip.7zip",               # 압축
  "Notepad++.Notepad++"      # 텍스트 편집
)

Write-Host "=== 새 노트북 필수 프로그램 설치 시작 ===" -ForegroundColor Green
foreach ($a in $apps) {
  Write-Host "▶ 설치: $a" -ForegroundColor Cyan
  winget install --id $a -e --accept-package-agreements --accept-source-agreements
}

Write-Host "`n=== 완료 ===" -ForegroundColor Green
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host " 1) 크롬 실행 → 구글 계정 로그인 → '동기화 켜기' → 북마크/비밀번호 자동 복원"
Write-Host " 2) Bitwarden 실행 → 로그인 → 사이트 비밀번호 자동입력 사용"
Write-Host " 3) cavybot 자동화: auto-입력 한 줄 실행기로 지침 자동 입력"
Read-Host "Enter로 종료"
