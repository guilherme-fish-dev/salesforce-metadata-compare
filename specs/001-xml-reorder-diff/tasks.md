# Tasks: Diff Stable Under XML Reordering

**Input**: Design documents from `/specs/001-xml-reorder-diff/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/semantic-diff-contract.md, quickstart.md

**Organization**: Tasks grouped by user story. US1 is the only phase with new code; US2 and US3 validate that the same change satisfies their acceptance criteria.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Establish a known-good browser baseline before touching any code

- [X] T001 Confirm local static server works: run `python -m http.server 8080` from the repository root, open `http://localhost:8080` in the browser, paste `arquivo1.xml` and `arquivo2.xml` into the panels, run the comparison, and record the current (broken) summary counts as a baseline for before/after comparison

**Checkpoint**: Baseline confirmed — false additions and removals are visible and counts are recorded

---

## Phase 2: Foundational — Tiered Semantic Identifier

**Purpose**: Extend `getSemanticKey` in `app.js` to use a three-tier identity strategy. This is the only code change in this feature and it **must be complete before any user story can be verified**.

**⚠️ CRITICAL**: All three user stories are verified against this single change. No user story work can begin until this phase is complete.

- [X] T002 Add `COMMON_IDENTIFIER_TAGS` constant in `app.js` alongside `PERMISSION_SET_KEYS` at the top of the file — an ordered array `["fullName", "name", "id", "key"]` representing stable child tag names to probe before falling back to a fingerprint
- [X] T003 Update `getSemanticKey` in `app.js`: after the existing Tier 1 `PERMISSION_SET_KEYS` check, add Tier 2 — iterate `COMMON_IDENTIFIER_TAGS`, call `getChildText` for each, and if a non-empty value is found return a stable key in the form `${tagName}:${childTag}=${value}`
- [X] T004 Update `getSemanticKey` in `app.js`: change the Tier 3 fallback return to omit `fallbackIndex` from the key — new form is `${tagName}:fingerprint:${makeFingerprint(element)}` — so unknown repeated elements are compared by content fingerprint only, not by position

**Checkpoint**: Foundation complete — `getSemanticKey` now resolves identity through three tiers; `standardValue` nodes will resolve via `fullName` (Tier 2) and no longer embed a positional index

---

## Phase 3: User Story 1 — Ignore Reordering Noise (Priority: P1) 🎯 MVP

**Goal**: Reordered XML elements with stable child identifiers must not appear as false additions or removals.

**Independent Test**: Compare `arquivo1.xml` vs `arquivo2.xml` in the browser; the semantic diff must show no large cascade of false `[ADDED]` / `[REMOVED]` for `standardValue` entries that only changed position.

### Implementation for User Story 1

- [X] T005 [US1] Validate Scenario 1 from `specs/001-xml-reorder-diff/quickstart.md` in the browser: paste `arquivo1.xml` (left) and `arquivo2.xml` (right), run comparison, confirm `standardValue` entries no longer appear as mass false additions and removals, confirm reordered-but-unchanged entries appear as `moved` or are absent from material diff categories

**Checkpoint**: US1 independently satisfied — reorder-only comparison is materially quiet for `standardValueSet`

---

## Phase 4: User Story 2 — Preserve Real Differences (Priority: P2)

**Goal**: Real edits (added, removed, changed) must remain fully visible even when the rest of the XML is reordered around them.

**Independent Test**: A comparison combining reordering with one genuinely changed entry must show only the changed entry as `[CHANGED]`; unmodified reordered peers must not appear as additions or removals.

### Implementation for User Story 2

- [X] T006 [P] [US2] Create a mixed-edit fixture file `specs/001-xml-reorder-diff/fixtures/arquivo2-with-real-edit.xml` by copying `arquivo2.xml` and deliberately modifying the content of one `standardValue` entry (for example, changing its `label` value) while keeping all other entries reordered as they are
- [X] T007 [US2] Validate Scenario 2 from `specs/001-xml-reorder-diff/quickstart.md` in the browser: paste `arquivo1.xml` (left) and the new fixture (right), run comparison, confirm the modified `standardValue` entry appears as `[CHANGED]` and all other reordered entries do not appear as additions or removals

**Checkpoint**: US2 independently satisfied — real differences remain visible while reordering noise is suppressed

---

## Phase 5: User Story 3 — Trust the Summary Counts (Priority: P3)

**Goal**: The `Adicionados`, `Removidos`, `Alterados`, and `Movidos` summary pills must reflect true counts, not counts inflated by reordering.

**Independent Test**: Summary totals in both the reorder-only scenario and the mixed scenario must match the actual classified differences exactly.

### Implementation for User Story 3

- [X] T008 [US3] Validate summary counts for the reorder-only scenario in the browser: using `arquivo1.xml` vs `arquivo2.xml`, confirm that `Adicionados` and `Removidos` show only counts for truly new or missing entries, not for reordered ones; confirm `Movidos` correctly reflects position changes
- [X] T009 [US3] Validate summary counts for the mixed scenario in the browser: using `arquivo1.xml` vs `specs/001-xml-reorder-diff/fixtures/arquivo2-with-real-edit.xml`, confirm `Alterados` is at least 1 for the deliberately changed entry, and `Adicionados` / `Removidos` remain zero for the reordered peers

**Checkpoint**: US3 independently satisfied — summary counts are trustworthy for both scenario types

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression safety and edge-case review covering existing behavior

- [X] T010 [P] Run quickstart.md Scenario 3 in the browser: load a Permission Set XML pair (use the built-in sample button or real files), reorder entries without changing content, confirm existing Permission Set reorder-aware behavior is completely intact and no regressions appear in the Schema Permission Set tab
- [X] T011 Review `getSemanticKey` edge case in `app.js`: confirm that when two sibling elements in the same tag group share the same `fullName` value the last one does not silently overwrite the first in the key-to-item map inside `buildSemanticDiff`; if a collision is detected, document the behavior and note whether a follow-up issue is warranted

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3–5 (User Stories)**: All depend on Phase 2 completion; can proceed sequentially P1 → P2 → P3
- **Phase 6 (Polish)**: Depends on Phase 3–5 completion

### User Story Dependencies

- **US1 (P1)**: First to validate — no dependency on US2/US3
- **US2 (P2)**: Requires the fixture created in T006; T007 depends on T006; otherwise independent of US1 validation steps
- **US3 (P3)**: T008 can begin after Phase 2; T009 depends on T006 fixture from US2

### Within Each Phase

- T002 → T003 → T004: sequential (same function, each step builds on the previous)
- T005: after T004
- T006 [P]: independent fixture creation, can run alongside T005
- T007: after T006
- T008: after Phase 2 complete (no code dep on T005–T007)
- T009: after T006
- T010 [P]: independent of US story validation; can run alongside US2/US3 work

---

## Parallel Opportunities

### Phase 2 Foundational

```
T002 → T003 → T004  (sequential — same function)
```

### After Phase 2 Complete

```
T005 (US1 validation)    — can start immediately
T006 [P] (fixture file)  — can start immediately in parallel with T005
T010 [P] (regression)    — can start immediately in parallel
```

### Phase 4 dependency chain

```
T006 → T007
T006 → T009
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — record baseline counts
2. Complete Phase 2: Foundational — add Tier 2 + fix Tier 3 in `getSemanticKey`
3. Complete Phase 3: US1 — validate `arquivo1.xml` vs `arquivo2.xml`
4. **STOP and VALIDATE**: reorder-only scenario is clean
5. Demo or share if the reported problem is resolved

### Incremental Delivery

1. Setup + Foundational → `getSemanticKey` fixed
2. US1 → reorder noise eliminated (MVP)
3. US2 → real-edit preservation confirmed
4. US3 → summary counts validated
5. Polish → regression cleared, edge case documented

---

## Notes

- All implementation is in `app.js` — no new files are introduced in the source tree
- The only new permanent file is `specs/001-xml-reorder-diff/fixtures/arquivo2-with-real-edit.xml` (created in T006 for validation)
- No build step required; browser refresh is sufficient to test each change
- Commit after Phase 2 completion and again after each user story validation phase
- Verify against `specs/001-xml-reorder-diff/contracts/semantic-diff-contract.md` before marking any user story complete
- Run `specs/001-xml-reorder-diff/quickstart.md` as the final acceptance checklist before declaring the feature done
