# Quickstart: Validate Stable Diff Under XML Reordering

## Goal

Confirm that the semantic comparison no longer reports mass additions and removals when repeated XML elements are only reordered, while still preserving real edits.

## Prerequisites

- A local browser
- A simple static server started from the repository root

## Run the app

Start a local server from the repository root:

```powershell
python -m http.server 8080
```

Open `http://localhost:8080` in the browser.

## Validation Scenario 1: Reported standardValueSet case

1. Paste the content of `arquivo1.xml` into the left XML panel.
2. Paste the content of `arquivo2.xml` into the right XML panel.
3. Keep `Ignorar espaçamento em nós de texto` enabled.
4. Run the comparison.
5. Expected result:
   - The semantic diff must not show a large cascade of false `added` and `removed` items caused only by reordering.
   - Reordered `standardValue` entries should appear as `moved` or remain absent from material-diff categories, depending on final implementation choice.
   - The summary counters for `Adicionados` and `Removidos` must drop to only true differences.

## Validation Scenario 2: Reorder plus real edit

1. Reuse one of the XML files and manually change one stable item field while also moving that item to another position.
2. Run the comparison again.
3. Expected result:
   - The modified item must appear as `changed`.
   - Unmodified reordered peers must not appear as false additions or removals.

## Validation Scenario 3: Existing Permission Set behavior remains intact

1. Use the built-in Permission Set sample or a real Permission Set XML pair.
2. Reorder repeated entries without changing their content.
3. Expected result:
   - Existing reorder-aware behavior for Permission Set entries remains correct.
   - No regression appears in schema summary output.

## Review Checklist

- Summary counts match the visible semantic classifications.
- No single item is counted as both moved and added or removed.
- Reorder-only comparisons are materially quiet.
- Real content edits remain visible.