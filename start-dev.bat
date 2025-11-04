@echo off
REM Colors and formatting for Windows
setlocal enabledelayedexpansion

echo.
echo Starting AI Resume Screening Tool...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
)

echo Setup complete!
echo.
echo Starting servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in a new window
start "Backend Server" cmd /k npm run server:dev

REM Wait a bit for backend to start
timeout /t 2 /nobreak

REM Start frontend in a new window
start "Frontend Server" cmd /k npm run frontend

echo.
echo Both servers are starting in separate windows...
