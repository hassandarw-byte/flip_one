# Flip One - Design Guidelines

## Brand Identity

**Purpose**: A minimalist one-tap arcade game where players flip gravity to navigate obstacles. Designed for maximum addictiveness through simple mechanics and instant gratification.

**Aesthetic Direction**: Premium dark theme with neon accents. High-contrast colors on deep charcoal backgrounds with refined animations. No illustrations of people, focus on geometric precision and satisfying interactions.

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

## Design System

### Color Palette - Premium Dark Theme

| Category | Color | Hex Code | Usage |
|----------|-------|----------|-------|
| **Background** | Charcoal Black | `#0B0F1A` | Main app background - premium, focus-friendly |
| **Surface** | Dark Navy | `#151B2E` | Cards, modals, elevated elements |
| **Surface Light** | Lighter Navy | `#1E2640` | Hover states, secondary surfaces |

### Game Colors

| Element | Color | Hex Code | Effect |
|---------|-------|----------|--------|
| **Player** | Neon Orange | `#FF8A00` | With glow effect - most visible element |
| **Spikes** | Neon Red | `#FF3B3B` | Clear danger indicator |
| **Platforms** | Electric Blue | `#4CC9F0` | Safe zones |
| **Flip Effect** | Blue → Purple | `#3A86FF` → `#8338EC` | Transition gradient |

### Accent Colors

| Purpose | Color | Hex Code |
|---------|-------|----------|
| **Primary** | Electric Blue | `#4CC9F0` |
| **Secondary** | Purple | `#8338EC` |
| **Success** | Neon Green | `#2EC4B6` |
| **Danger** | Neon Red | `#FF3B3B` |
| **Gold/Rewards** | Golden Yellow | `#FFC93C` |

### Text Colors

| Type | Color | Hex Code |
|------|-------|----------|
| **Primary** | Pure White | `#FFFFFF` |
| **Secondary** | Light Gray | `#E5E7EB` |
| **Muted** | Gray | `#9CA3AF` |

### Typography
- **Font**: Tajawal (supports Arabic & Latin, modern geometric)
- **Type Scale**:
  - Display: Tajawal Bold, 48px (logo, big scores)
  - Title: Tajawal Bold, 24px (modal headers)
  - Body: Tajawal Regular, 16px (mission text, buttons)
  - Caption: Tajawal Regular, 12px (labels, small info)

### Design Rules

1. **Maximum 4 main colors** - Visual consistency over variety
2. **Player is always most visible** - Bright orange with glow effect
3. **Obstacles clear but secondary** - Less attention-grabbing than player
4. **No emojis** - Use Feather icons exclusively
5. **Dark background for focus** - Eye-friendly for extended play

### Visual Design
- All buttons have subtle press animation (scale 0.95)
- Player cube has glow effect for visibility
- No blurred backgrounds—use solid overlays for modals
- Icons: Feather icon set from @expo/vector-icons
- Stars in background for depth (small white dots, low opacity)

## Screen-by-Screen Specifications

### Splash Screen
- **Purpose**: Elegant brand introduction before gameplay
- **Layout**: 
  - Full-screen centered logo with orange glow effect
  - Slow fade-in animation (800ms)
  - Auto-transition to Home after 2s
- **Background**: Charcoal black (#0B0F1A) with star particles
- **Safe Area**: None (full bleed)

### Home Screen
- **Purpose**: Central hub for all game features
- **Layout**:
  - Header: Transparent, no navigation buttons
  - Main content (centered, not scrollable):
    - Game logo at top third
    - "PLAY" button (large, orange, with glow)
    - Stats row (Best Score | Points)
    - Grid of 4 icon buttons: Shop, Missions, Leaderboard, Settings
  - Bottom: Share button
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components**: Large CTA button, icon grid, stats display

### Game Screen
- **Purpose**: Core gameplay experience
- **Layout**:
  - Header: None
  - Full-screen game canvas (two horizontal tracks)
  - Top-right: Current score counter (floating, with glow)
  - Full-screen tap detection
- **Visual Elements**:
  - Top track: Red spikes (#FF3B3B)
  - Bottom track: Blue platform (#4CC9F0)
  - Player: Orange cube (#FF8A00) with glow
  - Obstacles: Red spikes or blue blocks
- **Safe Area**: None (fullscreen game)
- **Visual Feedback**: 
  - Haptic feedback on every flip
  - Screen rotation animation (180° in 150ms)

### Game Over Modal
- **Purpose**: Show results and monetization opportunity
- **Layout**:
  - Centered card (85% screen width)
  - "GAME OVER" text in red with glow
  - Score display (large)
  - Best score (if beaten, golden star animation)
  - Buttons (vertical stack):
    - "+1 Life (Watch Ad)" - green, primary
    - "Retry" - orange outline
    - "Home" - gray outline
- **Background**: Semi-transparent black overlay (0.9 opacity)
- **Components**: Modal card, score display, animated badges

### Shop Modal
- **Purpose**: Browse and purchase skins
- **Layout**:
  - Header: "Shop" title, points display
  - Tabs: Skins | Premium
  - Scrollable grid (2 columns)
  - Each item card shows:
    - Preview cube in skin color
    - Name
    - Price in points OR $0.99 for premium
    - Checkmark if owned/equipped
- **Safe Area**: Top: headerHeight + Spacing.lg, Bottom: insets.bottom + Spacing.xl

### Daily Missions Modal
- **Purpose**: Task completion for point rewards
- **Layout**:
  - Header: "Daily Missions" with calendar icon
  - Scrollable list of mission cards:
    - Mission description
    - Progress bar (blue fill)
    - Point reward with star icon
    - Claim button (green, if complete)
- **Safe Area**: Top: headerHeight + Spacing.lg, Bottom: insets.bottom + Spacing.xl

### Leaderboard Modal
- **Purpose**: Display global rankings
- **Layout**:
  - User rank card at top (highlighted with blue border)
  - Scrollable ranked list:
    - Rank number (gold/silver/bronze for top 3)
    - Avatar circle
    - Username
    - Score
- **Safe Area**: Top: headerHeight + Spacing.lg, Bottom: insets.bottom + Spacing.xl

### Settings Modal
- **Purpose**: Game preferences and purchases
- **Layout**:
  - Scrollable form with sections:
    - **Gameplay**: Sound toggle, Haptics toggle
    - **Premium**: Night Mode ($0.99), Remove Ads ($0.99)
    - **Account**: Restore Purchases
    - **About**: App name and version
- **Safe Area**: Top: headerHeight + Spacing.lg, Bottom: insets.bottom + Spacing.xl
