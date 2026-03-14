@echo off
echo ========================================
echo    Flip One - Android Build Script
echo ========================================

set /p KEYSTORE_PASS=Enter keystore password: 

echo.
echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (echo ERROR in npm install & pause & exit /b 1)

call npm install react-native-google-mobile-ads
if %ERRORLEVEL% NEQ 0 (echo ERROR installing admob & pause & exit /b 1)

echo.
echo [2/4] Generating Android project...
call npx expo prebuild --platform android --clean
if %ERRORLEVEL% NEQ 0 (echo ERROR in prebuild & pause & exit /b 1)

echo.
echo [3/4] Building release AAB...
cd android
call gradlew bundleRelease --warning-mode all ^
  -Pandroid.injected.signing.store.file=D:\F\flipone-release.keystore ^
  -Pandroid.injected.signing.key.alias=flipone ^
  -Pandroid.injected.signing.store.password=%KEYSTORE_PASS% ^
  -Pandroid.injected.signing.key.password=%KEYSTORE_PASS%

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo BUILD FAILED! See errors above.
  cd ..
  pause
  exit /b 1
)

cd ..

echo.
echo [4/4] Done!
echo.
echo AAB file is ready at:
echo android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
