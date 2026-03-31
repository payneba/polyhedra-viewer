# Catalan Solids Section

## Summary

Add a "Catalan" section to the left panel between Archimedean and Johnson, showing the 13 Catalan solids as clickable thumbnails. Catalan solids are the duals of the Archimedean solids; geometry is computed at runtime using the existing `computeDual()` function rather than a new data file.

## Approach

Compute duals from Archimedean data at init time. No new data files or dependencies.

## Changes

### polyhedra.js — Generate Catalan entries

After `buildPolyhedraMap()` populates the `polyhedra` object with platonic/archimedean/johnson entries, generate 13 Catalan entries by iterating over each Archimedean solid and computing its dual.

Each Catalan entry is stored in the `polyhedra` object with:
- Key: `catalan_<archimedeanKey>` (e.g. `catalan_truncatedTetrahedron`)
- `name`: The Catalan solid name from the existing `dualNames` map in main.js (this map needs to move to or be duplicated in polyhedra.js, or the name assignment happens in main.js after init)
- `category`: `'catalan'`
- `vertices` and `faces`: Output of `computeDual(archimedeanVertices, archimedeanFaces)`
- `sourceKey`: The Archimedean key this was derived from (for reverse dual name lookup)

### main.js — UI generation

In `generateUI()`:
1. Add `catalan: []` to the categories object (line 271)
2. Insert a new `createSection('Catalan', categories.catalan, true)` call between Archimedean and Johnson (after line 321). Collapsed by default.

### main.js — Dual name mapping

Extend `dualNames` to include Catalan → Archimedean reverse mappings so that toggling "Dual" on a Catalan solid shows the correct Archimedean name. For example:
- `catalan_truncatedTetrahedron` → `'Truncated Tetrahedron'`

### No CSS changes needed

Existing `.category-section` styles handle the new section automatically.

## Dual toggle behavior

When a Catalan solid is selected and dual is toggled, `computeDual()` runs on the Catalan's vertex/face data, producing the original Archimedean solid geometry. The `dualNames` reverse mapping provides the correct display name.

## Testing

- Verify all 13 Catalan solids render correctly as thumbnails and in the main viewport
- Verify dual toggle on each Catalan solid produces the expected Archimedean solid
- Verify the info bar shows correct names and vertex/edge/face counts
- Verify section collapse/expand works
