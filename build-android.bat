@echo off
echo ========================================
echo  Flip One - Android Build v1.0.4 (NEW)
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
echo [3/4] Building release AAB (log saved to build-log.txt)...
cd android
call gradlew bundleRelease ^
  -Pandroid.injected.signing.store.file=D:\F\flipone-release.keystore ^
  -Pandroid.injected.signing.key.alias=flipone ^
  -Pandroid.injected.signing.store.password=%KEYSTORE_PASS% ^
  -Pandroid.injected.signing.key.password=%KEYSTORE_PASS% ^
  > ..\build-log.txt 2>&1

set BUILD_CODE=%ERRORLEVEL%
cd ..

echo.
echo ========================================
echo  Build exit code: %BUILD_CODE%
echo ========================================

if exist "android\app\build\outputs\bundle\release\app-release.aab" (
  echo SUCCESS - AAB file found!
  copy "android\app\build\outputs\bundle\release\app-release.aab" "app-release.aab" > nul
  echo Copied to: %CD%\app-release.aab
) else (
  echo FAILED - AAB file NOT found!
  echo.
  echo === ERROR DETAILS ===
  powershell -command "Select-String -Path 'build-log.txt' -Pattern 'error|Error|FAILED|failed|exception|Exception' | Select-Object -Last 40 | ForEach-Object { $_.Line }"
  echo.
  echo Full log saved to: %CD%\build-log.txt
  echo Open it with Notepad for full details.
)

echo.
pause
