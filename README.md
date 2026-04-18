# Clayverse

The infinite creative studio for clay. Design, simulate, collaborate, and fabricate with clay in one unified platform.

Built for potters, sculptors, tile artists, jewelry makers, educators, and everyone who works with clay.

---

## Features

- **5 modeling modes** -- wheel throwing, hand-building, sculpting, tile/relief, jewelry
- **Clay physics engine** -- shrinkage, warping, cracking, wall thickness heatmap
- **Material library** -- 18 clay bodies, 27 glaze recipes with full ingredient lists
- **Glaze and firing simulator** -- color prediction, atmosphere effects, firing schedules
- **AI Muse** -- Claude-powered text-to-form suggestions, style transfer, natural language refinement
- **Community (Clay Commons)** -- share, remix, and collaborate with credit tracking
- **Export** -- STL/OBJ, SVG/DXF, G-code for ceramic printers, printable PDF templates
- **Auth** -- Google, GitHub, and email/password via NextAuth v5

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 with custom earthy clay palette
- **3D:** Three.js + @react-three/fiber
- **State:** Zustand
- **Database:** PostgreSQL + Prisma v7
- **Auth:** NextAuth v5 + @auth/prisma-adapter
- **AI:** Anthropic Claude (claude-haiku-4-5-20251001)
- **UI:** Radix UI primitives + framer-motion

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local` and fill in the values:

```bash
cp .env.local .env.local
```

Required:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/clayverse
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=your-anthropic-key
```

Optional (for OAuth):

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    studio/         # 3D modeling canvas
    community/      # Clay Commons feed
    gallery/        # Public gallery
    onboarding/     # New user onboarding
    api/            # Route handlers (projects, community, glazes, AI, auth)
  components/
    canvas/         # Three.js modeling tools per mode
    studio/         # Studio toolbar and view controls
    ui/             # Design system components
    layout/         # App shell, sidebar, header, landing page
    materials/      # Clay body and glaze library UI
    simulation/     # Physics and glaze simulation panels
    ai-muse/        # AI Muse panel and sub-components
    community/      # Community feed, project cards, publish modal
    export/         # Export panel (STL, SVG, G-code, PDF)
  lib/
    three/          # Three.js geometry, materials, scene manager
    physics/        # Shrinkage, wall thickness, structural, glaze, firing engines
    materials/      # Clay body and glaze databases
    ai/             # Claude prompts, client, style transfer
    export/         # File format generators
    db/             # Prisma singleton
  stores/           # Zustand stores (studio, app)
  types/            # Shared TypeScript types
prisma/
  schema.prisma     # Database schema
prisma.config.ts    # Prisma v7 config with datasource
```

---

## Notes

- The studio works without a database (geometry and physics are client-side)
- AI Muse requires a valid `ANTHROPIC_API_KEY`
- Community and project persistence require PostgreSQL
- `@auth/prisma-adapter` must be installed for full auth: `npm install @auth/prisma-adapter`

---

## License

MIT
