# Design System Contract

**Version:** 1.0.0

**Last updated:** 2026-07-22

**Status:** Portable baseline

## Purpose

This contract defines the design-system discipline shared across projects. It is
intended for designers, engineers, and AI agents working in any repository.

The contract standardizes how a design system is structured, applied,
documented, and verified. It does not standardize a project's visual identity.
Each project should define its own brand, aesthetic, product-specific patterns,
and token values within these rules.

The goal is consistency of method, not sameness of appearance.

## Requirement language

The words **must**, **should**, and **may** are intentional:

- **Must** indicates a requirement. Exceptions need to be documented.
- **Should** indicates the preferred approach. Deviations need a reason.
- **May** indicates an optional practice.

## Source of truth

Every project following this contract must maintain:

1. This shared `DESIGN_SYSTEM_CONTRACT.md` file.
2. A project-specific `docs/design-system.md` file.
3. A discoverable visual specimen, component catalog, or system route.
4. Automated or repeatable checks appropriate to the project's technology.

The shared contract defines the rules. The project-specific document records
the implementation, decisions, exceptions, and current system inventory.

If documentation and implementation disagree, treat the implementation as a
defect or update the documentation in the same change. Do not leave the
disagreement unresolved.

## Core principles

### 1. Use semantic decisions

Components must consume semantic tokens or documented system primitives rather
than depending directly on raw palette values or arbitrary measurements.

Prefer a role such as `color.text.muted` over a visual description such as
`gray.600`. Raw primitives may exist beneath the semantic layer, but product UI
should normally consume the semantic layer.

### 2. Design the complete state

A component is not complete when only its default appearance exists. Relevant
interactive, responsive, content, and system states must be considered together.

### 3. Accessibility is part of the system

Accessibility requirements must be encoded in tokens, components, and tests
where possible. Accessibility must not depend on every feature author remembering
to reconstruct it independently.

### 4. Prefer reuse with purpose

Reuse an existing token, primitive, or component when its meaning and behavior
fit the problem. Do not force reuse when it produces misleading semantics,
excessive configuration, or a poor user experience.

### 5. Record decisions, not just artifacts

The project design-system document must explain the principles and constraints
behind important choices. A component gallery alone is not sufficient.

## Required system structure

### Foundations

Each project must define the applicable foundations below:

- Color roles and themes
- Typography families, sizes, weights, and line heights
- Spacing scale
- Layout widths, grids, and breakpoints
- Borders, radii, and shadows
- Focus treatment
- Motion durations and easing
- Layering or z-index strategy
- Minimum interactive target sizing

A project may omit an inapplicable category, but the omission should be noted in
`docs/design-system.md`.

### Token model

Tokens should be organized into up to three layers:

1. **Primitive tokens:** raw values such as colors or measurements.
2. **Semantic tokens:** roles such as background, text, border, focus, success,
   or danger.
3. **Component tokens:** narrowly scoped values needed by a reusable component.

Projects do not need all three layers. Small projects should begin with semantic
tokens and add primitive or component layers only when they clarify the system.

Token names must describe purpose rather than a single current appearance.
Components must not consume another component's private tokens.

Raw values may be used when they are genuinely local, non-repeating, and not a
design decision. Repeated or meaningful values should be promoted into the
system.

### Components and patterns

Reusable UI must be classified as one of the following:

- **Primitive:** a low-level building block such as Stack, Text, or Surface.
- **Component:** a reusable interaction or content unit such as Button or Card.
- **Pattern:** a composition that solves a recurring product problem.
- **Feature UI:** domain-specific UI that may use system parts without becoming
  part of the shared component inventory.

Do not generalize feature UI prematurely. A component should enter the system
when it has a stable purpose, a reusable API, and more than one credible use.

## Component requirements

Every system component must document or demonstrate:

- Purpose and appropriate usage
- Supported variants and sizes
- Content guidance or meaningful constraints
- Relevant interactive states
- Keyboard behavior
- Accessible name and semantic role
- Responsive behavior
- Loading, empty, and error behavior when applicable
- Theme behavior when multiple themes exist

Relevant states may include:

- Default
- Hover
- Focus-visible
- Active or pressed
- Selected
- Disabled
- Loading or pending
- Error, warning, and success
- Empty
- Overflow, long content, and localization stress

Native HTML semantics should be preferred when building for the web. Custom
interaction behavior must include the expected keyboard and assistive-technology
behavior of the role it implements.

## Accessibility baseline

Projects must target WCAG 2.2 AA unless a stricter project requirement applies.

At minimum:

- Text and essential UI contrast must meet the applicable contrast requirement.
- All functionality must be keyboard accessible.
- Focus-visible treatment must be obvious and must not be removed without an
  accessible replacement.
- Interactive targets should be at least 44 by 44 CSS pixels where practical.
- Information must not be conveyed by color alone.
- Form controls must have accessible labels, instructions, and error association.
- Dynamic status changes should be announced when necessary.
- Content structure must use meaningful headings and landmarks.
- Images must have purposeful alternative text or be marked decorative.
- Motion must respect reduced-motion preferences.
- Zoom, text resizing, reflow, and common viewport sizes must remain usable.

Accessibility exceptions must be recorded with the affected experience, impact,
reason, mitigation, owner, and intended resolution.

## Responsive and content resilience

Components must be designed around available space rather than a single device.
They should tolerate:

- Narrow and wide containers
- Increased text size
- Long labels and unbroken content
- Missing or optional content
- Different input methods
- Light, dark, and high-contrast environments when supported

Visual reordering must not create a confusing reading or keyboard order.
Breakpoints should be introduced because content or interaction requires them,
not solely to match a conventional device width.

## Motion

Motion must communicate hierarchy, continuity, feedback, or state. Decorative
motion should remain restrained and must not block task completion.

Durations and easing should use system tokens. Components must provide a reduced-
motion behavior that removes or simplifies nonessential movement without hiding
important state changes.

## Project identity

Each project is expected to define its own expression within this contract,
including:

- Design principles
- Brand palette and typography
- Density and spatial character
- Shape and illustration language
- Voice and content conventions
- Motion character
- Product-specific components and patterns

Projects should not inherit another project's visual values merely because both
follow this contract. Shared visual components should be limited to products
that genuinely belong to the same family.

## Documentation requirements

The project-specific `docs/design-system.md` must include:

1. Contract version followed
2. System name and status
3. Three to five design principles
4. Foundation and token overview
5. Component and pattern inventory
6. Accessibility target and known exceptions
7. Visual specimen location
8. Validation commands or manual verification procedure
9. Major decisions and change history
10. Case-study evidence available for the portfolio

Recommended status values are `experimental`, `emerging`, `living`, and
`maintenance`.

The visual specimen should show tokens, representative components, component
states, and at least one realistic composition. It may be a dedicated route,
Storybook, generated documentation, a design file, or another durable artifact.

## AI-agent operating procedure

Before making a user-interface change, an AI agent must:

1. Read this contract completely.
2. Read the project's `docs/design-system.md` completely.
3. Inspect the existing token definitions and relevant components.
4. Identify whether the request extends, composes, or intentionally departs from
   the current system.

While implementing, an AI agent must:

1. Reuse semantic tokens and system components when their purpose fits.
2. Avoid introducing raw color, typography, spacing, radius, shadow, z-index, or
   motion values without evaluating whether they belong in the system.
3. Implement the relevant states, responsive behavior, and accessibility behavior.
4. Keep project-specific expression intact rather than importing the visual
   identity of another project.
5. Make the smallest coherent system change that solves the problem.

Before considering the work complete, an AI agent must:

1. Run the project's required checks.
2. Inspect the result at representative viewport sizes.
3. Verify keyboard focus and reduced-motion behavior when relevant.
4. Update the system specimen when a system component or token changes.
5. Update `docs/design-system.md` when the system's behavior, inventory, or
   rationale changes.
6. Report any exception or unverified behavior explicitly.

An AI agent must not:

- Invent a parallel token or component system for a local feature.
- Replace established semantics solely to produce a different aesthetic.
- Create a generalized component from a single speculative use case.
- hide accessibility or responsive defects behind visual polish.
- Claim that a requirement was verified when it was only inferred.

## Validation

Each project should provide commands equivalent to:

```sh
npm run check:design-system
npm run test:a11y
npm run test:visual
```

Names and tooling may differ. The repeatable verification should cover as much of
the following as the project warrants:

- Raw design values outside approved token locations
- Invalid or unused tokens
- Type and lint errors
- Component behavior tests
- Automated accessibility checks
- Keyboard interaction checks
- Representative responsive views
- Visual regression of the system specimen
- Light, dark, reduced-motion, and high-contrast modes when supported

Automated checks supplement, but do not replace, human visual and interaction
review.

## Change management

A design-system change should include:

- The problem being solved
- Affected tokens, components, patterns, and screens
- Compatibility or migration impact
- Accessibility impact
- Updated documentation and specimens
- Verification performed

Breaking changes should be intentional and clearly identified. Projects that
copy this contract should record the contract version they follow and review
changes before adopting a newer version.

## Distribution and update checks

The canonical copy of this contract is published at:

`https://raw.githubusercontent.com/petebot/portfolio26/main/DESIGN_SYSTEM_CONTRACT.md`

Adopting projects should record both that source URL and their adopted contract
version in `docs/design-system.md`. A project may also record them in a
machine-readable project manifest when one already exists.

Projects should check the canonical source on a schedule or during continuous
integration and notify maintainers when its declared version differs from the
adopted version. The check should open an issue, create a dependency-style pull
request, or fail a dedicated informational job.

Projects must not silently replace their local contract. Contract updates may
change design, accessibility, documentation, or validation expectations and
therefore require review. An automated update pull request is preferred because
it keeps adoption deliberate and provides a durable change record.

The canonical contract version must be changed whenever its requirements or
expected behavior change. Editorial corrections that do not change meaning may
retain the current version.

## Exceptions

Exceptions are allowed when they produce a better project outcome. An exception
must be explicit rather than accidental.

Record:

- The rule being departed from
- The project need or constraint
- The scope of the exception
- Accessibility and maintenance impact
- Whether the exception is temporary or permanent

An experiment may begin outside the system, but it should be promoted, revised,
or removed once its role becomes clear.

## Portfolio and case-study evidence

Each project should preserve evidence that makes its system visible in a case
study. Aim to capture:

- Three to five project design principles
- A concise foundation or token specimen
- Representative components with meaningful states
- One product-specific pattern
- Annotated screens showing the system in context
- One example of a system decision propagating across the product
- One accessibility or resilience example
- One example of iteration, tradeoff, or an intentional exception

Case studies should explain what the system enabled, not merely display a catalog
of parts. Useful outcomes include faster iteration, stronger coherence, fewer
accessibility defects, easier content management, or clearer collaboration.

### Portfolio handoff

When a project is prepared for inclusion in a portfolio, its maintainer or AI
agent should produce the following handoff object:

```json
{
  "name": "Project System Name",
  "status": "living",
  "contractVersion": "1.0.0",
  "summary": "What the system is designed to accomplish.",
  "principles": [
    {
      "name": "Principle name",
      "description": "How this principle influences product decisions."
    },
    {
      "name": "Principle name",
      "description": "How this principle influences product decisions."
    },
    {
      "name": "Principle name",
      "description": "How this principle influences product decisions."
    }
  ],
  "specimenUrl": null
}
```

The handoff must contain three to five principles. `status` must be one of
`experimental`, `emerging`, `living`, or `maintenance`. `specimenUrl` may be
`null` when the system specimen is not publicly accessible.

The project should accompany the object with:

- The location of its project-specific design-system document
- The location of its visual specimen
- A representative foundation or token artifact
- One component shown in meaningful states
- One product-specific pattern shown in context
- One accessibility or resilience example
- One propagation, iteration, tradeoff, or exception example
- Concise captions and alternative text for visual assets

This is an exchange format, not a required source-project file structure. The
project may return the object in an issue, pull request, generated artifact, or
other handoff document. The receiving portfolio is responsible for adapting it
to its own content model, including placing it in `project.json` when that is
the portfolio's convention.

## Adoption checklist

- [ ] Copy this contract into the project root.
- [ ] Record the canonical source URL and adopted version in
      `docs/design-system.md`.
- [ ] Define the project's design principles and identity.
- [ ] Establish semantic tokens for applicable foundations.
- [ ] Inventory current primitives, components, patterns, and feature UI.
- [ ] Create a discoverable visual specimen.
- [ ] Add validation commands or document repeatable manual checks.
- [ ] Reference both design-system documents from the project's agent guidance.
- [ ] Record known exceptions and gaps.
- [ ] Identify the artifacts to preserve for the portfolio case study.
- [ ] Produce the portfolio handoff object and evidence package when requested.
- [ ] Add an upstream version check when the project has continuous integration.

## Suggested agent-guidance reference

Projects may place the following section in `AGENTS.md` or equivalent guidance:

```md
## Design-system requirements

Before making UI changes:

1. Read `DESIGN_SYSTEM_CONTRACT.md` completely.
2. Read `docs/design-system.md` completely.
3. Inspect existing tokens and relevant components before adding new ones.
4. Follow the contract's component, accessibility, documentation, and validation
   requirements.
5. Update the project design-system document and visual specimen when the system
   changes.
6. Report exceptions and unverified behavior explicitly.
```
