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

## Design System (Cheerful Arcade Style)

### Bright Sky Theme (Sonic/Mario inspired)
- **Background Gradient**: Bright Blue Sky (#29B6F6 to #81D4FA)
- **Player**: Golden (#FFD700)
- **Danger**: Red (#F44336) - Angry Birds style
- **Platform**: Green (#4CAF50)
- **Primary**: Orange (#FF5722)
- **Secondary**: Pink (#E91E63)
- **Success**: Green (#4CAF50)
- **Gold**: (#FFD700)

### Road/Track Colors
- **Asphalt**: Dark Gray (#37474F)
- **Road Lines**: Yellow (#FFEB3B)
- **Road Edge**: White (#FFFFFF)
- **Grass**: Green (#4CAF50)

### Classic Game Color Palettes
- **Candy Crush**: Red, Orange, Yellow, Green, Blue, Purple, Pink
- **Mario**: Red, Blue, Yellow, Green, Brown, Orange
- **Sonic**: Blue, Gold, Red, Green
- **Angry Birds**: Red, Yellow, Blue, Green, Pink

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

### Latest (Cheerful Visual Overhaul)
- **Bright Sky Background**: Changed from dark purple to cheerful bright blue sky (Sonic/Mario style)
- **Road-Style Tracks**: Both tracks now look like real roads with asphalt, yellow center dashes, white edge lines, and green grass borders
- **Smaller Superman**: Superman reduced to half size for better proportions
- **Improved Sound Effects**: 
  - Sonic ring collection sound for hearts/stars
  - Luxury sports car engine sounds
  - Real dramatic thunder for flip effect
  - Sports car startup sound at game start
- **Cheerful Color Palette**: All colors updated to match Candy Crush + Mario + Sonic + Angry Birds style
- **Vibrant UI**: Brighter, more cheerful interface colors throughout

### Previous (Car-Style Player & Superman Update)
- **Car-Like Player**: Player now has spinning wheels at the bottom with spoke animation
- **Sparkling Eyes**: Animated eyes on the player with sparkle effect
- **Removed Trail**: Golden trail particles removed for cleaner look
- **Car Engine Sound**: Engine sound plays at game start
- **Thunder Flip Sound**: Light thunder sound on each flip for dramatic effect
- **720° Special Flip**: Double rotation (720°) with dramatic back easing animation
- **Superman Easter Egg**: After 15 successful flips, Superman flies across the screen horizontally
- **Mario/Sonic/Candy Crush Colors**: Added color palette inspiration from classic games
- **Sonic Ring Sound**: Collectibles now use Sonic-style ring collection sound

### Previous (Obstacles & Collectibles Update)
- **New Obstacle Types**: Electric lightning symbols (yellow), danger triangles (red), and fancy skulls (white) replace card suits
- **Collectible Hearts**: Pink hearts spawn every 3 seconds and grant +3 bonus points when collected
- **Collectible Stars**: Golden stars spawn every 3 seconds and grant +5 bonus points when collected
- **Bonus Points System**: Collectible points tracked separately and added to final score at game over
- **Track Spacing**: Increased vertical gap between tracks to 120px for better visibility
- **Compact HUD**: Badge height reduced to 28px while maintaining readable font sizes

### Previous (Visual & Gameplay Enhancements)
- **Trail Effect**: Player leaves animated golden particle trail while moving
- **Obstacle Pulse**: Obstacles have subtle pulse animation (1.08x scale) for visual appeal
- **Moving Background Stars**: 40 animated white stars drift across the background
- **Slow-Motion Death**: 80% slower speed on collision for dramatic death effect
- **Distance Counter**: Real-time "DIST" badge in HUD showing meters traveled
- **Smart Obstacle Patterns**: At score 30+, 70% chance obstacles alternate between tracks
- **Daily Challenges**: 5 challenge types with 75-150 point rewards (no_power, high_score, distance, fever, collect)
- **Free Daily Revive**: One free continue per day tracked with date checking
- **Card Suit Orientation**: Top track obstacles rotated 180° to face inward

### Previous (Premium Shop & Sound Updates)
- **Premium Skin Purchases**: Premium characters now purchasable with in-game points (1000-5000 points)
- **Character Images**: Superhero character avatars displayed on premium skin buttons
- **Soft Emergency Siren**: Replaced heartbeat sound with softer siren alert during gameplay
- **Button Text Centering**: All button text centered horizontally and vertically across the game
- **Premium Skin Storage**: Added ownedPremiumSkins array to track purchased premium characters

### Previous (Sound & HUD Improvements)
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
