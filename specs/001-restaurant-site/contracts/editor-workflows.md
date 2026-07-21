# Contract: Owner-Safe Editorial Workflows

## Roles

### Editor

May update menu availability and prices, weekly hours, exceptions, announcements,
bounded website copy, and approved assets. Cannot change schema, layout, design tokens,
deployment settings, credentials, or provenance evidence after it is locked.

### Administrator

May manage editors, validate provenance, approve production-safe media, manage datasets,
and configure Presentation. Administrative access is limited to business owners and the
handoff team.

### Developer

May change schemas, queries, visual components, and deployment code through version
control. Developer access is not required for ordinary content operations.

## Studio navigation

The primary navigation is job-oriented:

1. **Today** — current public status, active announcement, today's hours, upcoming
   exception, and quick links to the most common edits
2. **Menu** — ordered categories and items, availability, prices, labels, and images
3. **Hours** — weekly schedule and dated exceptions
4. **Announcements** — active, scheduled, expired, and draft notices
5. **Website Copy** — bounded homepage and SEO fields
6. **Media** — assets, alt text, focal point, rights status, and evidence

Implementation-oriented document types and singleton duplication are hidden from the
ordinary Editor view.

## Required workflows

### Mark an item unavailable

1. Open Menu and find the item by category or search.
2. Disable availability without deleting or unpublishing the item.
3. Preview the public menu.
4. Publish the change.

Target: a trained editor completes this in two minutes without developer help.

### Change a price

The Studio accepts one price or labeled price variants, displays their public format in
preview, rejects negative or ambiguous values, and records validation before publication.

### Add a special closure or special hours

The editor chooses a local date or range, selects Closed or Special hours, optionally
adds a public note and priority, previews the resulting current/next-open message, and
publishes. Ambiguous equal-specificity/equal-priority overlaps are blocked.

### Schedule an announcement

The editor enters plain-language content, type, start, end, priority, and optional safe
action link. Studio shows the visibility window in Eastern Time, permits an intentionally
open-ended notice, and prevents an end before the start.

### Add or replace media

The editor must add alternative text or explicitly mark the asset decorative, choose a
focal point for prominent crops, and attach rights status/evidence. Provisional media is
previewable but production validation prevents it from entering the public snapshot.

## Guardrails

- Singleton documents cannot be duplicated or deleted by Editors.
- Raw HTML, arbitrary portable-text blocks, custom CSS, color, spacing, and layout
  controls are unavailable.
- External URLs require HTTPS and an allowlist or explicit validation.
- Dietary labels include a warning that they require business verification and are not
  inferred automatically.
- Destructive operations show consequences and prefer deactivation over deletion.
- Scheduled content shows local timezone and a human-readable summary.
- Preview clearly distinguishes draft, provisional, scheduled, and published state.

## Handoff evidence

Before sale or transfer, the owner receives:

- business-owned Sanity organization/project and hosting accounts;
- role assignments and recovery contacts;
- a one-page guide for each required workflow;
- a content export and restoration procedure;
- a credential rotation and least-privilege checklist;
- a supervised acceptance session in which a representative editor completes menu,
  hours, announcement, and media tasks without developer intervention.
