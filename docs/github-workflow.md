# GitHub Planning and Delivery Workflow

## Sources of truth

- `.specify/memory/constitution.md` governs non-negotiable project principles.
- `specs/001-restaurant-site/spec.md` defines outcomes and acceptance.
- `specs/001-restaurant-site/plan.md` defines architecture.
- `specs/001-restaurant-site/tasks.md` defines dependency-ordered implementation work.
- GitHub Issues mirror tasks for assignment, discussion, and delivery status.
- Pull requests provide review and acceptance evidence; they do not silently redefine
  the specification.

When implementation reveals a genuine product change, update the relevant Spec Kit
artifact in the same or a preceding PR before treating the issue as complete.

## GitHub Project setup

Create one organization- or repository-level Project named **Grande Burrito Website**.
Use these fields:

| Field     | Values                                                |
| --------- | ----------------------------------------------------- |
| Status    | Backlog, Ready, In progress, In review, Blocked, Done |
| Phase     | Setup, Foundation, US1, US2, US3, US4, Release        |
| Priority  | P1, P2, P3, P4                                        |
| Task ID   | Exact `T###` value                                    |
| Size      | XS, S, M, L; split anything larger than L             |
| Milestone | MVP, Brand system, Editor experience, Handoff, Launch |

Recommended views:

- **Board** grouped by Status and filtered to open work
- **Roadmap** grouped by Milestone
- **By story** grouped by Phase and sorted by Task ID
- **Blocked** filtered to Status = Blocked

Automate new issues into Backlog, new PR-linked issues into In progress, open PRs into In
review, and merged PRs into Done. Treat the Project as a view over issues, not a second
place to rewrite requirements.

## Milestones and issue publication

Publish task issues only after the repository has a confirmed GitHub `origin`. Use one
issue per task so IDs remain stable and deduplication is possible. Apply milestones as:

- **MVP**: T001–T033
- **Brand system**: T034–T043
- **Editor experience**: T044–T054
- **Handoff**: T055–T062
- **Launch**: T063–T069

The Spec Kit `speckit-taskstoissues` workflow must be used for initial publication; it
checks the remote and existing issue titles before creating anything. After publication,
enrich issues with acceptance details, dependencies, story/phase labels, and milestones.

## Labels

Use a deliberately small label vocabulary:

```text
type:feature  type:bug  type:docs  type:test  type:chore
area:web  area:studio  area:content  area:design  area:infrastructure
story:us1  story:us2  story:us3  story:us4
priority:p1  priority:p2  priority:p3  priority:p4
blocked  provenance  accessibility  performance  security
```

Status belongs in the Project field, not duplicate status labels.

## Branch protection and repository settings

Protect `main` with a GitHub ruleset:

- require a pull request and one approval before merge;
- dismiss stale approvals after material changes;
- require resolved review conversations;
- require the Conventional PR title check and project CI checks;
- block force pushes and branch deletion;
- require linear history;
- permit squash merge, disable merge commits, and auto-delete merged branches;
- include administrators once initial repository setup is complete.

For a solo portfolio phase, GitHub may not allow a meaningful self-approval. Keep every
other protection active and require approval once a second collaborator or business
reviewer joins.

## Planning cadence

1. Keep the next small set of dependency-ready tasks in **Ready**.
2. Pull one issue into **In progress** and create its branch.
3. Open a draft PR when the shape is reviewable or CI feedback is useful.
4. Move to **In review** only when acceptance evidence is present.
5. Squash merge after required checks and review; the PR title becomes semantic history.
6. Check the matching task in `tasks.md`, close the issue, and let Project automation
   move it to **Done**.
7. At each story checkpoint, run its independent acceptance test before starting the next
   priority.

## Release workflow

Use annotated tags and GitHub Releases following Semantic Versioning. During active
portfolio development, group meaningful preview releases under `0.x`. Create `1.0.0`
only after content approval, business-owned infrastructure, handoff rehearsal, and all
launch gates pass. Release notes should summarize customer/editor outcomes and link the
merged issues; internal refactors belong in a secondary section.
