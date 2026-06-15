# 외부(모바일) 원격 작업용 PC 세팅
# - 전원 연결 시 절전/최대절전을 꺼서 노트북이 깨어 있게(원격 접속·자동작업 가능) 합니다.
# - 노트북 덮개를 닫아도 꺼지지 않게 합니다.
# 실행(관리자 PowerShell 권장):  powershell -ExecutionPolicy Bypass -File remote-work-setup.ps1
# 되돌리기:  powercfg /change standby-timeout-ac 30   (원하는 분으로)

$ErrorActionPreference = "Continue"
try { chcp 65001 > $null } catch {}
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

Write-Host "=== 외부 작업용 PC 세팅 시작 ===" -ForegroundColor Green

# 1) 전원 연결(AC) 시 절전/최대절전/디스크 끄기 (화면은 꺼져도 무방)
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change disk-timeout-ac 0
Write-Host "[OK] 전원 연결 시 절전/최대절전 해제" -ForegroundColor Cyan

# 2) 노트북 덮개 닫아도 안 꺼지게 (전원 연결 시 동작 = 아무것도 안 함)
#    GUID: 전원 단추 및 덮개 / 덮개 닫기 동작 / 0=아무것도 안 함
powercfg /setacvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0
powercfg /setactive SCHEME_CURRENT
Write-Host "[OK] 덮개 닫을 때(전원 연결) = 아무것도 안 함" -ForegroundColor Cyan

# 3) 현재 설정 요약 출력
Write-Host "`n현재 전원 설정 요약:" -ForegroundColor Yellow
powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 2>$null | Select-String "현재|AC|Index" | ForEach-Object { $_.Line }

Write-Host @"

=== 다음 할 일 (수동, 한 번만) ===
1) 크롬 원격 데스크톱 설치/켜기: https://remotedesktop.google.com/access  (PIN 설정)
2) 폰에 'Chrome Remote Desktop' 앱 설치 → 같은 구글계정 로그인 → 이 PC 접속
3) 외출 전 체크: 전원 어댑터 꽂기 / 원격 켜져 있는지 확인

※ 보안: PIN은 길게, 안 쓸 땐 원격 끄기.
※ 되돌리기(다시 절전): powercfg /change standby-timeout-ac 30
"@ -ForegroundColor Green

Read-Host "`nEnter로 종료"
