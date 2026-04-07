# CLAUDE.md - Project Guide for AI Assistants

## Overview
Browser-based Street Fighter clone with 6 classic PC game characters. Phaser 3, no build tools, vanilla JS.

## Running
```bash
npx serve .
# or
python3 -m http.server 8080
```

## Architecture

### Scene Flow
`BootScene` (load assets) -> `CharacterSelectScene` -> `FightScene` (best of 3) -> `VictoryScene` -> back to select or rematch

### Key Files
- `js/fighters/characters.js` — All character stats, move data, frame data. Add new characters here.
- `js/fighters/Fighter.js` — State machine: IDLE, WALK, JUMP, PUNCH, KICK, SPECIAL1, SPECIAL2, BLOCK, HIT, KO, VICTORY. Uses Phaser sprites with flipX for facing.
- `js/systems/CombatSystem.js` — Hitbox/hurtbox rectangle overlap checks, projectile management, hit effects, sound triggers.
- `js/systems/InputManager.js` — P1: arrows + Z/X/C. P2: WASD + F/G/H.
- `js/scenes/FightScene.js` — Round management, timer, slow-mo KO, synthesized SFX via Web Audio.
- `js/ui/HUD.js` — Health bars (Phaser rectangles), timer, round dots, announcements with tweens.

### Sprite System
- Sprite sheets: 512x384px, 8 cols x 6 rows, 64x64 per frame
- Animations defined in `BootScene.create()` using frame ranges
- Fighters rendered at 2.5x scale, physics body 24x44 with offset 20,18
- Hitboxes/hurtboxes scaled by 2.5x in CombatSystem

### Adding a New Character
1. Add character data to `CHARACTERS` object in `characters.js` (stats, moves, hitboxes)
2. Generate sprite sheet (512x384, solid color bg, 8x6 grid of 64x64 frames)
3. Process: resize to 512x384, color-key remove background, clean grid lines
4. Place in `assets/sprites/<name>.png`
5. If character has projectile: generate sprite, add to `assets/sprites/`, load in `BootScene`, set `projectileSprite` in move data
6. Animations auto-register in `BootScene` via `CHARACTER_KEYS` loop

### Combat System
- Hitboxes defined per move in character data (x, y, w, h relative to character)
- Active only during "active frames" window (after startup, before recovery)
- Blocking: `defender.state === 'BLOCK' || defender.holdingBack` reduces damage to 15%
- Projectiles: Phaser physics sprites/images with glow circles, max 1 per player
- Negative knockback (like Lara's grapple) pulls opponent toward attacker

### Controls
- P1 select: Arrow keys + SPACE
- P2 select: A/D + ENTER
- Fight P1: Arrows + Z(punch) X(kick) C(special)
- Fight P2: WASD + F(punch) G(kick) H(special)
- Alt special: hold down + special key
- Block: hold back + down (or just hold back for passive block)

### Sound
Synthesized via Web Audio oscillators in `FightScene.createSFX()`. No audio files needed. Types: hit, block, KO, special, roundStart.

## Conventions
- No build tools, no npm, no bundler — everything is `<script>` tags
- Phaser 3.90.0 from CDN
- All classes are globals (no modules)
- Character-agnostic code in Fighter.js; character-specific data in characters.js
- Sprite backgrounds removed via Python PIL color-keying (magenta #FF00FF or blue #0000FF)
