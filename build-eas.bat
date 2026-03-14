@echo off
echo ========================================
echo  Flip One - EAS Cloud Build
echo  (البناء في السحابة - بدون مشاكل محلية)
echo ========================================

echo.
echo [1/5] Installing EAS CLI...
call npm install -g eas-cli

echo.
echo [2/5] Login to Expo account...
echo (If you don't have an account, create one free at expo.dev)
call eas login

echo.
echo [3/5] Copying keystore to project folder...
if exist "D:\F\flipone-release.keystore" (
  copy "D:\F\flipone-release.keystore" "flipone-release.keystore" > nul
  echo Keystore copied.
) else (
  echo WARNING: Keystore not found at D:\F\flipone-release.keystore
  echo Please copy it manually to the project folder.
  pause
)

echo.
echo [4/5] Setting up project on Expo servers...
call eas build:configure

echo.
echo [5/5] Enter keystore password and starting cloud build...
echo.
echo When asked:
echo   - Keystore: choose "Enter credentials manually" 
echo   - Use the flipone-release.keystore file in this folder
echo.
set /p KEYSTORE_PASS=Enter keystore password: 

call eas build --platform android --profile production --non-interactive ^
  --no-wait

echo.
echo ========================================
echo  Build started in the cloud!
echo ========================================
echo.
echo Track progress at: https://expo.dev
echo When complete, download the .aab from the Expo dashboard
echo then upload it to Google Play Console.
echo.
pause
