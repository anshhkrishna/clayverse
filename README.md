# clayverse

3d clay design and firing studio. throw on a wheel or hand build, simulate shrinkage,
warping and cracking, predict glaze results across firing schedules, and export to stl,
obj, svg, dxf or g code for ceramic printers.

## stack

| layer | tools |
|---|---|
| framework | next.js 16, app router |
| language | typescript |
| 3d | three.js, @react-three/fiber |
| state | zustand |
| styling | tailwind v4 |
| database | postgres, prisma 7 |
| auth | nextauth 5 |
| ai | anthropic claude |
| ui | radix primitives, framer motion |

## features

5 modeling modes (wheel, hand building, sculpting, tile, jewelry), a clay physics engine
with a wall thickness heatmap, 18 clay bodies and 27 glaze recipes, ai form suggestions,
and a community remix feed with credit tracking.

## run

```bash
npm install
npx prisma generate    # required before build or typecheck, no database needed
# set DATABASE_URL and ANTHROPIC_API_KEY in .env.local
npx prisma migrate dev
npm run dev
```

`npm run build` needs `prisma generate` to have run first, otherwise typecheck fails on
the `PrismaClient` import. it does not need a live database.

## notes

built as a single large push, so the commit history does not reflect incremental work.
verified building clean against next.js 16.2.3 with turbopack, typescript passing,
16 routes including 10 api endpoints.
