@echo off
chcp 65001 >nul
REM cavybot 지침 자동 입력 - 더블클릭 실행기
REM 매번 GitHub 최신 지침을 받아 적용합니다. URL 설정은 유지됩니다.
REM 한글 파일명 깨짐 방지를 위해 tar로 압축 해제합니다(Windows 10+ 내장).
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue';[Net.ServicePointManager]::SecurityProtocol='Tls12';$t=Join-Path $env:TEMP 'cb';Remove-Item $t -Recurse -Force -ErrorAction SilentlyContinue;New-Item -Type Directory -Force $t ^| Out-Null;Invoke-WebRequest 'https://github.com/qhrud0000-blip/cavybot/archive/refs/heads/claude/cavybot-project-structure-l2aip0.zip' -OutFile (Join-Path $t 'r.zip');tar -xf (Join-Path $t 'r.zip') -C $t;$rp=(Get-ChildItem (Join-Path $t 'cavybot-*\auto-fill\run.ps1')).FullName;powershell -NoProfile -ExecutionPolicy Bypass -File $rp"
pause
