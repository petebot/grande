# Contributing to Grande Burrito

This repository uses Spec Kit for product intent and GitHub for execution and review.
The specification is authoritative for behavior; GitHub issues mirror the executable
tasks and must link back to their Spec Kit task IDs.

## Before starting work

1. Read `.specify/memory/constitution.md` and the active feature's `spec.md`, `plan.md`,
   and `tasks.md`.
2. Choose one ready task with no unmet dependency.
3. Confirm there is one GitHub issue whose title begins with that task ID.
4. Assign the issue and move it to **In progress** in the project.
5. Create a short-lived branch from an up-to-date `main`.

## Branch names

Use `<type>/<task-id>-<short-description>` in lowercase kebab case:

```text
feat/t024-menu-components
fix/t032-scheduled-content-refresh
docs/t057-development-guide
test/t021-scheduled-content-expiry
chore/t005-project-tooling
```

Allowed types are `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`,
`chore`, and `revert`. Do not work directly on `main`.

## Commits

Use Conventional Commits:

```text
<type>(optional-scope): imperative summary
```

Examples:

```text
feat(menu): render sold-out item states
fix(hours): resolve overnight exceptions
docs(handoff): add Sanity export recovery steps
test(content): cover invalid snapshot fallback
```

Keep commits reviewable and internally coherent. Reference the issue in the body when it
is not obvious from the branch or pull request. Use `BREAKING CHANGE:` in the footer only
for an intentional incompatible content contract or operator workflow change.

## Pull requests

GitHub calls merge requests **pull requests**. Open a draft PR early when feedback or CI
visibility is useful. A PR should normally represent one Spec Kit task or one tightly
coupled task group and must:

- use a Conventional Commit title, because squash merge promotes it to `main` history;
- link the issue with `Closes #<number>`;
- state the Spec Kit task ID and user story;
- describe verification and attach visual evidence for UI work;
- call out content provenance, accessibility, performance, schema, or handoff impact;
- have passing required checks and resolved review threads before merge.

Prefer **squash merge**. Delete the branch after merge. Avoid merge commits and direct
pushes to `main`; use rebase merge only when preserving a deliberately structured commit
series adds real value.

## Versioning and releases

Use Semantic Versioning once there is a public deployable release:

- `PATCH`: compatible bug, copy, content-model validation, or documentation fixes
- `MINOR`: compatible customer or editor capability
- `MAJOR`: incompatible public contract, migration, or operator workflow change

Release notes should be generated from merged Conventional Commit PR titles and grouped
by customer/editor impact. Portfolio preview builds may remain `0.x`; the first accepted
business handoff can become `1.0.0`.

## Definition of done

A task is done only when its acceptance evidence passes, documentation is updated,
provisional content remains identifiable, CI is green, and `tasks.md` plus the GitHub
issue accurately reflect completion. Check the task in `tasks.md` in the same PR that
finishes it, then move its issue to **Done** when the PR merges.
