import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const MODEL_FALLBACK = ['gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'];

export interface MythicCard {
  mythic_name: string;
  original_object: string;
  rarity_index: number;
  rarity_tier: string;
  element: string;
  flavor_text: string;
  weight_class: string;
  estimated_weight: string;
  dimensions: string;
}

const SYSTEM_PROMPT = `You represent a cynical, dystopian Pokedex from the year 2099.
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

Return ONLY valid JSON matching this structure:
{
  "mythic_name": "string",
  "original_object": "string",
  "rarity_index": number,
  "rarity_tier": "COMMON|RARE|EPIC|LEGENDARY|MYTHIC",
  "element": "string",
  "flavor_text": "string (max 20 words)",
  "weight_class": "LIGHT|MEDIUM|HEAVY|IMMENSE",
  "estimated_weight": "string",
  "dimensions": "string"
}`;

export async function classifyArtifact(imageBase64: string): Promise<MythicCard> {
  for (const model of MODEL_FALLBACK) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_PROMPT },
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
            ]
          }]
        })
      }
    );

    if (response.status === 429) continue;
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }
  
  throw new Error('All models rate limited');
}

export function getRarityTierColor(tier: string): string {
  switch (tier) {
    case 'COMMON': return '#008000';
    case 'RARE': return '#00FF00';
    case 'EPIC': return '#CCFFCC';
    case 'LEGENDARY': return '#FFFF00';
    case 'MYTHIC': return '#FFFFFF';
    default: return '#00FF00';
  }
}
