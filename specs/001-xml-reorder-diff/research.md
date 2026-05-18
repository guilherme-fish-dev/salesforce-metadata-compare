# Research: Diff Stable Under XML Reordering

## Decision 1: Use a tiered semantic identifier strategy for repeated XML elements

- Decision: Match XML items by semantic identity using three tiers in order: explicit per-tag key mappings, common identifier child tags, and finally an order-insensitive fingerprint fallback.
- Rationale: The current generic fallback includes positional index in the key, which makes repeated elements appear removed and added when they only move. A tiered strategy preserves the existing strong behavior for Permission Set tags while extending reorder-stable matching to metadata types such as `standardValueSet` that expose stable child identifiers like `fullName`.
- Alternatives considered:
  - Keep the current Permission Set-only mapping and add one-off fixes per metadata type. Rejected because it scales poorly and leaves the generic path unreliable.
  - Remove the positional index and use only a generic fingerprint for all repeated nodes. Rejected because it weakens identity matching for cases where stable named identifiers exist and can be more explicit.
  - Introduce fuzzy matching between unmatched nodes. Rejected because it increases complexity and false-positive risk before simpler deterministic matching is exhausted.

## Decision 2: Prefer stable child identifiers commonly present in Salesforce metadata

- Decision: When a tag does not have an explicit mapping, search first-level child tags in a priority order centered on stable identifiers such as `fullName`, `name`, `id`, and `key`.
- Rationale: Salesforce metadata frequently uses these fields to identify repeated entries across many XML types. This is the closest generalization of the current Permission Set strategy and directly addresses the reported `standardValueSet` case.
- Alternatives considered:
  - Build a complete metadata-type catalog up front. Rejected because it is heavier than needed for the current feature and would delay improvement for already-known problem cases.
  - Treat label-like fields as primary identifiers everywhere. Rejected because labels can be user-facing text and may change more often than stable metadata names.

## Decision 3: Keep movement as a secondary classification after identity matching

- Decision: Detect `moved` only after both sides resolve to the same semantic item and their relative positions differ; do not use movement to match otherwise-unmatched nodes.
- Rationale: Movement is a presentation category, not an identity mechanism. Matching must stay deterministic so that reordered-but-unchanged items do not inflate added and removed counts, while truly changed items continue to surface as changed.
- Alternatives considered:
  - Collapse all reordered items into no-op and stop tracking movement. Rejected because movement still has user value in the semantic summary.
  - Treat changed-and-moved items as moved only. Rejected because that would hide meaningful content changes.

## Decision 4: Keep validation browser-based for this feature slice

- Decision: Validate this feature using manual browser comparisons with focused fixtures, including the reported `arquivo1.xml` versus `arquivo2.xml` scenario and mixed scenarios containing both reorder and real edits.
- Rationale: The repository currently has no test runner or harness, and the planning goal is to define the smallest reliable validation loop that matches the actual usage model of the app.
- Alternatives considered:
  - Add an automated test stack in the same feature. Rejected for now because it expands scope beyond the immediate semantic diff defect.
  - Rely only on the small built-in sample snippets. Rejected because they do not cover the reported `standardValueSet` regression.

## Research Summary

- The current root cause is local and concrete: generic semantic keys include fallback index, making non-Permission Set repeated elements order-sensitive.
- The recommended fix path is incremental and low-risk: preserve explicit mappings, add common identifier discovery, then use an order-insensitive fallback for otherwise-unknown repeated elements.
- The `standardValueSet` family is expected to benefit immediately because repeated `standardValue` nodes commonly expose `fullName`, which serves as a stable semantic key across reorder operations.