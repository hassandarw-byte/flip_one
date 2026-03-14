@echo off
echo ========================================
echo  Flip One - Android Build v1.0.4
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo [1/4] Installing dependencies...
call npm install

echo     Removing react-native-google-mobile-ads to avoid build conflicts...
call npm uninstall react-native-google-mobile-ads 2>nul

echo.
echo [2/4] Generating Android project...
call npx expo prebuild --platform android --clean

echo.
echo [3/4] Building release AAB (log in build-log.txt)...
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
if exist "android\app\build\outputs\bundle\release\app-release.aab" (
  echo ========================================
  echo  SUCCESS! AAB file created!
  echo ========================================
  copy "android\app\build\outputs\bundle\release\app-release.aab" "app-release.aab" > nul
  echo File ready at: %CD%\app-release.aab
) else (
  echo ========================================
  echo  BUILD FAILED! (exit code: %BUILD_CODE%)
  echo ========================================
  echo.
  echo Last errors from build-log.txt:
  powershell -command "Get-Content 'build-log.txt' | Select-String 'error|Error|FAILED|exception|What went wrong' | Select-Object -Last 30 | ForEach-Object { $_.Line }"
  echo.
  echo Open build-log.txt for full details.
)

echo.
pause
