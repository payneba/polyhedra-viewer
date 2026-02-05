# Polyhedra Viewer

An interactive 3D viewer for Platonic, Archimedean, and Johnson solids built with Three.js.

## Features

- View all 5 Platonic solids, 13 Archimedean solids, and 92 Johnson solids
- Toggle to view dual polyhedra (Catalan solids for Archimedean, computed duals for all)
- Faces colored by polygon type (triangles, squares, pentagons, etc.)
- Orbit controls for rotation and zoom
- Toggle between solid+edges and wireframe display
- Collapsible category sections with scrollable Johnson solids list

## Color Convention

| Polygon   | Color  |
|-----------|--------|
| Triangle  | Red    |
| Square    | Blue   |
| Pentagon  | Green  |
| Hexagon   | Orange |
| Octagon   | Purple |
| Decagon   | Teal   |

## Getting Started

**View online:** https://payneba.github.io/polyhedra-viewer/

**Run locally:** Serve the directory with any static HTTP server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Or open index.html directly (may have CORS issues with some browsers)
```

Then open http://localhost:8000 in your browser.

## Dependencies

This is a fully static site with no build step. Dependencies are loaded from CDN:

- **[Three.js](https://threejs.org/)** (v0.170.0) - 3D graphics library, loaded from jsdelivr CDN

### Vendored Data

The polyhedra geometry data (vertex coordinates and face definitions) in `data/` is vendored
from the [polyhedra](https://github.com/finnp/polyhedra) npm package by Finn Pauls, which
provides JSON-formatted data originally from George W. Hart's Virtual Polyhedra encyclopedia.

## Polyhedra Included

### Platonic Solids (5)
- Tetrahedron
- Cube
- Octahedron
- Dodecahedron
- Icosahedron

### Archimedean Solids (13)
- Truncated Tetrahedron
- Cuboctahedron
- Truncated Cube
- Truncated Octahedron
- Rhombicuboctahedron
- Truncated Cuboctahedron
- Snub Cube
- Icosidodecahedron
- Truncated Dodecahedron
- Truncated Icosahedron
- Rhombicosidodecahedron
- Truncated Icosidodecahedron
- Snub Dodecahedron

### Johnson Solids (92)
All 92 Johnson solids (J1-J92), convex polyhedra with regular polygon faces that are not Platonic, Archimedean, prisms, or antiprisms.

## Data Attribution

The polyhedra geometry data is from **[Virtual Polyhedra: The Encyclopedia of Polyhedra](http://www.georgehart.com/virtual-polyhedra/vp.html)** by **George W. Hart**, converted to JSON by Lee Stemkoski and packaged by Finn Pauls.

The original data is used under George W. Hart's noncommercial license:

> "The collection of individual files which contain the mathematical description of each
> polyhedron... may be reproduced and used for noncommercial purposes."

See `data/COPYRIGHT.txt` for full attribution details.
