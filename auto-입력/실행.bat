@echo off
chcp 65001 >nul
REM cavybot 지침 자동 입력 - 더블클릭 실행기
REM 매번 GitHub 최신 지침을 받아 적용합니다. URL 설정은 유지됩니다.
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; $t=$env:TEMP; iwr 'https://github.com/qhrud0000-blip/cavybot/archive/refs/heads/claude/cavybot-project-structure-l2aip0.zip' -OutFile $t\cavybot.zip; Expand-Archive $t\cavybot.zip $t\cavybot -Force; & (gci $t\cavybot\cavybot-*\auto-입력\run.ps1).FullName"
pause
