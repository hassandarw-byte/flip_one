@echo off
echo ========================================
echo  Flip One - Android Build v1.0.4
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Generating Android project...
call node_modules\.bin\expo prebuild --platform android --clean --non-interactive
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Prebuild failed!
  pause
  exit /b 1
)

if not exist "android" (
  echo ERROR: android folder missing after prebuild!
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
  copy "android\app\build\outputs\bundle\release\app-release.aab" "app-release.aab" > nul
  echo File ready at: %CD%\app-release.aab
  echo Upload this file to Google Play Console.
) else (
  echo ========================================
  echo  BUILD FAILED! (exit code: %BUILD_CODE%^)
  echo ========================================
  echo Scroll up to see the error.
)

echo.
pause
