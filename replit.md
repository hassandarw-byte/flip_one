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

### Latest (Sound & HUD Improvements)
- **Directional Flip Sounds**: Different sounds for flip up vs flip down
- **Heartbeat Sound**: Tension-building heartbeat during gameplay (stops on game over)
- **Slow Flash Effect**: Multi-pulse red flash on collision for dramatic death effect
- **Unified HUD Design**: 4 equally-sized badges with cheerful colors:
  - LEVEL: Purple gradient
  - SCORE: Gold gradient
  - BEST: Pink gradient  
  - POINTS: Teal gradient
- **HUD Centering**: All badges have label + value centered horizontally and vertically
- **No Background Music**: Only sound effects as per user preference

### Previous (Luxury Visual Enhancements)
- **Sparkle Particle Effects**: 20-30 animated sparkle particles on HomeScreen, LuckyWheelScreen, AchievementsScreen, GameOverScreen
- **Button Glow Effects**: Animated glow halos on menu buttons with pulsing opacity (0.3-0.8)
- **Button Shimmer Animation**: Horizontal shimmer sweep across buttons using withRepeat
- **Confetti Celebration**: 30 animated confetti pieces falling on GameOverScreen when achieving new high score
- **Screen Transitions**: Custom animations - slide_from_right for menu screens, fade_from_bottom for Lucky Wheel/Achievements
- **Powers Fix**: Fixed power buttons positioning issue by using container View instead of Fragment
- **English Language**: All game text converted from Arabic to English

### Previous (Advanced Visual Effects & Systems)
- **Card Suit Obstacles**: Replaced shapes with card suits with authentic colors (black/red) and 2px white borders
- **Star Explosion Effects**: 12 colorful particles burst when passing obstacles
- **Screen Shake Effect**: Realistic camera shake on collision using withSequence
- **Dynamic Background Gradients**: 6 gradient presets that change every 10 levels
- **Combo System**: Visual feedback and point multipliers for quick obstacle passes (2+ within 2 seconds)
- **Daily Streak System**: Track consecutive play days with 10-100 bonus points
- **Lucky Wheel Screen**: Daily free spin with 40% points, 40% power, 20% jackpot chances
- **Achievements Screen**: 10 unlockable achievements (first game, score milestones, streaks, combos)
- **Enhanced Haptic Feedback**: Power-up specific haptics (freeze, slowmo, shield, double points)
- **Combo Haptics**: Intensity scales with combo count (light→medium→heavy)
- **Explosion Haptics**: Triple-pulse haptic pattern for star explosions
- **20 Floating Particles**: Vibrant gradient-colored distraction particles during gameplay

### Previous Updates
- AdMob integration ready for production (client/lib/ads.ts)
- In-App Purchases integration ready for production (client/lib/purchases.ts)
- Setup guide for Android in SETUP_ANDROID.md
- Real PostgreSQL leaderboard with device ID tracking and username editing
- Enhanced track lines with glow effects and shadows (8px thick)
- Player glow reduced from 8px to 4px for subtler effect
- Tajawal font family available for text styling
- Initial MVP implementation with all core screens
- Candy Crush style design with purple gradients and sparkle effects
- Gravity flip game mechanic
- Local storage for scores and settings
- Daily missions system with "Daily Missions" header
- Shop with three sections: Skins, Premium characters (7), Special Powers (4)
- Night Mode as toggle setting (not purchase)
- HHD Apps branding in Settings
- Premium splash screen with pulsing rings, rotating glow, and "Tap to Flip" subtitle
- Premium character selection with theme colors
- Special powers with once-per-day usage limit
- AdModal component for simulated ads (powers and extra life)
- Speed increases every 5 levels (not points) - more gradual difficulty curve
- Share with Friends button working with React Native Share API

## Game Progression

- **Level**: Increases every 10 points (LEVEL_INCREASE_INTERVAL = 10)
- **Speed**: Increases every 5 levels (0.5 speed boost each time, max 12)
- **Grace Period**: 1.5 seconds at game start before obstacles spawn
