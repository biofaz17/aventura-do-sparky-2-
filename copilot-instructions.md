# Copilot Instructions for Aventura do Sparky

## Quick Start

```bash
npm install           # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Project Overview

**Aventura do Sparky** is an educational visual programming game for kids (5-14) built with React and TypeScript. It teaches computational thinking through block-based coding using a character named Sparky that navigates grid-based levels.

### Core Architecture

- **Frontend**: Vite + React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL) + Vercel API routes
- **Payments**: Mercado Pago (Brazilian payments)
- **AI Features**: Google Generative AI (Gemini)
- **UI Framework**: Tailwind CSS + Lucide icons + Framer Motion
- **Audio**: Canvas Confetti for celebrations

### Key Screens & Navigation

The app uses a single-screen React router pattern (see `App.tsx` enum `Screen`):

- **HOME** - Landing page
- **AUTH** - User login/registration  
- **DASHBOARD** - User stats and level selection
- **MAP** - Level browser (LevelMap.tsx)
- **GAME** - Main game engine (GameScreen.tsx)
- **PARENTS** - Parental controls panel
- **CHECKOUT** - Subscription purchase
- **ADMIN** - Admin panel (PIN: `031415`)

### Level System

- **46 total levels** organized by subscription tier
- Levels defined in `constants.ts` as `LEVELS` array
- Each level has: `id`, `title`, `mission`, `gridSize`, `startPos`, `goalPos`, `obstacles`, `maxBlocks`, `availableBlocks`, `ageGroup`, `requiredSubscription`
- BNCC alignment codes for Brazilian educational standards

### User Data Model

```typescript
UserProfile {
  id: string
  name: string
  parentEmail: string
  age: number
  subscription: SubscriptionTier (FREE | STARTER | PRO)
  progress: UserProgress (unlockedLevels, stars, creativeProjects, etc.)
  settings: UserSettings (soundEnabled, musicEnabled)
  activeSkin?: string (default, ninja, fairy, dino)
  isGuest?: boolean
  lastActive?: number
}
```

Stored in Supabase table `users` with JSONB column `profile_data`.

## Build, Test & Debug

### Development Server

```bash
npm run dev
```

- Runs on port 3000 (configured in `vite.config.ts`)
- Hot reload enabled
- Security headers in place (CSP, X-Frame-Options, etc.)

### Admin Panel Access

1. Navigate to: `http://localhost:3000/#/admin`
2. Enter PIN: `031415`
3. Manage users, view stats, check database health

See `DEBUG_ADMIN.md` and `GUIA_TESTES_ADMIN.md` for detailed testing procedures.

### Build for Production

```bash
npm run build    # Creates optimized dist/ folder
npm run preview  # Test production build locally
```

Deployable to Vercel with `vercel.json` config already in place.

## Code Conventions

### File Organization

- **`screens/`** - Full-page React components (AuthScreen, GameScreen, etc.)
- **`components/`** - Reusable UI components (Button, Modal, ErrorBoundary, etc.)
- **`services/`** - External integrations (supabase.ts, emailService.ts, AudioService.ts)
- **`api/`** - Vercel API routes (send-email.ts, users.ts)
- **`types.ts`** - All TypeScript interfaces and enums (single source of truth)
- **`constants.ts`** - Game configuration (LEVELS array, PLANS, ADMIN_PIN, etc.)

### Block System (Core Game Logic)

```typescript
// In types.ts:
enum BlockType { MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, REPEAT_2, REPEAT_3, REPEAT_UNTIL, PAINT, IF_OBSTACLE, IF_PATH, ELSE_IF, ELSE, START }
enum BlockCategory { MOTION, CONTROL, ACTION, EVENT, DECISION }

// BLOCK_DEFINITIONS provides label, icon, category for each block type
// Used by UI to render block palettes and game engine to execute logic
```

### Environment Variables

Create `.env.local` with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_GENAI_API_KEY=your-gemini-key (optional)
VITE_MERCADO_PAGO_PUBLIC_KEY=your-mp-key (optional)
```

See `.env.example` for full list.

### Supabase Setup

Required tables:

- **`users`** - User accounts with `id`, `username`, `password`, `parent_email`, `profile_data` (JSONB)
- **`email_logs`** (optional) - For tracking sent emails

**IMPORTANT**: Never expose Mercado Pago ACCESS_TOKEN on frontend. Backend should handle payment processing.

### TypeScript Configuration

- Target: ES2022
- JSX: react-jsx
- Paths alias: `@/*` maps to repo root
- `skipLibCheck: true` (faster builds)

### Style & Naming

- **Components**: PascalCase (GameScreen.tsx, Button.tsx)
- **Functions/vars**: camelCase
- **Constants**: UPPER_SNAKE_CASE (ADMIN_PIN, LEVELS)
- **CSS**: Tailwind classes, no separate CSS files
- **Portuguese labels**: Game text uses Portuguese (e.g., "Andar Cima", "Pintar Chão")

### Component Patterns

```tsx
// Standard screen component
export function MyScreen() {
  const [state, setState] = useState<Type>(initial);
  
  useEffect(() => {
    // Side effects
  }, [deps]);

  return <div className="...">Content</div>;
}
```

Error handling with ErrorBoundary wrapper at top-level screens.

### Supabase Client Usage

```typescript
// From services/supabase.ts
import { supabase } from '@/services/supabase';

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

Always handle errors and check for null data.

### Email Service

- Backend endpoint: `api/send-email.ts`
- Frontend uses: `services/emailService.ts`
- TEKTOK email template with SendGrid (optional)

## Important Notes

1. **Game State**: GameScreen manages block execution logic. Blocks are executed sequentially; loops and conditionals nest block arrays.

2. **Responsive Design**: App should work on mobile (grid adaptable). Use Tailwind's responsive classes.

3. **Performance**: Use React.memo for heavy components, useCallback for stable references in GameScreen's render loops.

4. **Security**: 
   - CSP headers configured in vite.config.ts
   - Supabase RLS policies should restrict user data access
   - Never commit .env.local or real API keys

5. **Vercel Deployment**: 
   - API routes in `api/` are automatically deployed
   - Environment variables set in Vercel dashboard
   - `vercel.json` sets CSP and security headers

6. **Testing Admin Panel**: Use existing debug files (DEBUG_ADMIN.md, GUIA_TESTES_ADMIN.md) for complete test procedures.

## Common Tasks

### Add a New Level

1. Add object to `LEVELS` array in `constants.ts`
2. Include all required fields from `LevelConfig` interface
3. Set `ageGroup` and `requiredSubscription` appropriately
4. Game engine will automatically load it

### Modify Block Types

1. Update `BlockType` enum in `types.ts`
2. Add entry to `BLOCK_DEFINITIONS` for UI labels/icons
3. Update game execution logic in GameScreen.tsx

### Add User Subscription Feature

1. Update `UserProfile` type in `types.ts`
2. Add logic in CheckoutScreen.tsx
3. Update Supabase policy to enforce subscription requirements
4. Sync with PLANS definition in constants.ts

### Integrate New Payment Method

Payment integration is in CheckoutScreen.tsx (Mercado Pago). Backend payment processing should be in `api/` routes, never on frontend.

---

**Last Updated**: 2024 | **Node Version**: 18+ | **Package Manager**: npm
