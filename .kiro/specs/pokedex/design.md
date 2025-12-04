# KIROWEEN POKEDEX Design

## Tech Stack
- Framework: Expo (React Native) with Expo Router
- Language: TypeScript
- State: Zustand stores
- Styling: NativeWind (Tailwind CSS)
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage (artifact-images bucket)
- AI: Google Gemini API (gemini-2.0-flash-lite)
- Audio: Expo AV
- Camera: Expo Camera
- Haptics: Expo Haptics

## Color System (tailwind.config.js)
```javascript
colors: {
  'void-black': '#000000',      // Background
  'shadow-green': '#008000',    // Accent/secondary
  'standard-green': '#00FF00',  // Primary/bright
  'phosphor-bright': '#CCFFCC', // Highlight
  'fatal-red': '#FF0000',       // Errors/danger
}
```

## Typography
- Font: PressStart2P (8-bit retro)
- No font scaling (disabled globally for pixel-perfect look)
- Font family applied via style={{ fontFamily: 'PressStart2P' }}

## Folder Structure
```
pokedex/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with font loading
│   ├── index.tsx           # Home screen
│   ├── login.tsx           # Email/name entry
│   ├── camera.tsx          # Camera scanner
│   ├── processing.tsx      # AI processing screen
│   ├── card.tsx            # Card preview
│   ├── collection.tsx      # Artifact collection grid
│   ├── details.tsx         # Full card view
│   ├── challenges.tsx      # Daily challenges list
│   ├── challenge-details.tsx
│   ├── friends.tsx         # Friends & leaderboard
│   └── compare.tsx         # Rarity comparison
├── components/
│   ├── RetroButton.tsx     # Green border, black bg, press state
│   ├── RetroModal.tsx      # Modal with retro styling
│   ├── BountyClaimedModal.tsx
│   ├── Crosshair.tsx       # Camera crosshair overlay
│   ├── ScanlinesOverlay.tsx
│   └── VignetteOverlay.tsx
├── store/
│   ├── authStore.ts        # User auth (email/name)
│   ├── scanStore.ts        # Scan state, cards
│   ├── challengeStore.ts   # Daily challenges
│   ├── userStore.ts        # User profile/stats
│   └── friendStore.ts      # Friends/leaderboard
├── utils/
│   ├── supabase.ts         # Supabase client
│   ├── gemini.ts           # AI classification
│   ├── imageStorage.ts     # Image upload/download
│   ├── audio.ts            # Sound effects
│   ├── haptics.ts          # Haptic feedback
│   └── navigation.ts       # Router helpers
└── database/
    ├── schema.sql          # Full database schema
    └── migration_add_daily_challenges.sql
```

## Database Schema

### users
- id: UUID (primary key)
- email: TEXT (unique)
- username: TEXT
- total_points: INTEGER (default 0)
- created_at, updated_at: TIMESTAMPTZ

### collections
- id: UUID (primary key)
- user_id: UUID (references users)
- mythic_name: TEXT
- original_object: TEXT
- rarity_index: INTEGER (0-100)
- adjusted_rarity: INTEGER
- rarity_tier: TEXT
- element: TEXT
- flavor_text: TEXT
- image_uri: TEXT
- weight_class: TEXT
- estimated_weight: TEXT
- dimensions: TEXT
- timestamp: BIGINT
- created_at, synced_at: TIMESTAMPTZ

### challenges
- id: UUID (primary key)
- title: TEXT
- description: TEXT
- target_word: TEXT (comma-separated)
- reward_points: INTEGER
- is_active: BOOLEAN
- daily_date: DATE
- expires_at: TIMESTAMPTZ
- created_at, updated_at: TIMESTAMPTZ

### user_challenges
- id: UUID (primary key)
- user_id: UUID (references users)
- challenge_id: UUID (references challenges)
- completed_at: TIMESTAMPTZ
- points_earned: INTEGER
- UNIQUE(user_id, challenge_id)

### friendships
- id: UUID (primary key)
- user_id: UUID (references users)
- friend_id: UUID (references users)
- status: TEXT ('pending', 'accepted', 'blocked')
- created_at, updated_at: TIMESTAMPTZ
- UNIQUE(user_id, friend_id)

## Component Patterns

### RetroButton
- border-4 border-standard-green (or border-fatal-red for danger)
- bg-void-black (default), bg-standard-green (pressed)
- text-standard-green (default), text-void-black (pressed)
- translateY(2px) on press for mechanical feel
- Haptic feedback on press

### Screen Layout
- bg-void-black background
- SafeAreaView wrapper
- flex-1 for full height
- px-4 for horizontal padding

### Card Display
- Black background with green border
- Rarity tier color for accent
- PressStart2P font throughout

## AI Prompt (Gemini)
```
You represent a cynical, dystopian Pokedex from the year 2099.
Analyze the provided image and classify it as a post-apocalyptic artifact.

CRITICAL RULES:
1. If image unclear, create fictional classification. Never say "I can't see".
2. Tone: bureaucratic, scientific, yet mystical - government database entry for cursed object.
3. flavor_text: exactly 20 words or less. Dark humor, dangerous artifact description.

ELEMENT CLASSIFICATION:
- Mundane objects: PLASTIC, METAL, GLASS, PAPER, WOOD, FABRIC, STONE, CERAMIC, ELECTRONICS, ORGANIC
- Strange/broken/glowing: VOID_MATTER, BIO_SLUDGE, ANCIENT_TECH, NEON_DECAY, CURSED_DATA

RARITY CRITERIA:
- COMMON (0-20): Mass-produced, modern, pristine (phones, mugs)
- RARE (21-40): Vintage, slightly broken/weathered
- EPIC (41-60): Heavily modified, repurposed, aged
- LEGENDARY (61-80): Unidentifiable machinery, ancient tech, glowing
- MYTHIC (81-100): Defies physics, impossible light, cursed/alien

SCORING ADJUSTMENTS:
- Brand new: -10 points
- Broken/rusted: +10 points
- Weird lighting: +15 points
- Unidentifiable: +20 points

Return ONLY valid JSON. No markdown, no code blocks.
```

## Zustand Store Pattern
```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  data: SomeType[];
  loading: boolean;
  setData: (data: SomeType[]) => void;
  loadData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  data: [],
  loading: false,
  setData: (data) => set({ data }),
  loadData: async () => {
    // Load from Supabase, cache in AsyncStorage
  },
}));
```


## MCP Servers
Configure these in your MCP settings:

### Required Connections
1. **fetch** - HTTP requests for Gemini API
2. **github** - Repository management (https://github.com/1shanpanta/kiroween.git)

### Optional Connections
- **context7** - Library documentation lookup
- **notion** - If using Notion for project management
- **gmail** - If implementing email features

## Environment Variables
Create `.env` in project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Configuration
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Verify with:
```bash
cat .env
grep "^EXPO_PUBLIC_" .env
```

## Git Repository Setup
```bash
echo "# kiroween" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/1shanpanta/kiroween.git
git push -u origin main
```

## Package Installation

### Dependencies
```bash
yarn add @expo-google-fonts/press-start-2p@^0.2.3 @expo/vector-icons@^15.0.2 @react-native-async-storage/async-storage@2.2.0 @react-navigation/native@^7.1.6 @supabase/supabase-js@^2.38.4 expo@^54.0.0 expo-auth-session@^7.0.9 expo-av@~15.0.1 expo-camera@~17.0.9 expo-clipboard@^8.0.7 expo-constants@~18.0.9 expo-file-system@~18.0.4 expo-font@~14.0.4 expo-haptics@^15.0.7 expo-linear-gradient@~15.0.1 expo-linking@~8.0.8 expo-router@~6.0.10 expo-splash-screen@^31.0.11 expo-status-bar@~3.0.8 expo-system-ui@~6.0.7 expo-web-browser@~15.0.7 nativewind react@19.1.0 react-dom@19.1.0 react-native@0.81.5 react-native-gesture-handler@~2.28.0 react-native-reanimated@~4.1.1 react-native-safe-area-context@~5.6.0 react-native-screens@~4.16.0 react-native-svg@15.12.1 react-native-web@^0.21.0 react-native-worklets@0.5.1 zustand@^4.5.1
```

### Dev Dependencies
```bash
yarn add -D @babel/core@^7.20.0 @types/react@~19.1.10 eslint@^9.25.1 eslint-config-expo@~10.0.0 eslint-config-prettier@^10.1.2 prettier@^3.2.5 prettier-plugin-tailwindcss@^0.5.11 tailwindcss@^3.4.0 typescript@~5.9.2
```

## Quick Commands
```bash
yarn start      # Start Expo dev server
yarn ios        # Run on iOS simulator
yarn android    # Run on Android emulator
yarn lint       # Lint code
yarn format     # Format code
```

## Supabase Setup
1. Create project at https://supabase.com
2. Run `database/schema.sql` in SQL Editor
3. Create Storage bucket: `artifact-images` (Public: true)
4. Copy URL and anon key to `.env`
