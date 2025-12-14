# KIROWEEN POKEDEX

A dystopian artifact scanner that transforms everyday objects into post-apocalyptic collectibles. Built for the 2099 wasteland survivor in all of us.

**🎃 KIROWEEN 2025 Hackathon Submission**  
**Category**: Resurrection - Bring your favorite dead technology back to life  
**Submission**: https://kiroween.devpost.com/

This project resurrects the aesthetic and experience of 1980s CRT terminals and early computer interfaces, reimagining phosphor green monochrome displays, scanline artifacts, and chunky pixel fonts for a modern mobile AR experience.

## Demo

> 📹 Demo video coming soon...

## What is this?

KIROWEEN POKEDEX is a mobile app that uses AI to scan real-world objects and reimagine them as cursed artifacts from a dystopian future. Point your camera at anything - a coffee mug, a phone, a shoe - and watch it transform into a classified government artifact with:

- **Dystopian names** like "Cursed Rectangle of Glow" or "Void-Touched Communication Shard"
- **Rarity tiers** from COMMON to MYTHIC based on age, condition, and weirdness
- **Element types** ranging from mundane (PLASTIC, METAL) to otherworldly (VOID_MATTER, CURSED_DATA)
- **Dark humor flavor text** describing each artifact's dangerous properties
- **Retro terminal aesthetic** with scanlines, green phosphor text, and 8-bit fonts

Collect artifacts, complete daily challenges, compete with friends on the leaderboard, and build your collection of post-apocalyptic treasures.

## Features

- 📷 **Camera Scanner** - Real-time object scanning with retro HUD overlay
- 🤖 **AI Classification** - Google Gemini API generates unique artifact data
- 🎴 **Digital Collection** - Store and view your scanned artifacts
- 🎯 **Daily Challenges** - Complete objectives for points and rewards
- 👥 **Friends & Leaderboard** - Compare collections and compete globally
- 🎨 **Retro Aesthetic** - Full terminal-style UI with PressStart2P font
- 🔊 **Sound Effects** - Authentic retro scan, save, and error sounds
- 📴 **Demo Mode** - Test without API calls (tap logo 5 times)

## Tech Stack

- **Framework**: Expo (React Native) with Expo Router
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Google Gemini API (gemini-2.0-flash-lite)
- **Audio**: Expo AV
- **Camera**: Expo Camera

## Installation

### Prerequisites

- Node.js 18+ and Yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Supabase account
- Google Gemini API key

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/1shanpanta/kiroween.git
cd kiroween
```

2. **Install dependencies**
```bash
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up Supabase database**
- Create a new project at [supabase.com](https://supabase.com)
- Run `database/schema.sql` in the SQL Editor
- Create a Storage bucket named `artifact-images` (set to Public)
- Copy your project URL and anon key to `.env`

5. **Get Gemini API key**
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create an API key
- Add it to `.env`

6. **Start the development server**
```bash
yarn start
```

7. **Run on device/simulator**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
kiroween/
├── app/                    # Expo Router screens
│   ├── camera.tsx          # Camera scanner
│   ├── collection.tsx      # Artifact grid
│   ├── challenges.tsx      # Daily challenges
│   └── friends.tsx         # Leaderboard
├── components/             # Reusable UI components
│   ├── RetroButton.tsx     # Styled button
│   ├── Crosshair.tsx       # Camera overlay
│   └── ScanlinesOverlay.tsx
├── store/                  # Zustand state stores
│   ├── scanStore.ts        # Scan state
│   ├── challengeStore.ts   # Challenges
│   └── userStore.ts        # User profile
├── utils/                  # Helper functions
│   ├── gemini.ts           # AI classification
│   ├── supabase.ts         # Database client
│   └── audio.ts            # Sound effects
└── database/               # SQL schemas
```

## Available Commands

```bash
yarn start          # Start Expo dev server
yarn ios            # Run on iOS simulator
yarn android        # Run on Android emulator
yarn lint           # Lint code
yarn format         # Format code with Prettier
```

## Design System

The app uses a retro terminal aesthetic inspired by 1980s CRT monitors:

- **Colors**: Void black background, phosphor green text, fatal red errors
- **Font**: PressStart2P (8-bit pixel font)
- **UI**: Thick borders, scanlines, vignette effects
- **Interactions**: Haptic feedback, mechanical button presses

## KIROWEEN 2025 - Resurrection Category

This project was built for the KIROWEEN 2025 hackathon in the **Resurrection** category: "Bring your favorite dead technology back to life."

### The Concept

Growing up, I was obsessed with Pokémon. The Pokédex was magical - point it at a creature and instantly get its data, stats, and backstory. That sense of discovery and collection stuck with me.

For this hackathon, I wanted to resurrect that Pokédex experience - the joy of scanning real-world objects and transforming them into collectibles with lore, rarity, and stats.


## License

MIT

## Credits

Built with Kiro AI Assistant during KIROWEEN 2025 🎃
