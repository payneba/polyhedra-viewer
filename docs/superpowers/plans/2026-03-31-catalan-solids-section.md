# Catalan Solids Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Catalan" section to the sidebar showing the 13 Catalan solids computed as duals of the Archimedean solids at runtime.

**Architecture:** Compute Catalan geometry in `buildPolyhedraMap()` using the existing `computeDual()`, store as entries in the `polyhedra` object with category `'catalan'`. Add the section to the UI between Archimedean and Johnson. Extend dual name mappings so the dual toggle shows Archimedean names when viewing Catalans.

**Tech Stack:** Vanilla JS, Three.js (existing)

---

### Task 1: Generate Catalan entries in polyhedra.js

**Files:**
- Modify: `polyhedra.js:109-160` (the `polyhedra` object and `buildPolyhedraMap()`)

**Context:** The `archimedeanMap` (lines 122-136) maps data-file keys to internal keys. The `dualNames` map in main.js (lines 123-142) has the Catalan solid names. We need the names available in polyhedra.js for the `name` field of each Catalan entry.

- [ ] **Step 1: Add Catalan name mapping to polyhedra.js**

Add this map after `archimedeanMap` (after line 136):

```javascript
// Catalan Solids - duals of the Archimedean solids
// Maps archimedean internal key -> Catalan solid name
const catalanNames = {
  truncatedTetrahedron: 'Triakis Tetrahedron',
  cuboctahedron: 'Rhombic Dodecahedron',
  truncatedCube: 'Triakis Octahedron',
  truncatedOctahedron: 'Tetrakis Hexahedron',
  rhombicuboctahedron: 'Deltoidal Icositetrahedron',
  truncatedCuboctahedron: 'Disdyakis Dodecahedron',
  snubCube: 'Pentagonal Icositetrahedron',
  icosidodecahedron: 'Rhombic Triacontahedron',
  truncatedDodecahedron: 'Triakis Icosahedron',
  truncatedIcosahedron: 'Pentakis Dodecahedron',
  rhombicosidodecahedron: 'Deltoidal Hexecontahedron',
  truncatedIcosidodecahedron: 'Disdyakis Triacontahedron',
  snubDodecahedron: 'Pentagonal Hexecontahedron'
};
```

- [ ] **Step 2: Generate Catalan entries in buildPolyhedraMap()**

Add this block at the end of `buildPolyhedraMap()`, after the Johnson loop (after line 154, before the console.log on line 156):

```javascript
  // Catalan Solids (duals of Archimedean solids)
  for (const [archimedeanKey, catalanName] of Object.entries(catalanNames)) {
    const archimedean = polyhedra[archimedeanKey];
    if (archimedean) {
      const dual = computeDual(archimedean.vertices, archimedean.faces);
      polyhedra[`catalan_${archimedeanKey}`] = {
        name: catalanName,
        category: 'catalan',
        vertices: dual.vertices,
        faces: dual.faces,
        sourceKey: archimedeanKey
      };
    }
  }
```

- [ ] **Step 3: Add Catalan count to console.log**

Change the existing console.log block (lines 156-159) to also log Catalans:

```javascript
  console.log('Polyhedra loaded:', Object.keys(polyhedra).length, 'shapes');
  console.log('Platonic:', Object.values(polyhedra).filter(p => p.category === 'platonic').length);
  console.log('Archimedean:', Object.values(polyhedra).filter(p => p.category === 'archimedean').length);
  console.log('Catalan:', Object.values(polyhedra).filter(p => p.category === 'catalan').length);
  console.log('Johnson:', Object.values(polyhedra).filter(p => p.category === 'johnson').length);
```

- [ ] **Step 4: Verify in browser**

Open the site in a browser and check the console. Expected output should now include:
```
Catalan: 13
```
And total shapes should increase from 110 to 123.

- [ ] **Step 5: Commit**

```bash
git add polyhedra.js
git commit -m "Generate Catalan solid entries as duals of Archimedean solids"
```

---

### Task 2: Add Catalan section to UI

**Files:**
- Modify: `main.js:270-322` (`generateUI()` function)

- [ ] **Step 1: Add catalan to category grouping**

Change line 271 from:

```javascript
  const categories = { platonic: [], archimedean: [], johnson: [] };
```

to:

```javascript
  const categories = { platonic: [], archimedean: [], catalan: [], johnson: [] };
```

- [ ] **Step 2: Add Catalan section creation**

After line 321 (`createSection('Archimedean', ...)`), add:

```javascript
  shapeButtons.appendChild(createSection('Catalan', categories.catalan, true));
```

The three `appendChild` calls should now read:

```javascript
  shapeButtons.appendChild(createSection('Platonic', categories.platonic, false));
  shapeButtons.appendChild(createSection('Archimedean', categories.archimedean, false));
  shapeButtons.appendChild(createSection('Catalan', categories.catalan, true));
  shapeButtons.appendChild(createSection('Johnson', categories.johnson, true, true));
```

- [ ] **Step 3: Verify in browser**

Open the site. The left panel should now show a collapsed "Catalan (13)" section between Archimedean and Johnson. Expanding it should show 13 thumbnails. Clicking any thumbnail should render the Catalan solid in the main viewport with correct geometry.

- [ ] **Step 4: Commit**

```bash
git add main.js
git commit -m "Add Catalan solids section to sidebar UI"
```

---

### Task 3: Add dual name mappings for Catalan solids

**Files:**
- Modify: `main.js:123-142` (`dualNames` map)

**Context:** When a Catalan solid is selected and the user toggles "Dual", the info bar should show the corresponding Archimedean solid name (since the dual of a Catalan is its Archimedean source). Currently `dualNames` only maps Archimedean keys to Catalan names.

- [ ] **Step 1: Add reverse mappings to dualNames**

Add entries for each Catalan key after the existing Archimedean entries (after line 141, before the closing `};`):

```javascript
  // Catalan -> Archimedean (reverse duals)
  catalan_truncatedTetrahedron: 'Truncated Tetrahedron',
  catalan_cuboctahedron: 'Cuboctahedron',
  catalan_truncatedCube: 'Truncated Cube',
  catalan_truncatedOctahedron: 'Truncated Octahedron',
  catalan_rhombicuboctahedron: 'Rhombicuboctahedron',
  catalan_truncatedCuboctahedron: 'Truncated Cuboctahedron',
  catalan_snubCube: 'Snub Cube',
  catalan_icosidodecahedron: 'Icosidodecahedron',
  catalan_truncatedDodecahedron: 'Truncated Dodecahedron',
  catalan_truncatedIcosahedron: 'Truncated Icosahedron',
  catalan_rhombicosidodecahedron: 'Rhombicosidodecahedron',
  catalan_truncatedIcosidodecahedron: 'Truncated Icosidodecahedron',
  catalan_snubDodecahedron: 'Snub Dodecahedron'
```

- [ ] **Step 2: Verify in browser**

Select any Catalan solid, then toggle "Dual". The info bar should show the corresponding Archimedean name. For example:
- Select "Rhombic Dodecahedron" (Catalan) → toggle dual → info bar shows "Cuboctahedron"
- Select "Pentakis Dodecahedron" (Catalan) → toggle dual → info bar shows "Truncated Icosahedron"

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "Add dual name mappings for Catalan solids"
```

---

### Task 4: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README to mention Catalan solids**

Find any mention of the number of polyhedra or the list of categories and update to include Catalan solids (13 Catalan solids, 123 total shapes).

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Update README with Catalan solids section"
```
