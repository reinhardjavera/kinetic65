# AGENTS.md — KINETIC-65 Implementation Guidelines

You are an expert Creative Technologist, 3D Graphics Engineer (Three.js / React Three Fiber), and Full-Stack Next.js Architect. You are building **KINETIC-65**, a procedural 3D mechanical keyboard configurator and exploded-view showcase.

## 1. Strict Quality & Design Rules (NO AI SLOP)

- **Aesthetic:** Strictly follow `DESIGN.md`. Use an Industrial Hardware / Swiss Grid aesthetic (`#E6E6E3` warm concrete background, `#141413` carbon ink, `#FF4D00` safety orange accents, `1px` hairline borders, zero rounded cards, zero neon purple/blue gradients, zero outer glows).
- **Copywriting:** Write concise, technical hardware copy (e.g., `"LAYER 02 // CNC 6063 SWITCH PLATE — 1.5MM THICKNESS"`). Never use marketing fluff or filler buzzwords.
- **Zero External 3D Assets:** Do NOT reference external `.glb`, `.gltf`, `.obj`, or `.hdr` URLs that could 404. Build all 3D geometries procedurally using Three.js primitives (`RoundedBoxGeometry`, `BoxGeometry`, `CylinderGeometry`) and procedural `CanvasTexture` generators.

## 2. Tech Stack & Architecture

- **Framework:** Next.js (App Router), TypeScript (strict mode), Tailwind CSS.
- **3D Engine:** `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`.
- **Animation:** `gsap` with `ScrollTrigger` (always clean up timelines inside `gsap.context()` in `useLayoutEffect`).
- **Audio:** Native Web Audio API (`AudioContext`) — synthesize mechanical keystroke acoustics procedurally without external audio files.
- **Backend / Database:** Supabase (`@supabase/supabase-js`) for saving and loading custom keyboard builds via shareable slugs.

## 3. Directory Structure

```text
src/
├── app/
│   ├── page.tsx                  # Main scroll showcase + interactive configurator
│   ├── build/[slug]/page.tsx     # Hydrated view for shared builds from Supabase
│   └── api/builds/route.ts       # POST/GET endpoints with Zod validation
├── components/
│   ├── canvas/
│   │   ├── KeyboardCanvas.tsx    # Fixed R3F Canvas, Studio Lightformer environment, camera rig
│   │   ├── KeyboardAssembly.tsx  # 5-layer procedural keyboard group + GSAP scroll binding
│   │   ├── KeycapMatrix.tsx      # 65% ANSI layout math + interactive keypress animation
│   │   └── ProceduralTextures.ts # Off-screen canvas generators for PBT grain & PCB traces
│   └── ui/
│       ├── HudHeader.tsx         # Technical telemetry top bar & audio toggle
│       ├── ScrollChapters.tsx    # Minimalist Swiss-grid scroll narrative sections
│       └── ConfiguratorDock.tsx  # Material/color/switch selector & Commit Build modal
├── lib/
│   ├── keyboardLayout.ts         # Exact 68-key 65% ANSI coordinate, width (1u, 1.25u, 2.25u, 6.25u), and row profile data
│   ├── synthAudio.ts             # Web Audio API procedural switch sound generator (Linear, Tactile, Clicky)
│   └── supabase.ts               # Typed Supabase client
└── store/
    └── useConfiguratorStore.ts   # Zustand store for active colors, switch type, pressed keys, and scroll progress
```

## 4. Coding & 3D Performance Standards

1. **65% ANSI Layout Accuracy:** Implement accurate key sizing in `lib/keyboardLayout.ts` (Row 1: `Esc` to `Del`; Row 2: `Tab` `1.5u`; Row 3: `Caps` `1.75u`; Row 4: `LShift` `2.25u`, `RShift` `1.75u` + `Up` arrow; Row 5: `1.25u` mods + `6.25u` spacebar + `1u` bottom-right modifiers and arrows). Leave a clean `0.06` unit gap between keycaps.
2. **Sculpted Keycap Geometry:** Do not use flat boxes for keycaps. Create tapered/trapezoidal keycaps (wider base, narrower top dish) or use custom vertex displacement on `RoundedBoxGeometry` so they look like genuine Cherry-profile keycaps.
3. **PCB Procedural Texture:** Generate a high-res `CanvasTexture` for the PCB layer featuring dark matte solder mask (`#18181B`), gold-plated contact pads (`#D4AF37`), and copper circuit traces.
4. **Environment Lighting:** Inside `<Environment resolution={256}>`, use `<Lightformer>` panels (overhead rectangular softbox + side rim light) instead of external HDR presets so it works 100% offline with crisp studio reflections on aluminum and brass.
5. **Memory & Lifecycle Management:** Dispose of procedurally generated geometries, materials, and `CanvasTexture` instances on unmount. Ensure `AudioContext` is lazily initialized on the first user pointer/keyboard interaction to comply with browser autoplay policies.

## 5. Database Schema (Supabase)

When generating SQL or backend queries, assume the following table:

```sql
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  builder_name text not null default 'ANONYMOUS_ENG',
  chassis_color text not null,
  keycap_theme text not null,
  switch_type text not null,
  led_mode text not null,
  created_at timestamptz default now()
);
```

## 6. Execution Workflow

When asked to build or modify features:

1. Build the core math and data structures (`keyboardLayout.ts`, `useConfiguratorStore.ts`, `synthAudio.ts`) first.
2. Implement the procedural 3D layers (`KeyboardAssembly.tsx`, `KeycapMatrix.tsx`) and verify accurate key alignment and studio lighting.
3. Bind `GSAP ScrollTrigger` to separate the 5 layers smoothly along the Y-axis (`y` offsets: Keycaps `+1.8`, Switches `+1.0`, Plate `+0.3`, PCB `-0.4`, Chassis `-1.2`).
4. Implement the Swiss-grid HUD and Supabase persistence endpoints.
