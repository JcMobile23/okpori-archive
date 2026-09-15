# Okpori P0 + P1 Bug Fixes Implementation Plan

## Repository Research

Current state:
- React 19 + Vite 8 project, Tailwind v4, Three.js/R3F + D3 for dual tree visualization
- `git remote origin = https://github.com/JcMobile23/okpori-archive.git` on branch `main`
- Working directory has uncommitted modifications to `App.jsx` and `FamilyTree3D.jsx` (from a prior session)
- `npm run lint` currently fails: **23 errors + 2 warnings** (25 total problems)
- Critical runtime bugs identified in 6 areas (P0) + 8 code-quality/anti-pattern bugs (P1)

Deployment:
- GitHub repo → Vercel auto-deploy via `deploy_to_remote` tool (target: vercel)
- Push to `origin/main` + invoke Vercel deploy tool

## Files and Modules

| File | Expected Change |
|---|---|
| `src/App.jsx` | localStorage try/catch, admin timeout race fix, `err` log, remove unused `motion` import, rename "Sync Archive" → "Reset Lineage" |
| `src/components/Hero.jsx` | Remove unused `motion` import, move `Math.random()` into `useRef`-initialized seed (useMemo → `useMemo` with seeded RNG or move particle init to `useRef` + `useEffect`), remove unused `state` param |
| `src/components/FamilyTree.jsx` | Remove unused `ref`/`width`/`height`, guard `.datum()` crash, remove `activeNodeId` from SVG-rebuild effect (split into 2 effects) |
| `src/components/FamilyTree3D.jsx` | Remove unused `useState` import, add `controls` to CameraController useEffect deps (with stable ref) |
| `src/components/Search.jsx` | Remove unused `motion` import, replace `isVisible` + `setResults` effect with derived `useMemo` results, fix deps, add click-outside handler for dropdown |
| `src/components/ProfilePortal.jsx` | Remove unused `motion` import, derive `editedData` without setState-in-effect pattern |
| `src/components/Pillars.jsx` | Keep `motion` (it's actually used) — no change needed for linting (lint was wrong); link pillars to actual lineage IDs if quick win |
| `src/components/VisualArchive.jsx` | Remove unused `motion` import, actually enforce required fields on submit (image + text fields), add delete in full-view modal (consistency) |
| `src/components/VisualArchive3D.jsx` | Remove unused `motion` + `isLiteMode` imports/props, actually enforce required fields on submit |
| `src/App.css` | Delete all 163 lines of dead Vite starter CSS (`.counter`, `.hero`, `.vite`, `#next-steps`, etc.) |
| `src/utils/tree.js` (NEW) | Extract `flattenTree`, `findPerson`, `updateRecursive`, `validateLineage` helpers |
| `src/constants.js` (NEW) | Extract `STORAGE_KEYS = { LINEAGE, GALLERY, ARCHIVE_FILENAME }` |

## Implementation Steps (Dependency Order)

### Step 1 — Create shared utilities (no deps)
1. Create `src/constants.js` with `STORAGE_KEYS`
2. Create `src/utils/tree.js` with `flattenTree`, `findPerson`, `updateRecursive`, `validateLineageShape`

### Step 2 — Fix App.jsx (depends on Step 1)
1. Import `STORAGE_KEYS` + `updateRecursive` + `findPerson` + `validateLineageShape`
2. Wrap initial localStorage JSON.parse in try/catch → fallback to `lineageData` / `[]`
3. Fix admin toggle: use `useRef` for timeout ID, `clearTimeout` on each new click before setting
4. Log the `err` in importArchive catch block
5. Rename button label "Sync Archive" → "Reset Lineage (Reload Source)"
6. Remove unused `motion` import (keep `AnimatePresence`)
7. In `importArchive`, run `validateLineageShape` before accepting

### Step 3 — Fix FamilyTree.jsx (P0 datum crash + ESLint)
1. Remove unused `ref` param from `React.forwardRef` (or attach to SVG, simplest: remove forwardRef since ref is unused externally)
2. Remove unused `width` / `height` vars
3. Guard `.datum()`: split the filter selection, check `.size() > 0` before calling `.datum()`
4. Split the main effect into two effects:
   - Effect A (deps: `[data, dimensions, onNodeClick]`) — builds SVG, zoom, links, nodes, glow def once
   - Effect B (deps: `[activeNodeId]`) — only updates circle class on nodes, no destroy/recreate

### Step 4 — Fix FamilyTree3D.jsx (ESLint + deps)
1. Remove unused `useState` import
2. In CameraController, store `controls` ref via `useThree` into a `useRef` + read ref inside effect body (or add stable controls.id to deps using a ref + stable reference)

### Step 5 — Fix Hero.jsx (P0 React 19 purity)
1. Remove unused `motion` import
2. Particle seed generation: wrap Math.random logic inside a `useEffect` that writes to a `useRef`, and use that as a stable `useMemo` dep. Alternative simpler approach: use `useState` initialized via a function factory `useState(() => generateParticles())` with empty deps (truly once). Simplest: move `particles` to `useRef` and populate in a `useEffect([count])` once, skip useMemo entirely.
3. Change `useFrame((state, delta) => ...)` to `useFrame((_, delta) => ...)`

### Step 6 — Fix Search.jsx (P0 outside-click + derived state)
1. Remove unused `motion` import
2. Remove `isVisible` state; dropdown visibility = `results.length > 0 && query.length > 1`
3. Replace `setResults` useEffect with `const results = useMemo(() => /* filter */, [query, allMembers])` — derived state
4. Move `flattenTree` import from utils; add stable deps to useMemo for allMembers
5. Add click-outside close using a container `useRef` + document click listener in useEffect

### Step 7 — Fix ProfilePortal.jsx (state-in-effect anti-pattern)
1. Remove unused `motion` import
2. Remove useEffect + setEditedData pattern, use a state initializer with key trick or add `person.id` to a wrapper key, but simplest compliant approach: use `const editedData = useMemo(() => person ? {...person} : null, [person?.id, person?.name, ...])` — no wait we need mutations on edit. Preferred: use key reset on `<ProfilePortal key={person?.id}>` so `useState` re-inits automatically; remove the effect entirely.

### Step 8 — Fix VisualArchive.jsx & VisualArchive3D.jsx (consistency + lint)
VisualArchive.jsx:
1. Remove unused `motion` import
2. In submit handler, validate all required fields (`url`, `occasion`, `subjects`, `year`) before calling `onAdd`; show inline error or trigger HTML5 validation via `form.reportValidity()`
3. In full-size modal, add a delete button matching 3D version behavior

VisualArchive3D.jsx:
1. Remove unused `motion` import
2. Remove unused `isLiteMode` prop destructuring
3. Same form validation as 2D: validate all 4 required fields

### Step 9 — Nuke dead CSS in App.css
1. Replace entire file contents with a minimal empty comment or single `/* Okpori App styles */`; keep import in main so no import chain breaks. Actually: leave App.css empty (0 rules) because it's still imported.

### Step 10 — QuotaExceeded try/catch (P0)
In App.jsx `savePerson`, `saveGalleryItem`, `removeGalleryItem` wrap all localStorage.setItem calls in try/catch, show `alert()` with friendly message on QuotaExceededError.

### Step 11 — Validation
1. `npm run lint` — confirm 0 errors, 0 warnings
2. Optional sanity: `npm run build` check for TS/compile errors if no typecheck script
3. Re-run lint one more time after all edits

### Step 12 — Git + Deploy
1. `git add -A` (includes the 2 previously modified files + all fixes)
2. `git commit -m "fix(p0+p1): resolve runtime crashes, lint errors, and 14 critical bugs"`
3. `git push origin main`
4. Run Vercel deploy via `deploy_to_remote` tool

## Dependencies and Considerations

- **Existing uncommitted changes**: `App.jsx` and `FamilyTree3D.jsx` are already modified. Need to read the latest files BEFORE editing to avoid losing prior edits, then incorporate them on top.
- **React 19 Strict Mode**: Hero particles must not depend on Math.random() during render phase — must move to either lazy-init useState or useRef+useEffect combo.
- **ESLint react-hooks/exhaustive-deps**: Adding every dep blindly can cause loops. Use refs for mutable callbacks/objects that shouldn't re-trigger.
- **localStorage quotas**: base64 photos blow past ~5MB fast. A try/catch + alert is minimal fix; IndexedDB would be better but out of P0/P1 scope.
- **GitHub auth**: `origin` uses HTTPS URL. Need to ensure shell has auth (user likely already logged in via git credential manager on Windows).
- **Vercel**: Use the `deploy_to_remote` tool with `vercel` target; no additional setup needed if repo is already linked in Vercel.

## Validation

| Check | Method | Pass Criterion |
|---|---|---|
| Lint clean | `npm run lint` | 0 errors, 0 warnings |
| Build succeeds | `npm run build` | Exit code 0 |
| LocalStorage corrupt-safe | DevTools → Application → set `okpori_lineage="!!!"` → reload | App loads, no crash, uses source JSON |
| Admin toggle | Click footer "Okpori" title 3x within 0.5s, wait 3s, click once → Admin bar appears correctly | No stale timeouts, works reliably |
| FamilyTree active zoom | Search + click a result in Lite mode | No crash, zooms to node smoothly |
| Search outside-click | Open search dropdown, click blank area → dropdown closes | Works |
| Photo form validation | Submit photo without occasion/subjects/year | Prevented, fields flagged |
| Delete consistency | 2D & 3D archive both have delete in gallery + fullview | Both UIs expose delete |

## Risks

- **Risk (High): Prior uncommitted edits conflict** — Mitigation: Always `Read` latest file before each edit; never use stale content for `old_string`. If the pre-existing edits are wanted changes (e.g. hotfixes), they will be preserved because we read the current state.
- **Risk (Medium): Vercel deploy tool requires GitHub-linked Vercel project** — Mitigation: If auto-deploy via tool fails, instruct user that the push already triggers Vercel's Git integration (most common setup).
- **Risk (Medium): lint --fix would change formatting unexpectedly** — Mitigation: Manual edits only; never run eslint --fix blindly.
- **Risk (Low): ProfilePortal key reset pattern loses in-flight edits if person changes while editing** — Mitigation: Acceptable for P0; edit session typically starts AFTER portal opens, not mid-flight.
