@echo off
echo ========================================
echo  Flip One - Android Build v1.0.4
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo Checking Windows Long Path support...
reg query "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled 2>nul | findstr "0x1" >nul
if %ERRORLEVEL% EQU 0 (
  echo Long paths: ENABLED - building normally.
  goto :build_normal
) else (
  echo Long paths: DISABLED - using short path workaround...
  goto :build_subst
)

:build_subst
:: Get project folder name and parent directory
for %%I in ("%~dp0.") do set PROJ_FOLDER=%%~nxI
for %%I in ("%~dp0..") do set PARENT_DIR=%%~fI

echo Project folder: %PROJ_FOLDER%
echo Creating Z: drive pointing to parent: %PARENT_DIR%
subst Z: /d 2>nul
subst Z: "%PARENT_DIR%"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Could not create virtual drive Z:
  echo.
  echo SOLUTION: Run enable-long-paths.bat as Administrator, restart, then try again.
  pause
  exit /b 1
)

Z:
cd Z:\%PROJ_FOLDER%
goto :install_deps

:build_normal
cd /d "%~dp0"

:install_deps
echo.
echo [1/4] Installing dependencies...
call npm install
call npm uninstall react-native-google-mobile-ads 2>nul

echo.
echo [2/4] Generating Android project...
call node_modules\.bin\expo prebuild --platform android --clean --non-interactive
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Prebuild failed!
  subst Z: /d 2>nul
  pause
  exit /b 1
)

if not exist "android" (
  echo ERROR: android folder missing after prebuild!
  subst Z: /d 2>nul
  pause
  exit /b 1
)

echo.
echo [3/4] Building release AAB...
cd android
call gradlew bundleRelease ^
  -Pandroid.injected.signing.store.file=D:\F\flipone-release.keystore ^
  -Pandroid.injected.signing.key.alias=flipone ^
  -Pandroid.injected.signing.store.password=%KEYSTORE_PASS% ^
  -Pandroid.injected.signing.key.password=%KEYSTORE_PASS%

set BUILD_CODE=%ERRORLEVEL%
cd ..

echo.
if exist "android\app\build\outputs\bundle\release\app-release.aab" (
  echo ========================================
  echo  SUCCESS! AAB file created!
  echo ========================================
  copy "android\app\build\outputs\bundle\release\app-release.aab" "%~dp0app-release.aab" > nul 2>&1
  if exist "%~dp0app-release.aab" (
    echo File copied to: %~dp0app-release.aab
  ) else (
    echo AAB is at: %CD%\android\app\build\outputs\bundle\release\app-release.aab
  )
  echo.
  echo Upload this .aab file to Google Play Console.
) else (
  echo ========================================
  echo  BUILD FAILED! (exit code: %BUILD_CODE%^)
  echo ========================================
  echo Scroll up to see the error.
  echo.
  echo TIP: Run enable-long-paths.bat as Admin then restart and try again.
)

subst Z: /d 2>nul
echo.
pause
