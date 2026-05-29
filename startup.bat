@echo off
setlocal enabledelayedexpansion

title AI + AlphaFold Alcoholism Research Platform - Environment Dashboard
color 0B

echo =======================================================================
echo   🧬 AI + AlphaFold Alcoholism Research Platform - Environment Status
echo =======================================================================
echo.

:: 1. Check Python Virtual Environment
echo [VIRTUAL ENVIRONMENT]
if exist ".venv\Scripts\activate.bat" (
    echo   [✓] Python .venv detected.
    echo   [i] To activate the virtual environment and run PyTorch tasks, run:
    echo       .\.venv\Scripts\activate
) else (
    echo   [X] Python .venv not found.
)
echo.

:: 2. Check Local Scientific Tools
echo [LOCAL SCIENTIFIC TOOLS]

:: Check AutoDock Vina
if exist "tools\vina.exe" (
    echo   [✓] AutoDock Vina : Installed (tools\vina.exe)
) else (
    echo   [X] AutoDock Vina : Missing
)

:: Check PLINK
if exist "tools\plink.exe" (
    echo   [✓] PLINK v1.9    : Installed (tools\plink.exe)
) else (
    echo   [X] PLINK v1.9    : Missing
)

:: Check GATK
if exist "tools\gatk\gatk-package-4.6.2.0-local.jar" (
    echo   [✓] GATK v4.6.2.0 : Installed (tools\gatk\...)
) else (
    echo   [X] GATK v4.6.2.0 : Missing
)
echo.

echo =======================================================================
echo   🚀 Starting Local Web Server...
echo =======================================================================
echo.

:: Check for Python first (starts instantly, no dependency downloads)
where python >nul 2>nul
if !ERRORLEVEL! equ 0 (
    echo [STATUS] Starting local Python server...
    echo [STATUS] URL: http://localhost:8000
    echo.
    echo Press Ctrl+C in this terminal to stop the server.
    echo.
    :: Launch browser
    start "" "http://localhost:8000"
    python server.py
    goto end
)

:: Check for Node.js (npx serve)
where node >nul 2>nul
if !ERRORLEVEL! equ 0 (
    echo [STATUS] Starting local Node.js server...
    echo [STATUS] URL: http://localhost:8000
    echo.
    echo Press Ctrl+C in this terminal to stop the server.
    echo.
    :: Launch browser
    start "" "http://localhost:8000"
    npx -y serve -l 8000 .
    goto end
)

:: Fallback if neither server is available
echo [WARNING] Neither Python nor Node.js was found in your system PATH.
echo [WARNING] ES6 modules and API requests may fail due to browser CORS policies.
echo.
set /p CHOICE="Would you like to open the index.html file directly in your browser? (Y/N): "
if /i "!CHOICE!"=="Y" (
    echo.
    echo Opening index.html directly...
    start "" "index.html"
) else (
    echo.
    echo Startup canceled.
)

:end
pause
