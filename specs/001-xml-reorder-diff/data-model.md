# Data Model: Diff Stable Under XML Reordering

## XML Comparison Item

- Purpose: Represents one repeatable XML unit that can be matched between the left and right documents.
- Fields:
  - `tagName`: Root tag name of the repeated element being compared.
  - `element`: Parsed DOM element or equivalent serialized content source.
  - `index`: Original sibling position within the parent collection.
  - `semanticIdentifier`: Stable key derived from explicit mapping, child identifier detection, or fingerprint fallback.
  - `fingerprint`: Normalized structural representation used when explicit identity is unavailable.
- Relationships:
  - Belongs to one tag group within a single compared XML document.
  - May match at most one XML Comparison Item from the opposite document.
- Validation rules:
  - `semanticIdentifier` must be stable under reordering when the item content is semantically equivalent.
  - `index` must not be the primary identity for generic repeated nodes.

## Semantic Identifier

- Purpose: Encodes the matching key used to determine whether two XML Comparison Items refer to the same semantic entity.
- Fields:
  - `strategy`: One of `explicit-key`, `detected-child-key`, or `fingerprint-fallback`.
  - `sourceTag`: Child tag or mapping source used to derive the identifier.
  - `value`: Normalized key value.
- Validation rules:
  - Must be deterministic for equal semantic content.
  - Must avoid dependence on sibling position for reorder-stable matching.

## Semantic Difference

- Purpose: Represents the classified outcome for a matched or unmatched comparison item.
- Fields:
  - `kind`: One of `added`, `removed`, `changed`, `moved`, or `unchanged`.
  - `tagName`: Grouping tag shown in the semantic diff.
  - `key`: Semantic identifier or displayable label derived from it.
  - `leftSnapshot`: Serialized left-side representation when available.
  - `rightSnapshot`: Serialized right-side representation when available.
  - `leftIndex`: Original position in the left document when available.
  - `rightIndex`: Original position in the right document when available.
- State transitions:
  - `unmatched-right` becomes `added`.
  - `unmatched-left` becomes `removed`.
  - `matched + different normalized content` becomes `changed`.
  - `matched + same normalized content + different index` becomes `moved`.
  - `matched + same normalized content + same index` remains `unchanged` and is omitted from diff output.

## Comparison Summary

- Purpose: Aggregates user-facing totals for the comparison result.
- Fields:
  - `addedCount`
  - `removedCount`
  - `changedCount`
  - `movedCount`
- Validation rules:
  - A single semantic item must contribute to only one visible difference category.
  - Reordered-only items must not increment `addedCount` or `removedCount`.

## Permission Set Schema Entry

- Purpose: Existing UI-oriented aggregation used for schema-like visualization of grouped semantic differences.
- Fields:
  - `tagName`
  - `addedLabels`
  - `removedLabels`
  - `movedLabels`
- Relationship to feature:
  - This artifact remains supported, but the underlying semantic matching logic must be generalized so the same reorder stability applies beyond Permission Set-only tag mappings.