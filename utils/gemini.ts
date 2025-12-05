import { MythicCard, getRarityTier } from '@/store/scanStore';
import * as FileSystem from 'expo-file-system';

const PARANOID_PROMPT = `You represent a cynical, dystopian Pokedex from the year 2099.

Analyze the provided image and classify it as a post-apocalyptic artifact.

CRITICAL RULES:
1. If the image is unclear or you cannot identify the object, create a fictional classification. Never say "I can't see" or "unclear".
2. Tone must be bureaucratic, scientific, yet mystical - like a government database entry for a cursed object.
3. The flavor_text must be exactly 20 words or less. Use dark humor and describe it as a dangerous artifact.

ELEMENT CLASSIFICATION RULES:
- If the object is recognizable and mundane (e.g. a bottle, a coin, a book), use STANDARD materials: PLASTIC, METAL, GLASS, PAPER, WOOD, FABRIC, STONE, CERAMIC, ELECTRONICS, ORGANIC.
- If the object is strange, broken, glowing, or unidentifiable, use DYSTOPIAN materials: VOID_MATTER, BIO_SLUDGE, ANCIENT_TECH, NEON_DECAY, CURSED_DATA.

RARITY EVALUATION CRITERIA (CRITICAL - Follow these strictly):
- COMMON (0-20): Mass-produced, modern, pristine items (phones, mugs, plastic bottles). If it looks new or ordinary, it MUST be < 20.
- RARE (21-40): Vintage items, slightly broken/weathered common items, branded collectibles.
- EPIC (41-60): Heavily modified, repurposed, or significantly aged items. "Glitchy" aesthetic objects.
- LEGENDARY (61-80): Unidentifiable machinery, ancient tech, glowing objects, dangerous-looking improvised tools.
- MYTHIC (81-100): Objects that look like they defy physics, emit impossible light, or are clearly "cursed" or "alien".

SCORING ADJUSTMENTS:
- "Brand new": -10 points
- "Broken/rusted": +10 points
- "Weird lighting": +15 points
- "Unidentifiable": +20 points

IMPORTANT: Be extremely strict. A regular water bottle is ALWAYS < 10. A regular laptop is ALWAYS < 15.

Return ONLY valid JSON matching the exact schema provided. No markdown, no code blocks, no explanations.`;

const JSON_SCHEMA = {
  type: 'object',
  properties: {
    mythic_name: {
      type: 'string',
      description: 'A creative, dystopian name for the artifact (e.g., "Cursed Rectangle of Glow")',
    },
    original_object: {
      type: 'string',
      description: 'What the object actually is in real life (e.g., "Smartphone", "Coffee Mug")',
    },
    rarity_index: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
      description: 'Rarity score from 0-100',
    },
    element: {
      type: 'string',
      enum: [
        'PLASTIC', 'METAL', 'GLASS', 'PAPER', 'WOOD', 'FABRIC', 
        'STONE', 'CERAMIC', 'ELECTRONICS', 'ORGANIC',
        'VOID_MATTER', 'BIO_SLUDGE', 'ANCIENT_TECH', 'NEON_DECAY', 'CURSED_DATA'
      ],
      description: 'Classification category for the artifact',
    },
    flavor_text: {
      type: 'string',
      maxLength: 200,
      description: '20 words or less. Dark, humorous description of the artifact.',
    },
    estimated_weight: {
      type: 'string',
      description: 'Estimated weight in future units (e.g. "0.4 KG", "12 FLUX")',
    },
    dimensions: {
      type: 'string',
      description: 'Estimated dimensions (e.g. "10x5x2 CM")',
    },
    weight_class: {
      type: 'string',
      enum: ['LIGHT', 'MEDIUM', 'HEAVY', 'IMMENSE'],
      description: 'Weight classification',
    }
  },
  required: ['mythic_name', 'original_object', 'rarity_index', 'element', 'flavor_text', 'estimated_weight', 'dimensions', 'weight_class'],
};

const GOD_OBJECT: MythicCard = {
  mythic_name: 'God Object',
  original_object: 'Unknown Artifact',
  rarity_index: 100,
  element: 'ANCIENT_TECH',
  flavor_text: 'A legendary entity that defies all classification. Its existence predates the collapse.',
  estimated_weight: '∞ KG',
  dimensions: 'N/A',
  weight_class: 'IMMENSE',
  image_uri: '',
  timestamp: Date.now(),
};

const MODEL_FALLBACKS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
] as const;

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function isRetryableError(status: number, errorText: string): boolean {
  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    status === 502 ||
    (status === 400 && errorText.includes('overloaded')) ||
    (status === 400 && errorText.includes('quota'))
  );
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'Invalid request to Gemini API';
    case 401: return 'Invalid API key';
    case 403: return 'API access forbidden';
    case 429: return 'Rate limit exceeded';
    default: return status >= 500 ? 'Gemini API server error' : `API error: ${status}`;
  }
}

function parseJsonResponse(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    let jsonText = content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```json?\n?/, '').replace(/```$/, '');
    }
    return JSON.parse(jsonText);
  }
}

export async function analyzeImage(
  base64Image: string,
  demoMode: boolean = false,
  abortSignal?: AbortSignal
): Promise<MythicCard> {
  const startTime = Date.now();
  const imageSize = Math.round(base64Image.length * 0.75 / 1024);
  
  console.log(`🚀 [GEMINI] Starting analysis | Demo: ${demoMode} | Size: ~${imageSize}KB`);

  if (demoMode) {
    console.log('⚡ [GEMINI] Demo mode - returning GOD_OBJECT');
    return { ...GOD_OBJECT, timestamp: Date.now() };
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const requestBody = {
    contents: [{
      parts: [
        { text: PARANOID_PROMPT },
        { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
      ],
    }],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: JSON_SCHEMA,
      temperature: 0.7,
    },
  };

  let lastError: Error | null = null;

  for (let i = 0; i < MODEL_FALLBACKS.length; i++) {
    const modelName = MODEL_FALLBACKS[i];
    const isLastModel = i === MODEL_FALLBACKS.length - 1;
    const attemptNum = i + 1;

    if (abortSignal?.aborted) {
      console.log('⚠️ [GEMINI] Request aborted');
      throw new Error('Request cancelled');
    }

    console.log(`📤 [GEMINI] Attempt ${attemptNum}/${MODEL_FALLBACKS.length}: ${modelName}`);

    try {
      const response = await fetch(
        `${API_BASE_URL}/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortSignal,
        }
      );

      console.log(`📊 [GEMINI] ${modelName}: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [GEMINI] ${modelName} failed:`, errorText.substring(0, 200));

        if (!isLastModel && isRetryableError(response.status, errorText)) {
          console.log(`🔄 [GEMINI] Retryable error, trying next model...`);
          lastError = new Error(`${modelName}: ${response.status}`);
          continue;
        }

        throw new Error(`${getErrorMessage(response.status)} - ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();

      if (data.error) {
        const errorMsg = data.error.message || 'Unknown error';
        console.error(`❌ [GEMINI] ${modelName} API error:`, errorMsg);

        if (!isLastModel && (errorMsg.includes('overloaded') || errorMsg.includes('quota'))) {
          lastError = new Error(`${modelName}: ${errorMsg}`);
          continue;
        }

        throw new Error(`Gemini API error: ${errorMsg}`);
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        console.error(`❌ [GEMINI] ${modelName} returned no content`);
        if (!isLastModel) {
          lastError = new Error(`${modelName}: No content`);
          continue;
        }
        throw new Error('No content in API response');
      }

      const parsed = parseJsonResponse(content);
      const duration = Date.now() - startTime;

      console.log(`✅ [GEMINI] Success with ${modelName} in ${duration}ms`);

      const rarityIndex = parsed.rarity_index ?? 50;
      return {
        mythic_name: parsed.mythic_name || 'Unknown Artifact',
        original_object: parsed.original_object || 'Unknown Object',
        rarity_index: rarityIndex,
        rarityTier: getRarityTier(rarityIndex),
        element: parsed.element || 'PLASTIC',
        flavor_text: parsed.flavor_text || 'Data corrupted. Artifact unreadable.',
        estimated_weight: parsed.estimated_weight || 'Unknown',
        dimensions: parsed.dimensions || 'Unknown',
        weight_class: parsed.weight_class || 'MEDIUM',
        image_uri: '',
        timestamp: Date.now(),
      };

    } catch (error: any) {
      if (error?.name === 'AbortError' || abortSignal?.aborted) {
        throw new Error('Request cancelled');
      }

      const isNetworkError = 
        error?.message?.includes('network') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('timeout');

      if (!isLastModel && isNetworkError) {
        console.log(`🔄 [GEMINI] Network error on ${modelName}, trying next...`);
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  const duration = Date.now() - startTime;
  console.error(`❌ [GEMINI] All models failed after ${duration}ms`);
  throw lastError || new Error('All Gemini models unavailable');
}

export async function imageToBase64(uri: string): Promise<string> {
  const startTime = Date.now();
  console.log(`🖼️ [IMAGE] Converting: ${uri.substring(uri.length - 30)}`);

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const duration = Date.now() - startTime;
  const sizeKB = Math.round(base64.length * 0.75 / 1024);
  console.log(`✅ [IMAGE] Converted in ${duration}ms (~${sizeKB}KB)`);

  return base64;
}
