@echo off
echo ========================================
echo  Enable Windows Long Path Support
echo  (Run this ONCE as Administrator)
echo ========================================
echo.

:: Check if running as admin
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Please right-click this file and select "Run as Administrator"
  echo.
  pause
  exit /b 1
)

echo Enabling Windows Long Path support...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

if %ERRORLEVEL% EQU 0 (
  echo.
  echo SUCCESS! Long Path support enabled.
  echo.
  echo Please RESTART your computer, then run build-android.bat
) else (
  echo.
  echo ERROR: Could not enable Long Path support.
)

echo.
pause
