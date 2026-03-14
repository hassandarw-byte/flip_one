@echo off
echo ========================================
echo  Flip One - Android Build v1.0.4
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo Creating short virtual drive Z: to avoid Windows path length limit...
subst Z: /d 2>nul
subst Z: "%~dp0"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Could not create virtual drive Z:
  pause
  exit /b 1
)
echo Drive Z: created pointing to: %~dp0

echo.
echo [1/4] Installing dependencies...
Z:
cd Z:\
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
  echo ERROR: android folder not found after prebuild!
  subst Z: /d 2>nul
  pause
  exit /b 1
)
echo Android folder ready.

echo.
echo [3/4] Building release AAB...
echo (Building from short path Z:\ to avoid 260-char limit)
echo.
cd android
call gradlew bundleRelease ^
  -Pandroid.injected.signing.store.file=D:\F\flipone-release.keystore ^
  -Pandroid.injected.signing.key.alias=flipone ^
  -Pandroid.injected.signing.store.password=%KEYSTORE_PASS% ^
  -Pandroid.injected.signing.key.password=%KEYSTORE_PASS%

set BUILD_CODE=%ERRORLEVEL%
cd Z:\

echo.
if exist "Z:\android\app\build\outputs\bundle\release\app-release.aab" (
  echo ========================================
  echo  SUCCESS! AAB file created!
  echo ========================================
  copy "Z:\android\app\build\outputs\bundle\release\app-release.aab" "%~dp0app-release.aab" > nul
  echo File ready at: %~dp0app-release.aab
  echo.
  echo You can now upload this file to Google Play Console.
) else (
  echo ========================================
  echo  BUILD FAILED! (exit code: %BUILD_CODE%^)
  echo ========================================
  echo.
  echo Scroll up in this window to see the error details.
)

echo.
echo Cleaning up virtual drive Z:...
subst Z: /d 2>nul

echo.
pause
