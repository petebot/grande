# Phase 1 Quickstart: Planned Development and Validation

This guide defines the intended setup and acceptance path. Commands become executable
after the implementation tasks scaffold the workspace.

## Prerequisites

- Node.js 22
- Corepack with the repository-pinned pnpm version
- A Sanity project with separate development and production datasets
- A read-only public project ID/dataset configuration
- A server-only viewer token for authenticated draft preview
- Vercel access for local environment synchronization and production deployment

Production accounts should be created in or transferred to the business's ownership;
do not use a developer's personal project as the permanent home.

## Local configuration

Copy the committed example environment file to the local ignored environment file. The
implemented example must document, without real values:

```text
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=
PUBLIC_SANITY_API_VERSION=
SANITY_VIEWER_TOKEN=
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=
PUBLIC_SITE_URL=
```

Only project ID, dataset, API version, and public site URL may reach the browser. The
viewer token is server-only and must never use a `PUBLIC_` prefix.

## Install and start

```bash
corepack enable
pnpm install
pnpm dev
```

The root development command should run both applications and report their URLs:

- public SvelteKit site, conventionally `http://localhost:5173`
- Sanity Studio, conventionally `http://localhost:3333`

Studio Presentation must be configured to open the local public URL in authenticated
preview mode.

## Seed representative development content

Use a committed, non-production seed fixture that exercises:

- all seven weekly schedule days;
- one closed day, split hours, and an overnight interval;
- a future closure and future special-hours exception;
- multiple menu categories, unavailable and featured items, price variation, and only
  clearly labeled fictional/placeholder dietary data;
- active, future, and expired announcements;
- portrait, landscape, missing-image, and decorative-media states;
- long and short copy for responsive stress testing.

Fixture content must be visibly marked development-only and cannot be imported into the
production dataset as confirmed business content.

## Generate the fallback snapshot

```bash
pnpm content:snapshot
```

Expected result: a validated published-content projection is generated for the web app,
with no drafts, unresolved references, provisional production fields, or nondeterministic
ordering. Running validation should print the schema version, source revision, generation
time, and item counts without printing secrets or private notes.

## Static checks and tests

```bash
pnpm check
pnpm test:unit
pnpm test:e2e
pnpm build
```

The complete local acceptance run must cover:

1. TypeScript and Svelte diagnostics.
2. Hours calculations around midnight, exceptions, split hours, overnight intervals,
   and daylight-saving boundaries.
3. Content normalization, ordering, URL validation, price conversion, and rejection of
   provisional production content.
4. Customer journeys at narrow mobile and desktop sizes.
5. Keyboard navigation, focus visibility, semantic headings/landmarks, contrast review,
   axe smoke checks, and reduced-motion behavior.
6. Essential information with JavaScript disabled.
7. Forced Sanity timeout with a valid fallback snapshot.
8. Draft preview isolation and the absence of viewer tokens in browser output.
9. Visual snapshots for the system route and primary page states.

## Manual brand and content review

Before design sign-off:

1. Record each source logo, color, typeface, graphic device, photo, and tone sample.
2. Mark it confirmed, licensed, or proposed/provisional.
3. Review the `/system` route at phone and desktop widths.
4. Verify contrast, focus, wrapping, missing-media, stale-content, closure, and long-copy
   states.
5. Obtain business confirmation for canonical name, menu, prices, hours, ordering URL,
   story, dietary claims, and asset rights.
6. Remove or replace every provisional production value before launch.

## Editorial acceptance

In a development dataset, a representative nontechnical editor must be able to:

- mark an item unavailable and preview the result;
- update a price without entering an ambiguous value;
- add a dated closure and see the next-open message;
- schedule and expire an announcement;
- replace a photo with alt text, focal point, and rights metadata;
- publish changes without gaining access to layout, tokens, or deployment settings.

Record gaps as implementation defects, not training failures, when the interface does
not make the intended workflow evident.

## Production readiness

Before the handoff deploy:

- production environment variables are in business-owned hosting;
- Studio roles follow least privilege and recovery access is tested;
- the domain, billing, analytics, Sanity project/dataset, and media rights belong to or
  are contractually available to the business;
- snapshot generation and runtime fallback have been demonstrated;
- backups/exports and restoration instructions have been tested;
- monitoring covers build failure, public availability, broken primary actions, and
  stale snapshot age;
- owner documentation names routine editing, deployment, rollback, export, credential
  rotation, and support procedures.

## Phase completion signal

Planning is ready for task generation when `spec.md`, `plan.md`, `research.md`,
`data-model.md`, all contracts, and this quickstart contain no unresolved implementation
decisions or unlabeled production facts. Use the Spec Kit task workflow next; do not
scaffold ad hoc work that bypasses the agreed artifacts.
