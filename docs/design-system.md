# Grande Burrito Sign & Sheet System

- **Status:** emerging
- **Contract:** Design System Contract 1.0.0
- **Canonical contract:** <https://raw.githubusercontent.com/petebot/portfolio26/main/DESIGN_SYSTEM_CONTRACT.md>
- **Adopted:** 2026-07-22 from the owner-supplied `codex/design-system-contract` branch
- **Specimen:** `/system` in development and automated browser-test builds; intentionally unavailable in production

This system translates Grande Burrito's photographed storefront sign and compact printed menus into
a useful digital experience. The sign-derived mark and colors are provisional until the business
provides original artwork or approves the reconstruction.

## Principles

1. **The sign is the anchor, not wallpaper.** Use the sign's bold ink, warm field, and condensed
   lettering to establish identity, then let food, hours, and actions remain easy to read.
2. **Operational facts come first.** Open/closed status, menu, phone, and directions must stay clear
   when imagery, CMS content, or the live content service is unavailable.
3. **Borrow the menu's rhythm, improve its scan.** Strong serif headings and paper-like sections
   preserve the handmade menu character while spacing, hierarchy, and labels improve accessibility.
4. **Build resilience into the default.** Keyboard focus, reduced motion, long content, narrow
   screens, stale content, and missing optional content are system states rather than cleanup work.

## Foundations and tokens

The source of truth is `apps/web/src/lib/design/tokens.css`. It uses three layers:

- **Primitive:** sampled sign ink and tan plus a small paper-and-ink extension palette. Raw color
  values live only here.
- **Semantic:** purpose-based roles for text, surfaces, borders, notices, focus, typography, spacing,
  widths, target size, shape, elevation, motion, and layers. Product UI consumes this layer.
- **Component:** `--brand-mark-*` roles isolate the sign reconstruction's exact treatment.

### Color

The observed sign pair is violet-black `#17141c` on warm tan `#a6855f`, measured at approximately
5.33:1 contrast. Paper surfaces extend the palette without introducing a competing brand color.
There is one light theme; forced-colors behavior is supported for focus, but dark mode is not part of
the current business need.

### Typography

- **Brand:** self-hosted Anton, used only by `BrandMark`; see `apps/web/static/brand/README.md`.
- **Display:** Georgia with Times New Roman fallback for food-led headings.
- **Body:** system sans-serif stack for operational copy and controls.
- Semantic size and line-height tokens cover small text, body, lead, headings, and display type.

### Spacing and layout

The eight-step spacing scale runs from `0.25rem` to `4rem`, with a fluid section interval. The public
sheet is capped at `76rem`; reading text is capped at `60–68ch`. Content determines layout changes,
with the primary two-column composition introduced at `48rem`. Narrow layouts remain the default.

### Shape, elevation, focus, motion, and layers

Borders are either a quiet hairline or a two-pixel sign-ink rule. Small and medium radii soften
operational panels; pill radii are reserved for actions and compact labels. The sheet uses one quiet
shadow. Focus is a three-pixel ink ring with a paper gap. Motion uses 120ms and 180ms durations with
a standard easing curve, and global reduced-motion rules remove nonessential movement. Layer tokens
reserve base, sticky, and overlay levels. Interactive targets use a minimum `2.75rem` (44 CSS px).

## Inventory

### Primitives

Native headings, text, links, lists, surfaces, rules, and focus treatment are styled by global and
route-level compositions. A generalized component is not created until it has more than one credible
use and a stable API.

### Components

- `BrandMark`: responsive SVG/live-text reconstruction of the photographed sign; one size that scales
  with its container; accessible image label; provisional artwork status.
- `Announcement`: information or urgent notice, optional action, scheduled visibility, responsive
  stacked state on narrow containers.
- `ContentFreshness`: live-service fallback status; absent when content is live.
- `HoursStatus`: open/closed, next transition, today's hours, and exception note; announces updates.
- `MenuItem`: fixed/market pricing, availability, dietary, heat, seasonality, and sold-out states.
- `MenuSection`: category composition and empty-category tolerance.
- `VisitActions`: menu, call, directions, and optional ordering actions with keyboard-visible states.
- `WeeklyHours`: seven-day definition list with closed and overnight interval states.

### Patterns

- **Decision panel:** current hours + visit actions + freshness makes “can I go now?” answerable in
  one region.
- **Menu sheet:** centered menu heading, category blocks, item rules, prices, and compact labels echo
  the printed sheet without copying its crowded line lengths.
- **Continuity state:** a saved content snapshot preserves menu and hours when Sanity is unavailable,
  while `ContentFreshness` explains the condition.

### Feature UI

The public hero, story, visit block, footer, error screen, and `/system` catalog are feature-level
compositions. They use system tokens and components but are not generalized prematurely.

## Accessibility and resilience

The target is WCAG 2.2 AA. Global rules provide visible focus, text-size adjustment, reduced motion,
and forced-colors focus behavior. Information does not rely on color alone, actions meet the 44px
target, and native semantic elements preserve keyboard and assistive-technology behavior.

Known gaps to close in T043:

- Complete the recorded axe, keyboard-only, 200% text zoom, and reduced-motion audit.
- Confirm the sign reconstruction and sampled colors against original brand files or written business
  approval. Until then the mark remains provisional and is not presented as official artwork.
- Dark mode is intentionally omitted; the restaurant's paper-and-sign identity is a light system.

## Specimen and validation

Run the web app with `pnpm --filter @grande/web dev`, then open `/system`. The route contains tokens,
type, controls, component states, the decision pattern, menu content, notices, and failure/fallback
states. It returns 404 in production unless the explicit browser-test environment is active.

```sh
pnpm check:design-system
pnpm test:a11y
pnpm test:visual
pnpm check
pnpm test
pnpm build
```

The weekly contract-version workflow compares this adopted version with the canonical source and
fails visibly when review is required; it never replaces the local contract.

## Decisions and change history

### 2026-07-22 — Contract 1.0.0 adopted

- Added the portable contract, agent guidance, this project record, and the development-only specimen.
- Promoted photographed colors into primitives and moved product CSS to semantic roles.
- Kept the sign reconstruction provisional under the project's brand-provenance rules.
- Chose a guarded in-app route over Storybook because one SvelteKit consumer does not justify another
  runtime or component packaging layer.

## Portfolio evidence

Preserve the following for the case study:

- `docs/brand-inventory.md` and the supplied sign/menu references for source-to-system reasoning.
- `apps/web/src/lib/design/tokens.css` and `/system` screenshots for foundation evidence.
- `BrandMark`, `MenuItem`, and `HoursStatus` states for representative components.
- The decision panel and stale-content state for product-specific composition and resilience.
- Visual baselines at mobile and desktop sizes for responsive-system evidence.
- This history entry as an example of a design decision propagating through tokens, components,
  feature screens, documentation, and tests.

Portfolio handoff summary:

```json
{
  "name": "Grande Burrito Sign & Sheet System",
  "status": "emerging",
  "contractVersion": "1.0.0",
  "summary": "A sign-led, menu-sheet-inspired system that keeps restaurant decisions clear and resilient.",
  "principles": [
    {
      "name": "The sign is the anchor, not wallpaper",
      "description": "Brand cues establish identity without competing with operational information."
    },
    {
      "name": "Operational facts come first",
      "description": "Hours, menu, phone, and directions remain useful through degraded states."
    },
    {
      "name": "Borrow the menu's rhythm, improve its scan",
      "description": "Printed-menu character is translated into accessible digital hierarchy."
    },
    {
      "name": "Build resilience into the default",
      "description": "Accessibility, responsive content, and service failure are first-class states."
    }
  ],
  "specimenUrl": null
}
```
