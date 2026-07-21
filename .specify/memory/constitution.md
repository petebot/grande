<!--
Sync Impact Report
- Version change: template → 1.0.0
- Added principles:
  - I. Brand Fidelity
  - II. Operational Truth
  - III. Owner-Safe Editing
  - IV. Mobile-First Usefulness
  - V. Accessible Expression
  - VI. Performance as Hospitality
  - VII. Honest Content
  - VIII. Transferable Ownership
- Added sections:
  - Product and Technology Constraints
  - Development Workflow and Quality Gates
- Removed sections: none; template placeholders were replaced
- Templates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Agent guidance:
  - ✅ .agents/skills/speckit-*/SKILL.md reviewed; no Codex-incompatible references found
- Follow-up TODOs: none
-->

# Grande Burrito Digital Experience Constitution

## Core Principles

### I. Brand Fidelity
The digital experience MUST extend Grande Burrito's real-world identity rather than
replace it with generic restaurant styling. Existing marks, signage, menus, materials,
and photography direction MUST be inventoried before the visual system is finalized.
Every new token, type choice, illustration, motion pattern, and component variant MUST
trace back to documented brand principles. Unapproved reconstruction or alteration of
the business's logo is prohibited.

### II. Operational Truth
Hours, menu items, prices, availability, announcements, contact details, and location
information MUST have one structured source of truth. Customer-facing views and
structured metadata MUST derive from that source; competing hard-coded values are
prohibited. Temporary changes MUST support effective and expiration dates so stale
operational information does not remain public.

### III. Owner-Safe Editing
Business editors MUST control content, ordering, availability, scheduling, and a small
set of approved copy fields. They MUST NOT be required to edit code or control layout,
design tokens, or arbitrary page composition. Every editable field MUST have a clear
label, validation, sensible default, and previewable outcome. Destructive actions MUST
be avoidable through visibility and availability states where practical.

### IV. Mobile-First Usefulness
The primary mobile experience MUST make current open status, menu access, directions,
and phone contact immediately available. Core customer journeys MUST remain complete at
small viewport sizes and with touch input. Desktop composition may become more
expressive, but MUST NOT introduce information or actions unavailable to mobile users.

### V. Accessible Expression
Expressive design MUST preserve semantic structure, readable contrast, visible focus,
keyboard access, descriptive alternatives for meaningful media, and reduced-motion
support. Menu information MUST remain understandable without relying on color, imagery,
hover, or animation. Accessibility requirements MUST be represented in specifications,
tasks, and automated or documented validation.

### VI. Performance as Hospitality
The site MUST be useful on an ordinary mobile connection while a visitor is moving
through Freeport. Specifications MUST define measurable loading and interaction budgets
for primary journeys. Images, fonts, animation, analytics, maps, and other third-party
resources MUST be justified, optimized, and loaded only when their customer value
outweighs their cost.

### VII. Honest Content
Unverified menu details, prices, dietary claims, hours, testimonials, business history,
and brand assets MUST be marked as provisional in non-production environments and MUST
NOT be presented as confirmed facts in production. Public-source material MUST retain
source notes during discovery. Customer or social-media photography MUST NOT be
republished without permission or a documented license.

### VIII. Transferable Ownership
Production infrastructure, accounts, content, domains, analytics, and documentation
MUST be transferable to Grande Burrito without dependence on a developer's personal
identity. Secrets MUST remain outside version control. The project MUST include a
documented setup, content export path, deployment procedure, and owner handoff workflow.

## Product and Technology Constraints

- The public experience is a focused restaurant website, not a general-purpose page
  builder, ordering platform, or customer-account system unless a later specification
  explicitly adds that scope.
- Content models MUST represent business concepts directly: business information,
  regular and exceptional hours, menu categories, menu items, announcements, and
  controlled page copy.
- Public content MUST be server-rendered or pre-rendered so essential information remains
  crawlable and usable without client-side scripting.
- Structured business data MUST use the same normalized content as visible pages.
- Development and sample datasets MUST distinguish researched facts, assumptions, and
  invented placeholder content.
- Dependencies and abstractions MUST solve a current requirement. Future-proofing alone
  is not sufficient justification for complexity.

## Development Workflow and Quality Gates

1. Research and brand discovery precede final visual-system decisions.
2. Specifications define user value, content provenance, scope boundaries, measurable
   outcomes, accessibility, performance, and handoff expectations before planning.
3. Plans MUST document how each constitutional principle is satisfied and MUST record
   any justified exception in Complexity Tracking.
4. Tasks MUST include content validation, responsive behavior, accessibility checks,
   performance validation, structured-data validation, and handoff documentation where
   relevant.
5. User-facing behavior MUST have independently executable acceptance scenarios.
   Automated tests are required for deterministic business logic; visual, accessibility,
   and end-to-end checks may combine automation with documented manual review.
6. A feature is complete only after its quickstart scenarios pass, provisional content is
   identifiable, and the implementation converges with its specification and plan.

## Governance

This constitution supersedes conflicting project conventions and generated artifacts.
Amendments require a documented rationale, a Sync Impact Report, updates to dependent
templates or specs, and an explicit semantic-version change. MAJOR changes remove or
redefine governing obligations, MINOR changes add or materially expand principles, and
PATCH changes clarify wording without changing obligations.

Every specification, plan, and implementation review MUST check constitutional
compliance. Violations of a MUST statement block implementation or release unless the
constitution is explicitly amended first. Complexity exceptions MUST identify the
requirement they serve and the simpler alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-07-21 | **Last Amended**: 2026-07-21
