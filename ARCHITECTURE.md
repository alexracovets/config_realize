# Architecture

A browser-based **3D garment configurator** built with **Next.js 16** (App Router), **React Three Fiber** for real-time 3D rendering, and **Zustand** for global state.

The codebase separates concerns into three axes:

- **UI** — Atomic Design (`src/ui/`)
- **Domain & state** — Zustand stores, hooks, types (`src/store/`, `src/hooks/`, `src/types/`)
- **3D & assets** — shaders, gizmo logic, print pipelines (`src/shaders/`, `src/gizmo/`, `src/utils/`)

---

## Table of contents

1. [Repository layout](#repository-layout)
2. [High-level data flow](#high-level-data-flow)
3. [UI layer (Atomic Design)](#ui-layer-atomic-design)
4. [Non-UI layers](#non-ui-layers)
5. [Next.js routing](#nextjs-routing)
6. [Technology stack](#technology-stack)
7. [Scripts & tooling](#scripts--tooling)
8. [Path aliases](#path-aliases)

---

## Repository layout

```
configurator_clothes3/
├── app/                    # Next.js App Router — thin route files, no business logic
├── public/                 # Static assets: GLTF models, textures, WASM, logos
├── scripts/                # Node asset-pipeline scripts (see Scripts & tooling)
├── src/                    # Application source
│   ├── constants/          # Immutable configuration values
│   ├── data/               # Product JSON catalogs and accessors
│   ├── fonts/              # UI and garment-print fonts
│   ├── gizmo/              # 3D gizmo: hit-test, drag, mesh construction
│   ├── hooks/              # React custom hooks (single source of truth)
│   ├── providers/          # React Context providers
│   ├── shaders/            # GLSL shaders for Three.js
│   ├── store/              # Zustand stores (global state)
│   ├── types/              # Centralized TypeScript types
│   ├── ui/                 # UI components (Atomic Design)
│   └── utils/              # Pure functions: atlases, uniforms, file converters
├── playwright/             # End-to-end tests (Playwright)
└── ARCHITECTURE.md         # This document
```

## UI layer (Atomic Design)

All UI lives under `src/ui/` and follows Atomic Design tiers.

| Layer         | Path                                  | Alias        | Responsibility                                                              |
| ------------- | ------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| **Atoms**     | `src/ui/components/atomic/atoms/`     | `@atoms`     | Smallest blocks: `Button`, `AtomInput`, `ColorPicker`, `AtomSkeleton`       |
| **Molecules** | `src/ui/components/atomic/molecules/` | `@molecules` | Atom compositions: configurator steps, `LogoUpload`, `Search`               |
| **Organisms** | `src/ui/components/atomic/organisms/` | `@organisms` | Large sections: `Header`, `AsideConfiguration`, `Configurator` (3D canvas)  |
| **Templates** | `src/ui/components/atomic/templates/` | `@templates` | Page layouts without data coupling                                          |
| **Pages**     | `src/ui/components/atomic/pages/`     | `@pages`     | Page compositions: `ConfiguratorPage`, `HomePage`                           |
| **Shared**    | `src/ui/components/shared/`           | `@shared`    | shadcn/Radix primitives shared by atoms (`Dialog`, `Accordion`, `Skeleton`) |
| **Skeletons** | `src/ui/components/skeletons/`        | `@skeletons` | Loading skeletons mirroring real component layouts                          |

### UI conventions

1. **`app/` routes** only import a component from `@pages` — no business logic in route files.
2. **Atoms** are presentational: props only; no store, API, or 3D dependencies.
3. **Molecules** may read stores and use hooks from `@hooks`.
4. **Organisms** compose molecules/atoms into cohesive blocks (sidebar, canvas, footer).
5. **Skeletons** match the dimensions of their target molecules/organisms; visibility is controlled via `useShowConfigurationSkeleton`.
6. **Component prop types** live in `src/types/ui/`, not inline in `.tsx` files.

---

## Non-UI layers

### `src/hooks/` (`@hooks`)

The **only** place for React custom hooks:

| Category       | Examples                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Store wrappers | `useConfigurationCartSync`                                                                                                     |
| 3D / textures  | `useGarmentTextures`, `useGarmentPbrMaps`                                                                                      |
| Gizmo          | `useGizmoSelection`, `usePrintGizmoDrag`, `useGizmoIconAtlas`                                                                  |
| UI state       | `useSlidingIndicator`, `useControlledState`, `useShowConfigurationSkeleton`, `useConfigurationPositionPicker`                  |
| Domain actions | `useLogoFileHandler`, `useStepLogo`, `useNavigateToCheckout`                                                                   |
| Checkout       | `useCheckoutInit`, `useCheckoutSummary`, `useCheckoutConfigurationTable`, `useNavigateToCheckout`, `useNavigateToConfigurator` |

> Zustand stores in `src/store/` are named `use*` but are **not** React hooks — they are global state containers. Hooks that combine multiple stores or use `useMemo` / `useCallback` belong in `src/hooks/`.

### `src/store/` (`@store`)

Domain-scoped Zustand stores:

| Store                                                    | Responsibility              |
| -------------------------------------------------------- | --------------------------- |
| `useConfiguratorProduct`                                 | Active catalog product      |
| `useConfigurationControl`                                | Wizard steps and navigation |
| `useConfigurationCart`                                   | Session configuration cart  |
| `useGarmentColor`                                        | Part colors and gradients   |
| `useGarmentDesign`                                       | Design patterns             |
| `useGarmentName` / `useGarmentNumber` / `useGarmentLogo` | Garment text and logos      |
| `useConfiguratorSceneLoad`                               | 3D scene loading state      |
| `useInfoDialog`                                          | Info / FAQ modal state      |
| `useCheckout`                                            | Checkout rows and pricing   |

Each store is a folder with `use*.ts` (state + actions) and helper `map*.ts` files (mapping from entity data).

### `src/types/` (`@types`)

All project types are centralized here:

```
src/types/
├── cart/           # Cart item types, configuration snapshots
├── entities/       # Types derived from JSON catalogs (source of truth)
├── garment/        # Runtime garment types composed from entities
├── gizmo/          # Gizmo and drag-state types
├── ui/             # Component props, variant unions, UI helpers
├── utils/          # PbrMaps, GarmentPrintState, PatternMaskPair, etc.
└── index.ts        # Barrel export
```

### `src/data/` (`@data`)

JSON product catalogs (e.g. `crewneck/crewneck.json`), modal info content (`modalInfo/*.json`), and accessors: `getProduct`, `getStyle`, `listCatalogProducts`, `faqContent`, `measureContent`, etc. No UI logic.

Modal info follows the same pattern as garment catalogs:

- **JSON** in `src/data/modalInfo/` — one file per tab (`faqContent.json`, `measureContent.json`, …)
- **Types** in `src/types/entities/modalInfo/` — `modalInfoTabType`, `modalInfoPartType`, …
- **Tab registry** in `ModalInfo/modalInfoTabs.tsx` — maps tab `value`, label, icon, and content
- **Renderer** in `ModalInfo/Content/ModalInfoTabContent/` — shared `text`, `list`, `image`, `table` parts

### `src/utils/` (`@utils`)

Pure, React-free utilities:

- Print atlas composition (`composePrintAtlas`, `composeNameAtlas`)
- Uniform builders and print application (`garmentPrint/`)
- Logo file conversion (`logoFile/`)
- PBR material creation (`createGarmentMaterial/`)

Does **not** re-export `@constants` — consumers import `LOGO_SLOT_COUNT`, `FULL_UV_BOUNDS`, etc. directly from `@constants`.

Module-local helper types that are not domain entities may live next to their module; domain types belong in `src/types/`.

### `src/shaders/` (`@shaders`)

GLSL vertex and fragment shaders:

| Module                   | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `garmentShaders`         | UV, normal, roughness, gizmo lights (MeshStandardMaterial patches) |
| `garmentPrintShaders`    | Print layer shaders                                                |
| `garmentLogoShaders`     | Logo layer shaders                                                 |
| `garmentNameShaders`     | Name text shaders                                                  |
| `garmentNumberShaders`   | Number text shaders                                                |
| `garmentGradientShaders` | Part gradient shaders                                              |
| `printAtlasTintShaders`  | FBO atlas tinting                                                  |

Structure: `moduleName/moduleName.ts` + `index.ts`; barrel export at `src/shaders/index.ts`.

### `src/gizmo/` (`@gizmo`)

Framework-agnostic 3D gizmo logic: hit-testing, drag handling, mesh element construction. React-facing gizmo hooks live in `@hooks`.

### `src/constants/` (`@constants`)

Configuration constants: wizard steps, color palette, print-atlas dimensions, fonts, checkout limits (`CHECKOUT/`), table column sizing (`CHECKOUT_CONFIGURATION_TABLE/`), configurator copy and labels (`CONFIGURATOR/`).

### `src/providers/` (`@providers`)

React Context providers: `GarmentMaterialRegistry`, `PbrMapsProvider`.

### `src/fonts/` (`@fonts`)

Font loading for UI (`inter`) and sport fonts used for garment printing.

---

## Next.js routing

```
app/
├── layout.tsx                          # Root layout (<html>, fonts, global styles)
├── (shop)/                             # Scrollable shop shell — URL: /, /checkout
│   ├── layout.tsx                      # <body> + Header + main
│   ├── (default)/                      # Home with footer
│   │   ├── layout.tsx                  # Footer wrapper
│   │   └── page.tsx                    # / → HomePage from @pages
│   └── checkout/
│       └── page.tsx                    # /checkout → CheckoutPage from @pages
└── [slug]/                             # Product configurator — URL: /:slug
    ├── layout.tsx                      # h-dvh viewport-locked configurator shell
    └── page.tsx                        # → ConfiguratorSlugHydration + ConfiguratorPage
```

| URL          | Route file                    | Page component   |
| ------------ | ----------------------------- | ---------------- |
| `/`          | `(shop)/(default)/page.tsx`   | `HomePage`       |
| `/checkout`  | `(shop)/checkout/page.tsx`    | `CheckoutPage`   |
| `/:slug`     | `[slug]/page.tsx`             | `ConfiguratorPage` (hydrated by slug) |

Route groups `(shop)` and `(default)` do not appear in the URL. Static `/checkout` takes precedence over the dynamic `[slug]` segment.

Routes remain **thin**: they import page components from `@pages` and contain no domain logic. The configurator route passes `slug` from the URL into `ConfiguratorSlugHydration`, which resolves the product from local catalog data (Shopify API integration replaces this layer later).

---

## Technology stack

| Library                                                           | Role                                   |
| ----------------------------------------------------------------- | -------------------------------------- |
| **Next.js 16**                                                    | SSR/SSG, App Router, routing           |
| **React 19**                                                      | UI runtime                             |
| **TypeScript 5**                                                  | Static typing                          |
| **Tailwind CSS 4**                                                | Styling                                |
| **Zustand**                                                       | Global client state                    |
| **React Three Fiber + drei**                                      | 3D canvas, GLTF loading, controls      |
| **Three.js**                                                      | Rendering, textures, custom shaders    |
| **Radix UI / Base UI**                                            | Accessible primitives (shadcn)         |
| **Motion**                                                        | UI animations                          |
| **@uiw/react-color**                                              | Color picker                           |
| **pdfjs-dist, @okathira/ghostpdl-wasm, @imagemagick/magick-wasm** | In-browser PDF/EPS logo conversion     |
| **sharp** (dev)                                                   | Image processing in Node asset scripts |
| **Playwright** (dev)                                              | End-to-end tests                       |
| **ESLint + Prettier + Husky**                                     | Linting, formatting, pre-commit hooks  |

---

## Scripts & tooling

### `package.json` scripts

| Script                            | Description                                                             |
| --------------------------------- | ----------------------------------------------------------------------- |
| `dev`                             | Local Next.js dev server                                                |
| `build`                           | Production build                                                        |
| `start`                           | Run production server                                                   |
| `lint` / `lint:fix`               | ESLint over `src/` and `scripts/`                                       |
| `format` / `format:check`         | Prettier                                                                |
| `validate`                        | `format:check` + `lint` + `verify:design-assets` — CI / pre-commit gate |
| `verify:design-assets`            | Ensures design files and thumbnails exist per `crewneck.json`           |
| `convert:design-assets`           | Converts heavy SVG designs (base64 PNG) to 4096px WebP for runtime      |
| `generate:design-thumbnails`      | Generates ~100px WebP previews for pattern picker UI                    |
| `copy:logo-assets`                | Copies WASM, pdf.worker, Ghostscript, and logos into `public/`          |
| `postinstall`                     | Runs `copy:logo-assets` after `pnpm install`                            |
| `prepare`                         | Initializes Husky git hooks                                             |
| `test:e2e` / `test:e2e:skeletons` | Playwright E2E tests                                                    |

### Node scripts (`scripts/`)

| File                             | Description                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `copy-logo-assets.mjs`           | Copies `magick.wasm`, `pdf.worker`, `gs.js/wasm`, and PNG logos to `public/`    |
| `verify-design-assets.mjs`       | Validates every `path_name` in JSON has a design file and thumbnail             |
| `convert-design-assets.mjs`      | Rasterizes design SVG → WebP (4096px) via sharp; preserves originals for export |
| `generate-design-thumbnails.mjs` | Creates `designs/thumbs/*.webp` from full-size WebP assets                      |

---

## Path aliases

Defined in `tsconfig.json`:

| Alias        | Path                                 |
| ------------ | ------------------------------------ |
| `@styles`    | `src/ui/styles/globals.css`          |
| `@atoms`     | `src/ui/components/atomic/atoms`     |
| `@molecules` | `src/ui/components/atomic/molecules` |
| `@organisms` | `src/ui/components/atomic/organisms` |
| `@templates` | `src/ui/components/atomic/templates` |
| `@pages`     | `src/ui/components/atomic/pages`     |
| `@shared`    | `src/ui/components/shared`           |
| `@skeletons` | `src/ui/components/skeletons`        |
| `@hooks`     | `src/hooks`                          |
| `@store`     | `src/store`                          |
| `@types`     | `src/types`                          |
| `@utils`     | `src/utils`                          |
| `@data`      | `src/data`                           |
| `@constants` | `src/constants`                      |
| `@gizmo`     | `src/gizmo`                          |
| `@providers` | `src/providers`                      |
| `@fonts`     | `src/fonts`                          |
| `@shaders`   | `src/shaders`                        |
