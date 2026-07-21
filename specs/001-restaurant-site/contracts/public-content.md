# Contract: Public Content Delivery

## Purpose

Define the boundary between Sanity authoring and the SvelteKit public experience so
that live fetches, preview, tests, and outage snapshots produce the same shape.

## Canonical projection

`getPublicSiteContent({ perspective, now })` returns the versioned Normalized Public
Site Snapshot from [data-model.md](../data-model.md). The only accepted perspectives are:

- `published`: public site, build snapshot, and production tests
- `drafts`: authenticated Studio Presentation only

The query and normalizer live in `packages/content`; neither application may maintain a
parallel query for public business facts.

## Server loading behavior

For an ordinary public request, the SvelteKit server must:

1. Begin a published Sanity CDN request with a short, explicit timeout.
2. Validate and normalize the result before exposing it to a route.
3. If the request times out, fails, or is invalid, load the checked-in/generated
   deployment snapshot through the same validator.
4. Return a typed `contentSource` value of `live`, `cache`, or `snapshot` and the
   snapshot's `generatedAt` value for diagnostics.
5. Compute the current hours state from normalized data in `America/New_York`.
6. Never return a partially combined mixture of live and snapshot business content.

The route must set cache directives that permit CDN reuse and stale-while-revalidate
without caching authenticated preview responses.

## Snapshot generation

The production build pipeline must invoke one script that:

1. Fetches the canonical projection with the `published` perspective.
2. Rejects unresolved references, invalid fields, and provisional production content.
3. Normalizes ordering, money, URLs, dates, and media references deterministically.
4. Writes `schemaVersion`, `generatedAt`, and `contentRevision` with the projection.
5. Produces stable output when source content has not changed, except `generatedAt`.

A production deploy cannot silently generate a snapshot from drafts or sample content.
If Sanity is unavailable, CI may retain a previously validated snapshot only through an
explicit documented recovery path.

## Preview behavior

- Draft perspective requires a server-only viewer token and authenticated preview mode.
- The token must never be serialized into page data, logs, client bundles, or snapshots.
- Preview responses are private and uncacheable.
- Visual-editing metadata and overlays load only in preview mode.
- Leaving preview returns the user to published content immediately.

## Error and stale-content presentation

- If snapshot fallback supplies valid essential content, the public page remains usable.
- A small freshness notice may appear when the fallback age exceeds the configured
  threshold; it must not obscure menu, hours, phone, or directions.
- If neither live content nor a valid snapshot exists, the server returns a deliberate
  service-unavailable page with confirmed phone/address fallback only if that fallback
  was generated from the same canonical projection.
- Internal error details and Studio document identifiers are never shown publicly.

## Acceptance examples

| Situation | Required result |
|---|---|
| Sanity responds with valid published content | Render normalized live content |
| Sanity exceeds timeout | Render complete deployment snapshot |
| Sanity returns a malformed menu item | Reject entire live projection; use snapshot |
| Draft preview includes provisional photo | Show editor warning in preview only |
| Published dataset contains provisional price | Snapshot generation fails |
| Client JavaScript disabled | Menu, hours, phone, address, and directions remain present |
