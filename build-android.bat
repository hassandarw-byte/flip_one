@echo off
echo ========================================
echo    Flip One - Android Build Script
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo [1/4] Installing dependencies...
call npm install
call npm install react-native-google-mobile-ads

echo.
echo [2/4] Generating Android project...
call npx expo prebuild --platform android --clean

echo.
echo [3/4] Building release AAB (this may take 3-5 minutes)...
cd android
call gradlew bundleRelease ^
  -Pandroid.injected.signing.store.file=D:\F\flipone-release.keystore ^
  -Pandroid.injected.signing.key.alias=flipone ^
  -Pandroid.injected.signing.store.password=%KEYSTORE_PASS% ^
  -Pandroid.injected.signing.key.password=%KEYSTORE_PASS% ^
  > ..\build-log.txt 2>&1

set BUILD_RESULT=%ERRORLEVEL%
cd ..

echo.
if %BUILD_RESULT% EQU 0 (
  echo [4/4] BUILD SUCCEEDED!
  echo.
  echo AAB file is ready at:
  echo android\app\build\outputs\bundle\release\app-release.aab
  echo.
  if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    echo File confirmed to exist!
    copy "android\app\build\outputs\bundle\release\app-release.aab" "app-release.aab"
    echo Also copied to current folder: app-release.aab
  ) else (
    echo WARNING: File not found even though build succeeded?
  )
) else (
  echo [4/4] BUILD FAILED!
  echo.
  echo Last 50 lines of build log:
  echo ----------------------------------------
  powershell -command "Get-Content build-log.txt -Tail 80 | Write-Host"
  echo ----------------------------------------
  echo.
  echo Full log saved to: build-log.txt
)
echo.
pause
