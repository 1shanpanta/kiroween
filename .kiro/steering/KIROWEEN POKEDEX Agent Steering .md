---
inclusion: always
---

# KIROWEEN POKEDEX Agent Steering

## Stack Requirements
- Use TypeScript for all files
- Use Expo Router for navigation (file-based routing in app/ folder)
- Use NativeWind (Tailwind CSS) for styling - className prop on components
- Use Zustand for state management (create from 'zustand')
- Use Supabase for database and storage
- Use Google Gemini API for AI classification

## Code Style
- Functional components only (no class components)
- Use hooks for state and effects
- Export components as named exports
- Use interface for props (not type)
- No try-catch blocks
- No excessive comments
- Self-documenting code

## Design System

### Colors (use these Tailwind classes)
- Background: bg-void-black (#000000)
- Primary text: text-standard-green (#00FF00)
- Secondary text: text-shadow-green (#008000)
- Highlight: text-phosphor-bright (#CCFFCC)
- Error: text-fatal-red (#FF0000)

### Borders
- Primary: border-standard-green
- Danger: border-fatal-red
- Width: border-4 (thick retro style)

### Typography
- Font: PressStart2P (8-bit pixel font)
- Apply via style={{ fontFamily: 'PressStart2P' }}
- No font scaling (disabled globally)
- Text sizes: text-xs, text-sm, text-base, text-lg

### Buttons (RetroButton component)
- Default: black bg, green text, green border
- Pressed: green bg, black text
- 2px downward shift on press
- Haptic feedback on press

### Screen Layout
- Full black background
- SafeAreaView wrapper
- flex-1 for full height
- px-4 horizontal padding

## File Patterns

### Screens (app/*.tsx)
```typescript
import { View, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { RetroButton } from '@/components/RetroButton';

export default function ScreenName() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 px-4">
        {/* Content */}
      </View>
    </SafeAreaView>
  );
}
```

### Stores (store/*.ts)
```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';

interface State {
  // State properties
}

export const useStore = create<State>((set, get) => ({
  // Implementation
}));
```

### Components (components/*.tsx)
```typescript
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  // Props
}

export function ComponentName({ ...props }: Props) {
  return (
    // JSX with NativeWind classes
  );
}
```

## Restrictions
- Never modify .env files
- Never commit API keys
- Ask before modifying database schema
- Do not add excessive error handling
- Do not add try-catch blocks
- Do not add unnecessary abstractions
- Do not add comments that a human wouldn't add
- Keep code concise and self-documenting

## Rarity Tier Colors (for card displays)
```typescript
function getRarityTierColor(tier: string): string {
  switch (tier) {
    case 'COMMON': return '#008000';    // shadow-green
    case 'RARE': return '#00FF00';      // standard-green
    case 'EPIC': return '#CCFFCC';      // phosphor-bright
    case 'LEGENDARY': return '#FFFF00'; // yellow
    case 'MYTHIC': return '#FFFFFF';    // white
    default: return '#00FF00';
  }
}
```

## Element Types
Standard: PLASTIC, METAL, GLASS, PAPER, WOOD, FABRIC, STONE, CERAMIC, ELECTRONICS, ORGANIC

Dystopian: VOID_MATTER, BIO_SLUDGE, ANCIENT_TECH, NEON_DECAY, CURSED_DATA 