# How I Used Kiro to Build This Project

This doc explains how I leveraged Kiro's features to build this app efficiently. Written for the hackathon judges to understand my workflow.

## Kiro Features I Used

### 1. Spec-Driven Development

Instead of just chatting with Kiro about what I wanted, I wrote three structured documents first:

- `requirements.md` - What the app needs to do
- `design.md` - How it's built (tech stack, database, patterns)
- `tasks.md` - Step-by-step implementation plan

This meant Kiro always had the full context. I didn't have to keep explaining "use TypeScript" or "style with NativeWind" - it was all in the spec.

**Best moment**: I added the daily challenges feature by updating the design doc. Kiro read it and generated 3 database tables, a complete Zustand store with caching, and 2 full screens. Everything worked immediately.

**Why this beats regular chatting**: For a 20+ file project, having a spec as the single source of truth saved hours. No repeating myself, no inconsistencies.

### 2. Steering Documents

I created a steering file that told Kiro exactly how I wanted code written:
- Use TypeScript, Expo Router, NativeWind, Zustand
- Functional components only, no try-catch blocks
- Exact color palette (void-black, standard-green, fatal-red)
- Code templates for screens, stores, and components
- Rules like "never modify .env files"

This meant every file Kiro generated looked like I wrote it. Same patterns, same style, same structure across all 20+ files.

**Coolest part**: I included the exact layout pattern I wanted. Every screen Kiro made had the same wrapper structure automatically. Zero refactoring needed.

### 3. Vibe Coding (Regular Chatting)

For creative stuff, I just talked to Kiro naturally:

**The AI prompt**: I told Kiro I wanted a "bureaucratic yet mystical" tone for the artifact descriptions. It wrote a 300-line prompt for Gemini that nailed the vibe - dark humor, government database feel, never says "I can't see the image." Worked perfectly first try.

**The typewriter effect**: Asked for "retro typewriter animation for the flavor text" and got a complete custom hook with character-by-character reveal and proper cleanup. Dropped it in and it looked amazing.

**My workflow**:
1. "Following the spec, create the camera screen"
2. Kiro generates it
3. Test in simulator
4. "Crosshair needs to be centered, scanlines are too dense"
5. Kiro fixes it precisely
6. Move on

The spec handled consistency, vibe coding handled creativity.

### 4. Agent Hooks

I set up hooks to automate boring stuff:

**Lint on save**: Every time I saved a TypeScript file, Kiro automatically ran the linter and showed me errors. No more manual checking.

**Database sync reminder**: When I updated the database schema, Kiro reminded me to check if any stores needed updates. Prevented bugs from schema/code getting out of sync.

**Steering updates**: When I changed the steering doc, Kiro automatically used the new patterns for future files.

This kept me in flow. No context switching to run commands or remember to check things.

### 5. MCP (Model Context Protocol)

MCP let Kiro connect to external tools:

**Fetch MCP**: Kiro could make HTTP requests to test the Gemini API directly. I'd say "test this prompt with a broken iPhone image" and Kiro would call Gemini, show me the response, and we'd refine it together. No need to run the app or use Postman.

**GitHub MCP**: Kiro could check my commit history and suggest good commit messages based on what actually changed.

**Why this mattered**: Testing the AI prompts was way faster. Instead of:
1. Write prompt in code
2. Run app
3. Take photo
4. Wait for response
5. Adjust prompt
6. Repeat

I could just chat with Kiro, test prompts instantly, and iterate in seconds. Cut my prompt engineering time by like 80%.

## Results

- Built in ~12 hours
- 30+ files generated
- ~3,500 lines of code
- Most features worked on first run
- Barely any refactoring needed

## What I Learned

**Specs are worth it**: Writing the requirements and design docs upfront saved me hours. Kiro had all the context it needed.

**Steering docs are powerful**: Setting the code style once meant every file looked consistent. No repetition.

**MCP is a game-changer**: Testing APIs directly in the IDE was way faster than switching to other tools.

**Hooks keep you in flow**: Automating linting and validation meant I never had to context switch.

**Mix spec and vibe coding**: Specs for structure, chatting for creativity. Best of both worlds.
