@echo off
echo ========================================
echo  Flip One - Android Build v1.0.4
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: npm install had issues, continuing anyway...
)
call npm uninstall react-native-google-mobile-ads 2>nul

echo.
echo [2/4] Generating Android project...
call npx expo prebuild --platform android --clean --yes
if %ERRORLEVEL% NEQ 0 (
  echo Trying alternative prebuild command...
  echo Y | call npx expo prebuild --platform android --clean
)

echo.
echo Checking if android folder was created...
if not exist "android" (
  echo ERROR: android folder not found! Prebuild failed.
  echo.
  echo Try running this manually:
  echo   npx expo prebuild --platform android --clean
  pause
  exit /b 1
)

echo Android folder found, continuing...

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
  echo  BUILD FAILED! (exit code: %BUILD_CODE%^)
  echo ========================================
  echo.
  echo Last errors from build-log.txt:
  powershell -command "if (Test-Path 'build-log.txt') { Get-Content 'build-log.txt' | Select-String 'rror|FAIL|exception|wrong' | Select-Object -Last 30 | ForEach-Object { $_.Line } } else { Write-Host 'build-log.txt not found' }"
  echo.
  echo Open build-log.txt with Notepad for full details.
)

echo.
pause
