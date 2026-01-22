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

## Design System (Candy Crush Style)

- **Background Gradient**: Purple (#1A0A2E to #2D1B4E)
- **Player**: Golden (#FFD93D)
- **Spike/Danger**: Coral (#FF6B6B)
- **Platform**: Teal (#4ECDC4)
- **Primary**: Purple (#A66CFF)
- **Secondary**: Pink (#FF9FF3)
- **Success**: Green (#54E346)
- **Gold**: (#FFD700)

### Character Themes
Each premium character has a unique color scheme:
- Dark Knight: Dark purple/gray
- Web Hero: Red/blue
- Green Giant: Forest green
- Iron Armor: Red/gold
- Ice Queen: Cyan/blue
- Kawaii Cat: Pink
- Captain Star: Navy/red

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
- Candy Crush style design with purple gradients and sparkle effects
- Gravity flip game mechanic
- Local storage for scores and settings
- Daily missions system with "Daily Missions" header
- Shop with three sections: Skins, Premium characters (7), Special Powers (4)
- Night Mode as toggle setting (not purchase)
- HHD Apps branding in Settings
- Beautiful obstacle designs: diamond, gem, crystal, star, heart shapes
- 1.5 second grace period at game start for better playability
- Premium splash screen with pulsing rings, rotating glow, and "Tap to Flip" subtitle
- Premium character selection with theme colors (Dark Knight, Web Hero, Green Giant, Iron Armor, Ice Queen, Kawaii Cat, Captain Star)
- Special powers with once-per-day usage limit (Freeze Time, Slow Motion, Shield, Double Points)
- Removed "Restore Purchases" from Settings
- Removed "Thunder God" character from premium skins
- Daily power usage tracking resets each day
- Removed "Tap To Start" screen - game starts automatically
- Home screen logo now has rounded corners matching splash screen (borderRadius: 36)
- Night Mode applied to all screens (Splash, Home, Game) via NightModeContext
- Points badge now visible in game screen HUD
- Horizontal score layout in game: Level | Score | Best | Points
- Bottom decorations in game: animated colored dots and "F L I P O N E" word pattern
- AdModal component for simulated ads (powers and extra life)
- Score animation gentler (scale 1.08 with damping 12/15)
- Speed increases every 5 levels (not points) - more gradual difficulty curve
- Share with Friends button working with React Native Share API
- Tajawal font family added for better Arabic text support

## Game Progression

- **Level**: Increases every 10 points (LEVEL_INCREASE_INTERVAL = 10)
- **Speed**: Increases every 5 levels (0.5 speed boost each time, max 12)
- **Grace Period**: 1.5 seconds at game start before obstacles spawn
