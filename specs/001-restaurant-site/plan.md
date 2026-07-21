# Implementation Plan: Grande Burrito Restaurant Website

**Branch**: `001-restaurant-site` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-restaurant-site/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a fast, mobile-first website that helps a prospective guest decide what to
order, confirm whether Grande Burrito is open, and get directions or call without
friction. The public experience will be a SvelteKit application rendered on Vercel.
Structured business content will come from a separately deployed Sanity Studio with
constrained editing surfaces for menu, hours, announcements, copy, and licensed media.
A deployment-generated snapshot of the same published Sanity content will provide a
last-known-good fallback if the CMS cannot be reached. The visual system will be
derived from an explicit brand inventory and implemented as reusable CSS tokens and
Svelte components, with a development-only design-system route for review.

## Technical Context

**Language/Version**: TypeScript on Node.js 22; Svelte 5.56.7 and SvelteKit 2.70.1

**Primary Dependencies**: `@sanity/sveltekit` 2.0.0, Sanity Studio 6.5.0,
`@sveltejs/adapter-vercel` 6.3.4, `@sanity/client`, `@sanity/visual-editing`

**Storage**: Sanity Content Lake for authored content; a generated, versioned JSON
snapshot of published content for runtime outage fallback; local static assets only
for approved brand primitives that are not editor-managed

**Testing**: Vitest 4.1.10 for domain logic and content normalization; Playwright
1.61.1 plus axe checks for customer journeys, accessibility smoke tests, no-JavaScript
behavior, and visual regression; `svelte-check` and TypeScript for static validation

**Target Platform**: Modern mobile and desktop browsers; SvelteKit SSR on Vercel's
Node.js runtime; Sanity Studio deployed separately on Sanity hosting or a business-owned
subdomain

**Project Type**: pnpm workspace containing a public web application and CMS studio

**Performance Goals**: Essential content usable within 2.5 seconds on a representative
mobile connection; LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at the 75th percentile;
initial public-route JavaScript budget <= 100 kB compressed, excluding preview-only code

**Constraints**: One authoritative structured content source; last-published business
facts remain available during CMS failure; Eastern Time rules including exceptions;
no owner-editable layout primitives; no unlicensed or invented production content;
core menu, hours, address, and actions work without client JavaScript

**Scale/Scope**: One restaurant location, one primary public page plus legal/not-found
support routes, one Studio, a small editor team, tens of menu items, and low-to-moderate
local restaurant traffic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Brand Fidelity**: Brand inventory and design rationale are documented before final
  visual decisions.
- **Operational Truth**: Structured content has one source of truth with no competing
  hard-coded business data.
- **Owner-Safe Editing**: Editor permissions and content controls cannot alter layout or
  design-system rules.
- **Mobile-First Usefulness**: Primary customer journeys are complete on small screens.
- **Accessible Expression**: Semantic, keyboard, contrast, media, and motion requirements
  have validation coverage.
- **Performance as Hospitality**: Primary journeys have measurable budgets and all
  third-party resources are justified.
- **Honest Content**: Provisional facts and assets are identifiable and cannot ship as
  confirmed production content.
- **Transferable Ownership**: Setup, secrets, deployment, export, and handoff are designed
  for business ownership.

**Pre-research result: PASS.** The architecture has an explicit path for every gate.
No principle requires an exception.

**Post-design result: PASS.** The Phase 1 content model, contracts, and quickstart
preserve a single source of operational truth, constrain editor authority, specify
provenance states, cover mobile/accessibility/performance validation, and document
business-owned deployment and recovery. No design artifact introduces a violation.

## Project Structure

### Documentation (this feature)

```text
specs/001-restaurant-site/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   ├── content/
│   │   │   ├── design/
│   │   │   ├── hours/
│   │   │   └── server/
│   │   └── routes/
│   │       ├── +page.server.ts
│   │       ├── +page.svelte
│   │       ├── api/preview/
│   │       └── system/
│   ├── static/
│   └── tests/
│       ├── e2e/
│       └── fixtures/
└── studio/
    ├── schemaTypes/
    ├── structure/
    └── sanity.config.ts

packages/
└── content/
    ├── src/
    │   ├── queries.ts
    │   ├── normalize.ts
    │   ├── snapshot.ts
    │   └── types.ts
    └── tests/

scripts/
└── generate-content-snapshot.ts
```

**Structure Decision**: Use a small pnpm workspace because the public SvelteKit app
and Sanity Studio have different runtimes and deployment targets but must share one
typed content contract. `packages/content` is the only shared package; visual-system
code remains inside `apps/web` because no second consumer exists. The `/system` route
is disabled in production and exists only to review tokens, components, states, and
responsive behavior during development.

## Complexity Tracking

No constitution violations require justification. The single shared package exists
only to prevent schema/query/frontend drift between the two deployable applications.
