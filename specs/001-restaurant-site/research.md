# Phase 0 Research: Grande Burrito Restaurant Website

## SvelteKit as the public framework

**Decision**: Use Svelte 5 and SvelteKit 2 with TypeScript.

**Rationale**: The project owner already works productively in Svelte, and Sanity now
provides an official SvelteKit integration for server rendering, draft mode, visual
editing, and Presentation. SvelteKit supports the semantic, mostly server-rendered
experience this small restaurant site needs without requiring a client-heavy runtime.

**Alternatives considered**:

- Next.js has a larger Sanity example ecosystem, but framework diversity is not itself
  valuable enough to override the owner's preferred stack.
- Astro would be strong for static content, but preview and request-time open/closed
  status are more direct in SvelteKit.

## Sanity as the content system

**Decision**: Use Sanity Studio and the hosted Content Lake. Deploy Studio separately
from the public website.

**Rationale**: The business needs a small, guided admin—not a generic page builder.
Sanity provides structured schemas, field validation, scheduled publishing options,
asset metadata, roles, preview, and a polished hosted editing interface. The official
SvelteKit tooling minimizes custom preview infrastructure. A separate Studio preserves
clear operational boundaries and can later move to a business-owned subdomain without
changing the public app.

**Alternatives considered**:

- Payload offers self-hosted ownership but adds database, authentication, upgrades,
  backups, and server operations that are disproportionate for a small restaurant.
- Keystatic is lightweight and repository-owned, but Git-based publishing and media
  workflows are less approachable for daily restaurant staff.
- A custom admin would provide full control but would duplicate mature authentication,
  editing, validation, and asset-management capabilities.

## Rendering, caching, and outage behavior

**Decision**: Server-render the public route on Vercel, fetch published content through
the Sanity API CDN with a bounded timeout, apply CDN cache directives with
stale-while-revalidate, and fall back to a deployment-generated snapshot of the same
published projection when fetching fails.

**Rationale**: SSR keeps menu, hours, location, and actions available without client
JavaScript while supporting preview and request-time Eastern Time status. CDN caching
limits latency and API dependence. The generated snapshot satisfies the requirement
that the last deployed published facts remain available during a CMS outage without
creating a second hand-maintained source of truth.

The snapshot is generated from the canonical public-content query before production
builds. A failed generation must fail the build unless an explicitly validated previous
snapshot is already present. Runtime fallback never contains drafts and exposes a
visible "last updated" timestamp only when content may be stale.

**Alternatives considered**:

- Fully static generation offers excellent availability but makes request-time preview
  and current-status behavior more awkward and can remain stale indefinitely when a
  webhook fails.
- Runtime-only Sanity fetching is simpler but cannot retain essential business facts
  through a provider or network outage.
- Duplicating menu and hours in source files would violate Operational Truth.

## Hours calculation

**Decision**: Store weekly intervals and dated or ranged exceptions as structured
fields; resolve them in a pure, tested domain module using `America/New_York` as the
business timezone. An exception overrides each affected local date; the shortest range
wins and explicit priority breaks ties. Equal-span/equal-priority overlaps are invalid.
The server supplies the initial status and next transition; a small client enhancement
refreshes status after hydration.

**Rationale**: Hours are operational data, not prose. Explicit intervals support split
days and overnight service. Dated overrides cover closures and special hours without
rewriting the weekly schedule. A pure resolver is deterministic and testable around
midnight, daylight-saving transitions, and cross-midnight intervals.

**Alternatives considered**:

- Free-text hours are easy to author but cannot safely drive open/closed status.
- Relying on a directory provider would introduce another operational source and is
  outside this project's scope.

## Repository and package layout

**Decision**: Use a pnpm workspace with `apps/web`, `apps/studio`, and one
`packages/content` package.

**Rationale**: Web and Studio deploy independently, while queries, normalized types,
and snapshot generation must evolve together. Keeping the visual system in the web app
avoids a package abstraction with no second consumer.

**Alternatives considered**:

- Two repositories complicate coordinated schema and query changes.
- A single application directory obscures deployment boundaries.
- More shared packages add ceremony without a current consumer.

## Visual-system implementation

**Decision**: Inventory the existing logo, colors, typography, shapes, voice, and
photography before styling. Translate confirmed findings into named CSS custom-property
tokens and a compact library of Svelte components. Provide a development-only `/system`
route showing tokens, type, controls, cards, menu states, announcements, and responsive
examples.

**Rationale**: The portfolio value comes from a coherent interpretation of the existing
brand, not decoration layered onto a template. Native CSS tokens keep the runtime small,
make responsive and accessible states inspectable, and remain easy to hand off.

**Alternatives considered**:

- A utility framework would be workable but adds a styling vocabulary not required by
  this small system.
- A public Storybook deployment adds maintenance and another deliverable; Playwright
  coverage plus the local system route is enough for the first release.

## Preview and editorial workflow

**Decision**: Use Sanity Presentation and the official SvelteKit visual-editing tools
for authenticated draft preview. Organize Studio around staff jobs: Today, Menu, Hours,
Announcements, Website Copy, and Media. Editors can change structured content but cannot
select arbitrary colors, type, spacing, markup, or layout.

**Rationale**: Task-oriented navigation lowers training cost. Draft preview reduces the
risk of publishing bad menu or schedule data. Layout constraints protect the design
system and make the site safe to maintain after handoff.

**Alternatives considered**:

- A general document list exposes implementation concepts instead of staff tasks.
- Portable page-builder blocks would give unnecessary layout authority and undermine
  the brand system.

## Verification strategy

**Decision**: Use Vitest for hours, scheduling, normalization, validation, and fallback
logic. Use Playwright for P1/P2 customer journeys at mobile and desktop widths, preview
smoke tests, keyboard operation, no-JavaScript essentials, visual regression, and
automated axe scans. Run `svelte-check`, production build, snapshot generation, and
broken-link checks in CI. Confirm final copy, facts, rights, and credentials manually
with a handoff checklist.

**Rationale**: The highest-risk failures are incorrect operational facts, inaccessible
primary actions, visual drift, and a site that becomes unusable when a dependency fails.
The test split exercises these risks at the cheapest reliable level.

**Alternatives considered**:

- Unit-only testing misses rendering, responsive, and no-JavaScript behavior.
- End-to-end-only testing makes time and schedule edge cases slow and brittle.

## Hosting and ownership

**Decision**: Target Vercel for the SvelteKit site and Sanity hosting or a separately
mapped business-owned hostname for Studio. Production accounts, domains, analytics,
datasets, tokens, and billing must be controlled by the business before handoff.

**Rationale**: The adapters and preview tooling are mature, deployment is low-operations,
and account ownership can transfer cleanly. The architecture does not depend on a
developer-owned server.

**Alternatives considered**:

- A long-lived custom server creates avoidable operations.
- Developer-owned production accounts would make the finished site difficult to sell
  and violate Transferable Ownership.

## Primary references

- [Sanity visual editing with SvelteKit](https://www.sanity.io/docs/visual-editing/visual-editing-with-sveltekit)
- [Sanity Studio deployment](https://www.sanity.io/docs/studio/deployment)
- [Sanity API CDN configuration](https://www.sanity.io/docs/help/js-client-cdn-configuration)
- [SvelteKit Vercel adapter](https://svelte.dev/docs/kit/adapter-vercel)
- [SvelteKit page options](https://svelte.dev/docs/kit/page-options)
- [SvelteKit SEO](https://svelte.dev/docs/kit/seo)
