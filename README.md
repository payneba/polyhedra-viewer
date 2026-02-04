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

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Dependencies

### Runtime

- **[three](https://threejs.org/)** (v0.170.0) - 3D graphics library for WebGL rendering, camera controls, and geometry
- **[polyhedra](https://github.com/finnp/polyhedra)** (v1.0.0) - JSON data for polyhedra vertices and faces, sourced from George W. Hart's Virtual Polyhedra

### Development

- **[vite](https://vitejs.dev/)** (v6.0.0) - Fast development server with hot module replacement

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

## License

Polyhedra data from Virtual Polyhedra by George W. Hart, used under noncommercial license.
