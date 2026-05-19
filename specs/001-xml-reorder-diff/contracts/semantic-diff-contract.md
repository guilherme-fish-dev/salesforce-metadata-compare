# Contract: Semantic XML Diff Classification

## Purpose

Define the user-visible behavior expected from the semantic diff pipeline for repeated XML elements, independent of the internal implementation details.

## Inputs

- `leftXml`: XML document representing the previous version.
- `rightXml`: XML document representing the new version.
- `ignoreWhitespace`: Boolean flag controlling whitespace normalization for text-node comparisons.

## Matching Contract

- Repeated XML elements must be matched by stable semantic identity whenever such identity is available from the element content.
- Stable identity may come from:
  - explicit type-specific key mapping,
  - common identifier child tags,
  - order-insensitive structural fingerprint fallback.
- Sibling position alone must not cause two otherwise-equivalent repeated elements to be treated as different semantic items.

## Classification Contract

- `added`: The item exists only in the new document.
- `removed`: The item exists only in the old document.
- `changed`: The item is matched across documents but its normalized semantic content differs.
- `moved`: The item is matched across documents, its normalized semantic content is equivalent, and its relative position differs.
- `unchanged`: The item is matched, semantically equivalent, and in the same effective position; it is not shown in semantic diff output.

## Summary Contract

- Summary totals must be derived from final semantic classifications.
- An item classified as `moved` must not also be counted as `added` or `removed`.
- Reorder-only comparisons must not inflate `added` and `removed` totals.

## Scenario Guarantees

- For metadata types with stable child identifiers such as `fullName`, reordering repeated entries alone must not create false material differences.
- For mixed scenarios combining reorder and real edits, real edits must remain visible.
- Existing reorder-aware handling for Permission Set collections must be preserved.