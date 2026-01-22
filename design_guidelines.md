# Flip One - Design Guidelines

## Brand Identity

**Purpose**: A minimalist one-tap arcade game where players flip gravity to navigate obstacles. Designed for maximum addictiveness through simple mechanics and instant gratification.

**Aesthetic Direction**: Brutally minimal meets premium dark mode. High-contrast flat colors on deep black backgrounds with refined animations. No illustrations of people, focus on geometric precision and satisfying interactions.

**Memorable Element**: The world-flip mechanic—the entire game rotates 180° rather than the player jumping. Combined with haptic feedback and gratifying sound design.

## Navigation Architecture

**Root Navigation**: Stack-only (single-screen game with modals)

**Screens**:
1. Splash Screen - Animated logo entrance
2. Home Screen - Main menu hub
3. Game Screen - Core gameplay
4. Game Over Modal - Results and continue option
5. Shop Modal - Skins and power-ups
6. Daily Missions Modal - Task list
7. Leaderboard Modal - Global rankings
8. Settings Modal - Audio, haptics, purchases

## Screen-by-Screen Specifications

### Splash Screen
- **Purpose**: Elegant brand introduction before gameplay
- **Layout**: 
  - Full-screen centered logo (splash-icon.png)
  - Slow fade-in animation (800ms)
  - Auto-transition to Home after 2s
- **Background**: Pure black (#000000)
- **Safe Area**: None (full bleed)

### Home Screen
- **Purpose**: Central hub for all game features
- **Layout**:
  - Header: Transparent, no navigation buttons
  - Main content (centered, not scrollable):
    - Game logo at top third
    - "PLAY" button (large, primary action)
    - Current points display
    - Grid of 4 icon buttons below: Shop, Missions, Leaderboard, Settings
  - Bottom: Share button (link icon)
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**: Large CTA button, icon grid, point counter

### Game Screen
- **Purpose**: Core gameplay experience
- **Layout**:
  - Header: None
  - Full-screen game canvas (two horizontal tracks)
  - Top-right: Current score counter (floating)
  - Full-screen tap detection
- **Safe Area**: None (fullscreen game)
- **Visual Feedback**: 
  - Haptic feedback on every flip
  - Screen rotation animation (180° in 200ms)
  - Particle effects on successful flip

### Game Over Modal
- **Purpose**: Show results and monetization opportunity
- **Layout**:
  - Centered card (80% screen width)
  - Score display (large)
  - Best score (if beaten, highlight with animation)
  - Buttons (vertical stack):
    - "Continue (+1 Life)" with ad icon - primary
    - "Replay" - secondary
    - "Home" - tertiary
- **Background**: Semi-transparent black overlay (0.85 opacity)
- **Components**: Modal card, score display, ad-reward button

### Shop Modal
- **Purpose**: Browse and purchase skins/powerups
- **Layout**:
  - Header: "Shop" title, close button (top-right)
  - Scrollable grid (2 columns)
  - Each item card shows:
    - Preview of skin/powerup
    - Price in points OR $0.99 for premium
    - Checkmark if owned
  - Tabs at top: Skins | Powers | Premium
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**: Tabbed view, grid of purchasable items

### Daily Missions Modal
- **Purpose**: Task completion for point rewards
- **Layout**:
  - Header: "Daily Missions" title, close button
  - Scrollable list of mission cards:
    - Mission description
    - Progress bar
    - Point reward value
    - Claim button (if complete)
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**: List, progress indicators, reward badges

### Leaderboard Modal
- **Purpose**: Display global rankings
- **Layout**:
  - Header: "Leaderboard" title, close button
  - Current user rank highlighted at top
  - Scrollable ranked list:
    - Rank number
    - Anonymous username
    - Score
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**: Ranked list with user highlight

### Settings Modal
- **Purpose**: Game preferences and purchases
- **Layout**:
  - Header: "Settings" title, close button
  - Scrollable form with sections:
    - Audio (sound effects toggle)
    - Haptics (vibration toggle)
    - Night Mode ($0.99 purchase)
    - Remove Ads ($0.99 purchase)
    - Restore Purchases button
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**: Toggle switches, purchase buttons

## Design System

### Color Palette
- **Background**: Pure Black (#000000)
- **Surface**: Dark Gray (#1A1A1A)
- **Primary**: Electric Cyan (#00E5FF) - high-contrast accent for buttons/scores
- **Secondary**: Deep Purple (#6200EA) - premium features
- **Success**: Neon Green (#00FF41)
- **Danger**: Hot Pink (#FF006E)
- **Text Primary**: White (#FFFFFF)
- **Text Secondary**: Light Gray (#CCCCCC)

### Typography
- **Font**: Tajawal (supports Arabic & Latin, modern geometric)
- **Type Scale**:
  - Display: Tajawal Bold, 48px (logo, big scores)
  - Title: Tajawal Bold, 24px (modal headers)
  - Body: Tajawal Regular, 16px (mission text, buttons)
  - Caption: Tajawal Regular, 12px (labels, small info)

### Visual Design
- All buttons have subtle press animation (scale 0.95)
- Floating buttons use shadow: offset {0,2}, opacity 0.10, radius 2
- No blurred backgrounds—use solid overlays for modals
- Icons: Feather icon set from @expo/vector-icons
- Particle effects on successful flips (cyan trails)

## Assets to Generate

1. **icon.png** - App icon featuring geometric square rotating in minimal style with cyan accent
   - WHERE USED: Device home screen

2. **splash-icon.png** - Elegant "Flip One" wordmark with rotating square symbol
   - WHERE USED: Splash screen on app launch

3. **player-default.png** - Simple cyan square (base skin)
   - WHERE USED: Game screen, default player appearance

4. **player-gradient.png** - Gradient cyan-to-purple square (premium skin)
   - WHERE USED: Shop preview, in-game when equipped

5. **player-neon.png** - Neon-outlined glowing square (premium skin)
   - WHERE USED: Shop preview, in-game when equipped

6. **obstacle-spike.png** - Minimal geometric spike obstacle (triangle)
   - WHERE USED: Game screen obstacles

7. **obstacle-block.png** - Simple rectangular block obstacle
   - WHERE USED: Game screen moving obstacles

8. **empty-missions.png** - Checkmark icon with "All Done" minimal illustration
   - WHERE USED: Daily missions screen when all complete

**Audio Assets** (mentioned for completeness, not images):
- flip-success.mp3 - Satisfying click sound
- game-over.mp3 - Failure sound effect