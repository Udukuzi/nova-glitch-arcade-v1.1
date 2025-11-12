@echo off
echo ═══════════════════════════════════════════════════════════════
echo   CLEANUP FOR GITHUB - Remove Unnecessary Files
echo ═══════════════════════════════════════════════════════════════
echo.

echo This script will remove temporary and unnecessary documentation
echo files that don't need to be on GitHub.
echo.
echo Files to be removed:
echo   - *_COMPLETE.md
echo   - *_FIXED.md
echo   - *_APPLIED.md
echo   - ISSUES_*.md
echo   - WHY_*.md
echo   - TEST_*.bat
echo   - RECORD_*.bat
echo   - BOT_*.md
echo   - FINAL_*.md (except FINAL_SECURITY_AUDIT.md)
echo   - SESSION_*.md
echo   - PROGRESS_*.md
echo   - trials.json
echo   - README-old.md
echo.

set /p confirm="Continue with cleanup? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cleanup cancelled.
    pause
    exit /b
)

echo.
echo Starting cleanup...
echo.

REM Remove completion docs
del /Q *_COMPLETE.md 2>nul
if %errorlevel% == 0 echo [OK] Removed *_COMPLETE.md files

REM Remove fix docs
del /Q *_FIXED.md 2>nul
if %errorlevel% == 0 echo [OK] Removed *_FIXED.md files

REM Remove applied docs
del /Q *_APPLIED.md 2>nul
if %errorlevel% == 0 echo [OK] Removed *_APPLIED.md files

REM Remove issues docs
del /Q ISSUES_*.md 2>nul
if %errorlevel% == 0 echo [OK] Removed ISSUES_*.md files

REM Remove why docs
del /Q WHY_*.md 2>nul
if %errorlevel% == 0 echo [OK] Removed WHY_*.md files

REM Remove test bats
del /Q TEST_*.bat 2>nul
if %errorlevel% == 0 echo [OK] Removed TEST_*.bat files

REM Remove record bats
del /Q RECORD_*.bat 2>nul
if %errorlevel% == 0 echo [OK] Removed RECORD_*.bat files

REM Remove bot docs
del /Q BOT_*.md 2>nul
if %errorlevel% == 0 echo [OK] Removed BOT_*.md files

REM Remove final docs (keep FINAL_SECURITY_AUDIT.md)
for %%f in (FINAL_*.md) do (
    if not "%%f"=="FINAL_SECURITY_AUDIT.md" (
        del /Q "%%f" 2>nul
        echo [OK] Removed %%f
    )
)

REM Remove session docs
del /Q SESSION_*.md 2>nul
if %errorlevel% == 0 echo [OK] Removed SESSION_*.md files

REM Remove progress docs
del /Q PROGRESS_*.md 2>nul
if %errorlevel% == 0 echo [OK] Removed PROGRESS_*.md files

REM Remove trials.json
del /Q telegram-bot\trials.json 2>nul
if %errorlevel% == 0 echo [OK] Removed telegram-bot/trials.json

REM Remove old README
del /Q README-old.md 2>nul
if %errorlevel% == 0 echo [OK] Removed README-old.md

REM Remove demo files (keep guides)
del /Q DEMO_QUICK_REFERENCE.txt 2>nul
if %errorlevel% == 0 echo [OK] Removed DEMO_QUICK_REFERENCE.txt

echo.
echo ═══════════════════════════════════════════════════════════════
echo   CLEANUP COMPLETE!
echo ═══════════════════════════════════════════════════════════════
echo.
echo Remaining important files:
echo   ✓ README.md
echo   ✓ WHITEPAPER.md
echo   ✓ GITHUB_DEPLOYMENT_GUIDE.md
echo   ✓ DEMO_RECORDING_GUIDE.md
echo   ✓ DEMO_NARRATION_SCRIPT.md
echo   ✓ .gitignore
echo   ✓ Source code
echo.
echo Your repository is now clean and ready for GitHub!
echo.
echo Next steps:
echo   1. Review GITHUB_DEPLOYMENT_GUIDE.md
echo   2. Choose a deployment method
echo   3. Push to GitHub
echo.
pause
