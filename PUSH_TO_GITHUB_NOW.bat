@echo off
color 0A
cls

echo.
echo ═══════════════════════════════════════════════════════════════
echo   PUSH TO GITHUB - Quick Start
echo ═══════════════════════════════════════════════════════════════
echo.

echo This script will help you push Nova Glitch Arcade to GitHub.
echo.
echo ✅ Your repository is ready with:
echo    - Professional README.md
echo    - Comprehensive WHITEPAPER.md
echo    - Security hardened (.gitignore)
echo    - No secrets exposed
echo    - Clean code structure
echo.

echo ═══════════════════════════════════════════════════════════════
echo   CHOOSE YOUR METHOD:
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. GitHub Desktop (Easiest - Recommended for beginners)
echo 2. Git Command Line (Traditional)
echo 3. Open Deployment Guide (See all 5 methods)
echo 4. Run Cleanup First (Remove temp files)
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto github_desktop
if "%choice%"=="2" goto git_cli
if "%choice%"=="3" goto open_guide
if "%choice%"=="4" goto cleanup
if "%choice%"=="5" goto end

echo Invalid choice. Please try again.
pause
goto start

:github_desktop
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   METHOD 1: GITHUB DESKTOP
echo ═══════════════════════════════════════════════════════════════
echo.
echo STEP 1: Install GitHub Desktop
echo    Download from: https://desktop.github.com/
echo    Install and sign in with your GitHub account
echo.
echo STEP 2: Create Repository on GitHub.com
echo    1. Go to: https://github.com/new
echo    2. Repository name: nova-glitch-arcade
echo    3. Description: AI-powered competitive gaming platform on Solana
echo    4. Make it PUBLIC (for hackathon)
echo    5. DO NOT initialize with README
echo    6. Click "Create repository"
echo.
echo STEP 3: Add to GitHub Desktop
echo    1. Open GitHub Desktop
echo    2. File -^> Add Local Repository
echo    3. Choose this folder
echo    4. Click "Add Repository"
echo.
echo STEP 4: Commit and Push
echo    1. Summary: "Initial commit - Nova Glitch Arcade v1.1"
echo    2. Click "Commit to main"
echo    3. Click "Publish repository"
echo    4. UNCHECK "Keep this code private"
echo    5. Click "Publish"
echo.
echo ✅ DONE! Your code will be on GitHub!
echo.
echo Opening GitHub Desktop download page...
start https://desktop.github.com/
echo.
pause
goto end

:git_cli
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   METHOD 2: GIT COMMAND LINE
echo ═══════════════════════════════════════════════════════════════
echo.
echo STEP 1: Create Repository on GitHub.com
echo    1. Go to: https://github.com/new
echo    2. Repository name: nova-glitch-arcade
echo    3. Description: AI-powered competitive gaming platform on Solana
echo    4. Make it PUBLIC
echo    5. DO NOT initialize with README
echo    6. Click "Create repository"
echo.
echo STEP 2: Run these commands:
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit - Nova Glitch Arcade v1.1"
echo    git remote add origin https://github.com/YOUR_USERNAME/nova-glitch-arcade.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Replace YOUR_USERNAME with your actual GitHub username!
echo.
set /p run_now="Run these commands now? (Y/N): "
if /i "%run_now%"=="Y" (
    echo.
    echo Initializing git...
    git init
    
    echo.
    echo Adding files...
    git add .
    
    echo.
    echo Committing...
    git commit -m "Initial commit - Nova Glitch Arcade v1.1"
    
    echo.
    echo ⚠️ IMPORTANT: Create the repository on GitHub.com first!
    echo Then run these commands manually:
    echo.
    echo    git remote add origin https://github.com/YOUR_USERNAME/nova-glitch-arcade.git
    echo    git branch -M main
    echo    git push -u origin main
    echo.
    echo Opening GitHub new repository page...
    start https://github.com/new
)
echo.
pause
goto end

:open_guide
cls
echo.
echo Opening GITHUB_DEPLOYMENT_GUIDE.md...
echo.
echo This guide includes 5 methods:
echo    1. GitHub Desktop
echo    2. Git Command Line
echo    3. JetBrains IDEs
echo    4. VS Code
echo    5. Netlify CLI
echo.
start GITHUB_DEPLOYMENT_GUIDE.md
pause
goto end

:cleanup
cls
echo.
echo Running cleanup script...
echo.
call CLEANUP_FOR_GITHUB.bat
goto start

:end
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   HELPFUL RESOURCES
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📄 GITHUB_READY_SUMMARY.md - Complete summary of what's ready
echo 📘 GITHUB_DEPLOYMENT_GUIDE.md - Detailed deployment guide
echo ✅ HACKATHON_READY_CHECKLIST.md - Submission checklist
echo 📝 README.md - Professional GitHub README
echo 📖 WHITEPAPER.md - Technical whitepaper
echo.
echo ═══════════════════════════════════════════════════════════════
echo   QUICK LINKS
echo ═══════════════════════════════════════════════════════════════
echo.
echo Create Repository: https://github.com/new
echo GitHub Desktop: https://desktop.github.com/
echo Git Download: https://git-scm.com/downloads
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo Your Nova Glitch Arcade is ready for GitHub! 🚀
echo.
pause
