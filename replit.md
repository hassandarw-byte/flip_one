# Flip One

## Overview

Flip One is a minimalist one-tap arcade game built with React Native and Expo, where players control a square that moves automatically. The core mechanic involves tapping the screen to flip gravity, swapping the floor and ceiling to navigate obstacles. The project aims to deliver an engaging mobile gaming experience with simple yet addictive gameplay, increasing difficulty, and a rich ecosystem of features including score tracking, daily missions, purchasable skins, global leaderboards, and in-app purchases.

## User Preferences

- No background music; only sound effects.
- English language for all in-game text.
- Production builds should use real AdMob SDK with actual ad unit IDs.
- Rewarded ads require watching the full 5-second ad before claiming rewards, with the claim button locked during ad playback. Users can close ads early but forfeit the reward.

## System Architecture

Flip One is developed using React Native with Expo, leveraging React Navigation for screen management, React Native Reanimated for animations, and React Query with AsyncStorage for state management and local data persistence. Haptic feedback is integrated using `expo-haptics`.

### UI/UX Design

The game features a "Cheerful Arcade Style" design:
- **Color Scheme**: Uses a vibrant arcade color palette (Red, Orange, Yellow, Green, Blue, Purple, Pink) alongside specific themes for different elements:
    - Background Gradient: Sandy Beach (#F5E6D3 to #E8D4C0)
    - Player: Golden (#FFD700)
    - Danger: Red (#F44336)
    - Platform: Green (#4CAF50)
    - Primary: Orange (#FF5722)
    - Secondary: Pink (#E91E63)
    - Success: Green (#4CAF50)
    - Gold: (#FFD700)
    - Road/Track Colors: Asphalt (#37474F), Yellow Road Lines (#FFEB3B), White Road Edge (#FFFFFF), Green Grass (#4CAF50).
- **Player Visuals**: The player character is car-like with spinning wheels and animated sparkling eyes.
- **Obstacles**: Obstacles are represented by card suits (black/red) with white borders, electric lightning symbols, danger triangles, and fancy skulls.
- **Collectibles**: Hearts (+3 points) and Stars (+5 points) appear with vibrant visuals.
- **Animations & Effects**:
    - Animated golden particle trail for the player.
    - Subtle pulse animation (1.08x scale) for obstacles.
    - 40 animated white stars drifting in the background.
    - Slow-motion death effect (80% slower speed) on collision.
    - Dynamic background gradients changing every 10 levels.
    - Star explosion effects with 12 colorful particles when passing obstacles.
    - Screen shake effect on collision.
    - Sparkle particle effects on various screens (HomeScreen, LuckyWheelScreen, AchievementsScreen, GameOverScreen).
    - Animated glow halos and shimmer effects on menu buttons.
    - Confetti celebration on GameOverScreen for new high scores.
    - Custom screen transitions (slide_from_right, fade_from_bottom).
- **HUD**: Features a unified design with four equally-sized, cheerfully colored badges for LEVEL, SCORE, BEST, and POINTS, all text-centered.
- **Theming**: Supports System, Light, and Dark theme options, with System following the device's theme automatically.

### Game Mechanics & Features

- **One-tap Gravity Flip**: Core gameplay mechanic.
- **Auto-scrolling**: Player moves automatically from left to right.
- **Difficulty Scaling**: Speed increases every 5 levels (level increases every 10 points), providing a gradual difficulty curve.
- **Score Tracking**: Current and best scores are saved locally using AsyncStorage.
- **Daily Missions**: Five types of challenges (no_power, high_score, distance, fever, collect) with point rewards.
- **Shop System**: Allows purchase of player skins (13 original premium characters with unique AI-generated artwork), premium characters, and special powers using in-game points.
- **Leaderboard**: Global PostgreSQL-backed leaderboard with device ID tracking and username editing.
- **Settings**: Options to toggle sound effects and haptic feedback.
- **Tutorial**: An interactive 3-step walkthrough for first-time users.
- **Combo System**: Visual feedback and point multipliers for quick obstacle passes.
- **Daily Streak System**: Tracks consecutive play days for bonus points.
- **Lucky Wheel**: Daily free spin for points, powers, or jackpots.
- **Achievements**: 10 unlockable achievements for various milestones.
- **Haptic Feedback**: Enhanced haptics for power-ups, combos, and explosions.
- **Sound Effects**: Arcade coin collection, luxury sports car engine sounds, dramatic thunder for flip effect, sports car startup, soft emergency siren.
- **Easter Eggs**: Original Easter egg creatures (Flame Phoenix, Crystal Spider, Storm Cloud, Moonlight Owl, Rock Golem) appear after consecutive successful flips.
- **Premium Splash Screen**: Features pulsing rings, rotating glow, and "Tap to Flip" subtitle.

## External Dependencies

- **React Native**: Core mobile application framework.
- **Expo**: Development platform for React Native.
- **React Navigation**: For managing navigation flow.
- **React Native Reanimated**: For declarative animations.
- **React Query**: For data fetching and state management.
- **AsyncStorage**: For local data persistence.
- **`expo-haptics`**: For haptic feedback.
- **AdMob (Google Ad Manager)**: For displaying advertisements.
- **RevenueCat**: For in-app purchases (Remove Ads, Starter Pack, Mega Pack).
- **PostgreSQL**: For the global leaderboard database.
- **React Native Share API**: For "Share with Friends" functionality.