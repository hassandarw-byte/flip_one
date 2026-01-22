# Flip One

A one-tap arcade game where players flip gravity to navigate obstacles.

## Overview

Flip One is a minimalist mobile game built with React Native and Expo. The player controls a square that moves automatically from left to right. Instead of controlling the player, tapping the screen flips the entire world 180 degrees, swapping the floor and ceiling.

## Game Features

- **One-tap gameplay**: Simple tap to flip gravity
- **Auto-scrolling**: Player moves automatically
- **Increasing difficulty**: Speed increases every 5 points
- **Score tracking**: Current score and best score saved locally
- **Daily missions**: Complete tasks to earn points
- **Shop**: Purchase different player skins with points
- **Leaderboard**: Global rankings display
- **Settings**: Toggle sound effects and haptic feedback

## Project Structure

```
client/
├── App.tsx                    # Main app with providers
├── components/                # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   └── theme.ts               # Colors, spacing, typography
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenOptions.ts
│   └── useTheme.ts
├── lib/
│   ├── query-client.ts        # API client
│   ├── sounds.ts              # Haptic feedback utilities
│   └── storage.ts             # AsyncStorage for game state
├── navigation/
│   └── RootStackNavigator.tsx # Stack navigation
└── screens/
    ├── SplashScreen.tsx       # Animated splash screen
    ├── HomeScreen.tsx         # Main menu
    ├── GameScreen.tsx         # Core gameplay
    ├── GameOverScreen.tsx     # Results modal
    ├── ShopScreen.tsx         # Skin purchases
    ├── MissionsScreen.tsx     # Daily tasks
    ├── LeaderboardScreen.tsx  # Rankings
    └── SettingsScreen.tsx     # Game settings
```

## Design System

- **Background**: Pure Black (#000000)
- **Primary**: Electric Cyan (#00E5FF)
- **Secondary**: Deep Purple (#6200EA)
- **Success**: Neon Green (#00FF41)
- **Danger**: Hot Pink (#FF006E)
- **Gold**: (#FFB800)
- **Font**: Tajawal (supports Arabic & Latin)

## Technical Details

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack)
- **Animations**: React Native Reanimated
- **State Management**: React Query + AsyncStorage
- **Haptics**: expo-haptics for feedback

## Running the App

The app runs on Expo and can be tested via:
1. Web browser at port 8081
2. Expo Go app on physical device (scan QR code)

## Recent Changes

- Initial MVP implementation with all core screens
- Dark theme with neon accents
- Gravity flip game mechanic
- Local storage for scores and settings
- Daily missions system
- Shop with purchasable skins
