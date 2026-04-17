# Power Hammer Challenge (GCash G-Life)

Carnival-style strength game: tap the power meter at its peak to strike the hammer and launch the puck up the tower. Built with **Vue 3** (UI, meter, leaderboard) and **Phaser 3** (strike, physics, tower/bell).

## Run

```bash
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). Tap the **power meter** when the bar is at the right (peak) for maximum impact; the gray puck moves to the corresponding height on the tower (100% → top, 90%+ → congratulations). For the 300×300 hammer cursor, place your hammer image at `public/hammer-cursor.png` (transparent PNG); otherwise the SVG fallback is used.

## Stack

- **Vue 3** + **Vite** — app shell, routing, power meter, leaderboard, reward placeholder
- **Phaser 3** — hammer strike, impact velocity, puck motion, tower and bell

## Project layout

- `src/views/GameView.vue` — main game layout, Phaser container, meter, sidebar
- `src/components/PowerMeter.vue` — oscillating green→red meter; tap emits strike with `impactStrength`
- `src/components/Leaderboard.vue` — placeholder leaderboard
- `src/game/bootstrap.js` — Phaser game config and creation
- `src/game/scenes/MainScene.js` — tower, bell, base, hammer, puck physics
- `src/game/EventBus.js` — Vue ↔ Phaser events (`strike`, `bellRang`)

## Conventions

- **Vue**: meter UI, verification gate, leaderboard, reward flows
- **Phaser**: hammer strike, impact velocity, puck motion, tower/bell
- Physics: impulse/velocity at strike only; keep it simple.
