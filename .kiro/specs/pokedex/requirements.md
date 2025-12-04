# KIROWEEN POKEDEX Requirements

## Core Features

### FR-001: Camera Scanner
- The system shall provide a camera view with retro HUD overlay
- The system shall display a green crosshair centered on screen
- The system shall render scanlines overlay (horizontal lines with opacity)
- The system shall render vignette overlay (dark edges)
- The system shall capture image on button press

### FR-002: AI Classification
- The system shall send captured image to Google Gemini API
- The system shall receive JSON response with artifact data
- The system shall generate dystopian name for scanned object (e.g., "Cursed Rectangle of Glow")
- The system shall assign rarity score 0-100
- The system shall assign element type
- The system shall generate flavor text (20 words max, dark humor)

### FR-003: Rarity Tiers
- COMMON: 0-20 points (shadow-green #008000)
- RARE: 21-40 points (standard-green #00FF00)
- EPIC: 41-60 points (phosphor-bright #CCFFCC)
- LEGENDARY: 61-80 points (yellow #FFFF00)
- MYTHIC: 81-100 points (white #FFFFFF)

### FR-004: Element Types
Standard materials: PLASTIC, METAL, GLASS, PAPER, WOOD, FABRIC, STONE, CERAMIC, ELECTRONICS, ORGANIC

Dystopian materials: VOID_MATTER, BIO_SLUDGE, ANCIENT_TECH, NEON_DECAY, CURSED_DATA

### FR-005: Card Display
- The system shall show typewriter animation for flavor text
- The system shall display rarity tier with color coding
- The system shall show element badge
- The system shall display weight class (LIGHT, MEDIUM, HEAVY, IMMENSE)
- The system shall show estimated weight and dimensions

### FR-006: Collection Management
- The system shall store scanned artifacts in Supabase
- The system shall upload images to Supabase Storage
- The system shall display collection in grid view
- The system shall allow viewing full card details
- The system shall allow deleting artifacts
- The system shall allow manual rarity adjustment

### FR-007: Daily Challenges
- The system shall generate 3-5 daily challenges at midnight
- The system shall support target word matching (find specific objects)
- The system shall support rarity-based challenges
- The system shall support element-based challenges
- The system shall award points on completion
- The system shall show countdown to next reset

### FR-008: Friends System
- The system shall allow adding friends by user ID
- The system shall display global leaderboard
- The system shall allow comparing top artifacts
- The system shall show friend stats

### FR-009: Demo Mode
- The system shall toggle demo mode on 5 logo taps
- Demo mode shall return mock artifact without API call
- Demo mode shall work offline

## Non-Functional Requirements

### NFR-001: Performance
- Image processing shall complete within 10 seconds
- App shall load within 3 seconds
- Collection shall render smoothly with 100+ cards

### NFR-002: Security
- API keys stored in .env (not committed)
- Supabase RLS policies for data access
- Public storage bucket for images
