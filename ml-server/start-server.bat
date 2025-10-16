@echo off
echo Starting SkillSight AI ML Prediction Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if model file exists
dir *.pkl >nul 2>&1
if errorlevel 1 (
    echo Warning: No .pkl model file found in this directory
    echo Please copy your trained model file here before starting the server
    echo.
    pause
)

echo Starting server...
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
