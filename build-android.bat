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
echo [3/4] Building release AAB...
cd android
call gradlew bundleRelease -Pandroid.injected.signing.store.file=D:\F\flipone-release.keystore -Pandroid.injected.signing.key.alias=flipone -Pandroid.injected.signing.store.password=%KEYSTORE_PASS% -Pandroid.injected.signing.key.password=%KEYSTORE_PASS%
cd ..

echo.
echo [4/4] Done!
echo.
echo AAB file is ready at:
echo android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
