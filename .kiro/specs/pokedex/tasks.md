# KIROWEEN POKEDEX Tasks

## Phase 1: Project Setup
- [x] Task 1: Initialize Expo project with TypeScript
  - Files: package.json, tsconfig.json, app.json
  - Acceptance: yarn start works

- [x] Task 2: Configure NativeWind (Tailwind)
  - Files: tailwind.config.js, babel.config.js, global.css, nativewind-env.d.ts
  - Acceptance: Tailwind classes render correctly

- [x] Task 3: Add PressStart2P font
  - Files: app/_layout.tsx
  - Acceptance: Font loads without error

- [x] Task 4: Set up Supabase client
  - Files: utils/supabase.ts
  - Acceptance: Connection established

## Phase 2: Core Screens
- [x] Task 5: Create login screen (email/name entry)
  - Files: app/login.tsx, store/authStore.ts
  - Acceptance: User can enter email and name, stored in AsyncStorage

- [x] Task 6: Create home screen with navigation
  - Files: app/index.tsx
  - Acceptance: Shows buttons for Scan, Collection, Challenges, Friends

- [x] Task 7: Create camera screen with HUD
  - Files: app/camera.tsx, components/Crosshair.tsx, components/ScanlinesOverlay.tsx, components/VignetteOverlay.tsx
  - Acceptance: Camera view with overlays, capture button

- [x] Task 8: Create processing screen
  - Files: app/processing.tsx
  - Acceptance: Shows loading animation while API processes

- [x] Task 9: Create card preview screen
  - Files: app/card.tsx
  - Acceptance: Shows generated card with save/discard options

## Phase 3: Collection
- [x] Task 10: Create collection grid screen
  - Files: app/collection.tsx
  - Acceptance: Displays saved cards in grid

- [x] Task 11: Create card details screen
  - Files: app/details.tsx
  - Acceptance: Full card view with stats, delete option

- [x] Task 12: Implement scanStore with Supabase sync
  - Files: store/scanStore.ts, utils/imageStorage.ts
  - Acceptance: Cards save to Supabase, images upload to Storage

## Phase 4: Challenges
- [x] Task 13: Create challenges screen
  - Files: app/challenges.tsx, store/challengeStore.ts
  - Acceptance: Shows daily challenges with countdown

- [x] Task 14: Create challenge details screen
  - Files: app/challenge-details.tsx
  - Acceptance: Shows challenge requirements, completion status

- [x] Task 15: Implement challenge completion logic
  - Files: store/challengeStore.ts
  - Acceptance: Points awarded when artifact matches challenge

## Phase 5: Social
- [x] Task 16: Create friends screen
  - Files: app/friends.tsx, store/friendStore.ts
  - Acceptance: Add friends, view leaderboard

- [x] Task 17: Create compare screen
  - Files: app/compare.tsx
  - Acceptance: Compare top artifact with friend

## Phase 6: Polish
- [x] Task 18: Add audio feedback
  - Files: utils/audio.ts
  - Acceptance: Sound effects for scan, save, errors

- [x] Task 19: Add haptic feedback
  - Files: utils/haptics.ts
  - Acceptance: Haptics on button press, card save

- [x] Task 20: Implement demo mode
  - Files: app/index.tsx, utils/gemini.ts
  - Acceptance: 5 logo taps enables offline mode
