# Flip One - Design Guidelines

## Brand Identity

**Purpose**: A minimalist one-tap arcade game where players flip gravity to navigate obstacles. Designed for maximum addictiveness through simple mechanics and instant gratification.

**Aesthetic Direction**: Candy Crush-inspired premium look with vibrant candy colors, gradients, and sparkle effects on a deep purple background. Rich, polished visuals with satisfying animations.

**Memorable Element**: The world-flip mechanic—the entire game rotates 180° rather than the player jumping. Combined with haptic feedback and gratifying visual feedback.

## Design System

### Color Palette - Candy Crush Style

| Category | Color | Hex Code | Usage |
|----------|-------|----------|-------|
| **Background Start** | Deep Purple | `#1A0A2E` | Gradient start |
| **Background End** | Medium Purple | `#2D1B4E` | Gradient end |
| **Surface** | Dark Purple | `#2D1B4E` | Cards, modals |
| **Surface Light** | Lighter Purple | `#3D2B5E` | Hover states |

### Candy Colors (Game Elements)

| Element | Color | Hex Code | Effect |
|---------|-------|----------|--------|
| **Player** | Golden Yellow | `#FFD93D` | With glow + gradient highlight |
| **Spikes** | Coral Red | `#FF6B6B` | Danger indicator with glow |
| **Platforms** | Teal | `#4ECDC4` | Safe zones with gradient |
| **Candy 1** | Coral Red | `#FF6B6B` | Sparkle/accent color |
| **Candy 2** | Teal | `#4ECDC4` | Sparkle/accent color |
| **Candy 3** | Golden | `#FFD93D` | Sparkle/accent color |
| **Candy 4** | Purple | `#A66CFF` | Primary accent |
| **Candy 5** | Pink | `#FF9FF3` | Secondary accent |
| **Candy 6** | Lime | `#54E346` | Success color |

### Accent Colors

| Purpose | Color | Hex Code | Glow Color |
|---------|-------|----------|------------|
| **Primary** | Purple | `#A66CFF` | `#8B5CF6` |
| **Secondary** | Pink | `#FF9FF3` | `#F472B6` |
| **Success** | Lime | `#54E346` | `#22C55E` |
| **Danger** | Coral | `#FF6B6B` | `#EF4444` |
| **Gold** | Gold | `#FFD700` | `#F59E0B` |

### Text Colors

| Type | Color | Hex Code |
|------|-------|----------|
| **Primary** | White | `#FFFFFF` |
| **Secondary** | Light Purple | `#E8D5FF` |
| **Muted** | Purple Gray | `#B794F6` |

## Visual Effects

### Gradients
- All backgrounds use gradients (top to bottom)
- Buttons use diagonal gradients (top-left to bottom-right)
- Cards use subtle vertical gradients

### Sparkles & Particles
- Random colored sparkles throughout screens
- Animated opacity (pulse between 0.3 and 0.8)
- Colors: Random from candy palette
- Size: 2-6px circles

### Glow Effects
- Player has animated pulsing glow
- Buttons have glowing shadows
- Score badge has golden glow

### Animations
- Logo entrance: Scale + rotation + bounce
- Play button: Pulsing glow animation
- Flip transition: 150ms smooth rotation
- Score pop: Scale to 1.3x then back
- Card press: Scale to 0.95x

## Typography
- **Font**: System font (Tajawal for Arabic support)
- **Weights**: 600-900 for emphasis
- **Shadow**: Purple text shadow on important text

## Component Patterns

### Cards
- Gradient background
- 1px border with 10% white opacity
- Border radius: 18-24px
- Subtle shadow

### Buttons
- Gradient fill
- Shadow with button color
- Press animation (scale)
- Rounded corners (24px)

### Badges
- Gradient or semi-transparent background
- Colored border
- Small text with letter spacing

## No Emojis Policy
- Use Feather icons exclusively
- Clean, consistent iconography

## Screen Guidelines

All screens:
- Use LinearGradient for background
- Include sparkle particles
- Use gradient buttons
- Consistent spacing (Spacing.xl = 20px)
