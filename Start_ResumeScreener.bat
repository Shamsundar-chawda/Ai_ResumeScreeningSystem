@echo off
title AI Resume Screening System
echo ============================================
echo    AI Resume Screening System - Starting...
echo ============================================
echo.

:: Start Backend
echo [1/2] Starting Backend (Spring Boot)...
start "Backend - Spring Boot" cmd /k "cd /d C:\Users\User\Desktop\ResumeScreeningSystem\backend && .\mvnw.cmd spring-boot:run"

:: Wait a moment before starting frontend
timeout /t 5 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend (React)...
start "Frontend - React" cmd /k "cd /d C:\Users\User\Desktop\ResumeScreeningSystem\frontend && npm run dev"

:: Wait for servers to be ready
echo.
echo Waiting for servers to start...
timeout /t 25 /nobreak >nul

:: Open browser
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ============================================
echo    Both servers are running!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8081
echo ============================================
echo.
echo Close this window anytime. To stop servers,
echo close the Backend and Frontend windows.
pause
