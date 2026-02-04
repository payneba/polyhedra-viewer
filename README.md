# Polyhedra Viewer

An interactive 3D viewer for Platonic and Archimedean solids built with Three.js.

## Features

- View all 5 Platonic solids and 13 Archimedean solids
- Faces colored by polygon type (triangles, squares, pentagons, etc.)
- Orbit controls for rotation and zoom
- Toggle between solid+edges and wireframe display

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

## License

Polyhedra data from Virtual Polyhedra by George W. Hart, used under noncommercial license.
