import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

// Color convention by polygon type (number of sides)
export const polygonColors = {
  3: 0xe74c3c,  // Triangle - Red
  4: 0x3498db,  // Square - Blue
  5: 0x2ecc71,  // Pentagon - Green
  6: 0xf39c12,  // Hexagon - Orange
  8: 0x9b59b6,  // Octagon - Purple
  10: 0x1abc9c, // Decagon - Teal
};

// Golden ratio
const phi = (1 + Math.sqrt(5)) / 2;

// Normalize vertices to unit circumsphere
function normalize(vertices) {
  const maxDist = Math.max(...vertices.map(v =>
    Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  ));
  return vertices.map(v => [v[0] / maxDist, v[1] / maxDist, v[2] / maxDist]);
}

// Build colored geometry from vertices and faces
export function buildColoredGeometry(vertices, faces, scale = 1.5) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const normals = [];

  for (const face of faces) {
    const faceVerts = face.map(i => vertices[i]);
    const sides = face.length;
    const color = new THREE.Color(polygonColors[sides] || 0x888888);

    // Calculate face normal
    const v0 = new THREE.Vector3(...faceVerts[0]);
    const v1 = new THREE.Vector3(...faceVerts[1]);
    const v2 = new THREE.Vector3(...faceVerts[2]);
    const normal = new THREE.Vector3()
      .crossVectors(
        new THREE.Vector3().subVectors(v1, v0),
        new THREE.Vector3().subVectors(v2, v0)
      )
      .normalize();

    // Triangulate using fan method
    for (let i = 1; i < face.length - 1; i++) {
      for (const vert of [faceVerts[0], faceVerts[i], faceVerts[i + 1]]) {
        positions.push(vert[0] * scale, vert[1] * scale, vert[2] * scale);
        colors.push(color.r, color.g, color.b);
        normals.push(normal.x, normal.y, normal.z);
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geometry;
}

// Build edges from face data
export function buildEdgesGeometry(vertices, faces, scale = 1.5) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const edgeSet = new Set();

  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        positions.push(
          vertices[a][0] * scale, vertices[a][1] * scale, vertices[a][2] * scale,
          vertices[b][0] * scale, vertices[b][1] * scale, vertices[b][2] * scale
        );
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

// Build convex geometry for shapes without explicit faces
export function buildConvexGeometry(vertices, scale = 1.5) {
  const points = vertices.map(v => new THREE.Vector3(v[0] * scale, v[1] * scale, v[2] * scale));
  return new ConvexGeometry(points);
}

// ============ PLATONIC SOLIDS ============

const tetrahedron = {
  vertices: normalize([
    [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
  ]),
  faces: [
    [0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]
  ]
};

const cube = {
  vertices: normalize([
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ]),
  faces: [
    [0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
    [2, 3, 7, 6], [0, 4, 7, 3], [1, 2, 6, 5]
  ]
};

const octahedron = {
  vertices: normalize([
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
  ]),
  faces: [
    [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
    [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
  ]
};

const dodecahedron = {
  vertices: normalize([
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
    [0, 1/phi, phi], [0, 1/phi, -phi], [0, -1/phi, phi], [0, -1/phi, -phi],
    [1/phi, phi, 0], [-1/phi, phi, 0], [1/phi, -phi, 0], [-1/phi, -phi, 0],
    [phi, 0, 1/phi], [phi, 0, -1/phi], [-phi, 0, 1/phi], [-phi, 0, -1/phi]
  ]),
  faces: [
    [0, 16, 2, 10, 8], [0, 8, 4, 13, 12], [0, 12, 1, 17, 16],
    [8, 10, 6, 18, 4], [2, 16, 17, 3, 14], [10, 2, 14, 15, 6],
    [1, 12, 13, 5, 9], [4, 18, 19, 5, 13], [17, 1, 9, 11, 3],
    [6, 15, 7, 19, 18], [3, 11, 7, 15, 14], [5, 19, 7, 11, 9]
  ]
};

const icosahedron = {
  vertices: normalize([
    [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
    [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1]
  ]),
  faces: [
    [0, 2, 8], [0, 8, 4], [0, 4, 6], [0, 6, 10], [0, 10, 2],
    [2, 5, 8], [8, 9, 4], [4, 1, 6], [6, 11, 10], [10, 7, 2],
    [5, 2, 7], [9, 8, 5], [1, 4, 9], [11, 6, 1], [7, 10, 11],
    [3, 5, 7], [3, 9, 5], [3, 1, 9], [3, 11, 1], [3, 7, 11]
  ]
};

// ============ ARCHIMEDEAN SOLIDS ============

// Cuboctahedron: 8 triangles + 6 squares
const cuboctahedron = {
  vertices: normalize([
    [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
    [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
    [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]
  ]),
  faces: [
    // 8 triangles
    [0, 4, 8], [0, 9, 5], [2, 8, 6], [2, 7, 9],
    [1, 10, 4], [1, 5, 11], [3, 6, 10], [3, 11, 7],
    // 6 squares
    [0, 8, 2, 9], [1, 11, 3, 10], [4, 10, 6, 8],
    [5, 9, 7, 11], [0, 5, 1, 4], [2, 6, 3, 7]
  ]
};

// Truncated Tetrahedron: 4 triangles + 4 hexagons (using convex hull)
const truncatedTetrahedron = {
  vertices: normalize([
    [3, 1, 1], [1, 3, 1], [1, 1, 3],
    [-3, -1, 1], [-1, -3, 1], [-1, -1, 3],
    [-3, 1, -1], [-1, 3, -1], [-1, 1, -3],
    [3, -1, -1], [1, -3, -1], [1, -1, -3]
  ]),
  faces: [] // Use convex hull
};

// Truncated Octahedron: 6 squares + 8 hexagons
const truncatedOctahedron = {
  vertices: normalize([
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [2, 0, 1],
    [1, 2, 0], [2, 1, 0], [0, -1, 2], [0, -2, 1],
    [-1, 0, 2], [-2, 0, 1], [-1, 2, 0], [-2, 1, 0],
    [0, 1, -2], [0, 2, -1], [1, 0, -2], [2, 0, -1],
    [1, -2, 0], [2, -1, 0], [0, -1, -2], [0, -2, -1],
    [-1, 0, -2], [-2, 0, -1], [-1, -2, 0], [-2, -1, 0]
  ]),
  faces: [] // Use convex hull
};

// Rhombicuboctahedron: 8 triangles + 18 squares
const rho = 1 + Math.SQRT2;
const rhombicuboctahedron = {
  vertices: normalize([
    [1, 1, rho], [1, 1, -rho], [-1, 1, rho], [-1, 1, -rho],
    [1, -1, rho], [1, -1, -rho], [-1, -1, rho], [-1, -1, -rho],
    [1, rho, 1], [1, rho, -1], [-1, rho, 1], [-1, rho, -1],
    [1, -rho, 1], [1, -rho, -1], [-1, -rho, 1], [-1, -rho, -1],
    [rho, 1, 1], [rho, 1, -1], [-rho, 1, 1], [-rho, 1, -1],
    [rho, -1, 1], [rho, -1, -1], [-rho, -1, 1], [-rho, -1, -1]
  ]),
  faces: [] // Use convex hull
};

// Truncated Icosahedron (Soccer Ball): 12 pentagons + 20 hexagons
const truncatedIcosahedron = {
  vertices: normalize([
    [0, 1, 3*phi], [0, 1, -3*phi], [0, -1, 3*phi], [0, -1, -3*phi],
    [1, 3*phi, 0], [-1, 3*phi, 0], [1, -3*phi, 0], [-1, -3*phi, 0],
    [3*phi, 0, 1], [3*phi, 0, -1], [-3*phi, 0, 1], [-3*phi, 0, -1],
    [2, 1+2*phi, phi], [2, 1+2*phi, -phi], [-2, 1+2*phi, phi], [-2, 1+2*phi, -phi],
    [2, -(1+2*phi), phi], [2, -(1+2*phi), -phi], [-2, -(1+2*phi), phi], [-2, -(1+2*phi), -phi],
    [phi, 2, 1+2*phi], [phi, 2, -(1+2*phi)], [-phi, 2, 1+2*phi], [-phi, 2, -(1+2*phi)],
    [phi, -2, 1+2*phi], [phi, -2, -(1+2*phi)], [-phi, -2, 1+2*phi], [-phi, -2, -(1+2*phi)],
    [1+2*phi, phi, 2], [1+2*phi, phi, -2], [-(1+2*phi), phi, 2], [-(1+2*phi), phi, -2],
    [1+2*phi, -phi, 2], [1+2*phi, -phi, -2], [-(1+2*phi), -phi, 2], [-(1+2*phi), -phi, -2],
    [1, 2+phi, 2*phi], [1, 2+phi, -2*phi], [-1, 2+phi, 2*phi], [-1, 2+phi, -2*phi],
    [1, -(2+phi), 2*phi], [1, -(2+phi), -2*phi], [-1, -(2+phi), 2*phi], [-1, -(2+phi), -2*phi],
    [2*phi, 1, 2+phi], [2*phi, 1, -(2+phi)], [-2*phi, 1, 2+phi], [-2*phi, 1, -(2+phi)],
    [2*phi, -1, 2+phi], [2*phi, -1, -(2+phi)], [-2*phi, -1, 2+phi], [-2*phi, -1, -(2+phi)],
    [2+phi, 2*phi, 1], [2+phi, 2*phi, -1], [-(2+phi), 2*phi, 1], [-(2+phi), 2*phi, -1],
    [2+phi, -2*phi, 1], [2+phi, -2*phi, -1], [-(2+phi), -2*phi, 1], [-(2+phi), -2*phi, -1]
  ]),
  faces: [] // Use convex hull
};

// Icosidodecahedron: 20 triangles + 12 pentagons
const icosidodecahedron = {
  vertices: normalize([
    [0, 0, phi], [0, 0, -phi],
    [phi, 0, 0], [-phi, 0, 0],
    [0, phi, 0], [0, -phi, 0],
    [0.5, phi/2, (1+phi)/2], [-0.5, phi/2, (1+phi)/2],
    [0.5, -phi/2, (1+phi)/2], [-0.5, -phi/2, (1+phi)/2],
    [0.5, phi/2, -(1+phi)/2], [-0.5, phi/2, -(1+phi)/2],
    [0.5, -phi/2, -(1+phi)/2], [-0.5, -phi/2, -(1+phi)/2],
    [(1+phi)/2, 0.5, phi/2], [(1+phi)/2, -0.5, phi/2],
    [-(1+phi)/2, 0.5, phi/2], [-(1+phi)/2, -0.5, phi/2],
    [(1+phi)/2, 0.5, -phi/2], [(1+phi)/2, -0.5, -phi/2],
    [-(1+phi)/2, 0.5, -phi/2], [-(1+phi)/2, -0.5, -phi/2],
    [phi/2, (1+phi)/2, 0.5], [phi/2, (1+phi)/2, -0.5],
    [-phi/2, (1+phi)/2, 0.5], [-phi/2, (1+phi)/2, -0.5],
    [phi/2, -(1+phi)/2, 0.5], [phi/2, -(1+phi)/2, -0.5],
    [-phi/2, -(1+phi)/2, 0.5], [-phi/2, -(1+phi)/2, -0.5]
  ]),
  faces: [] // Use convex hull
};

// Snub Cube: 32 triangles + 6 squares (chiral)
const tribonacci = 1.8392867552141612;
const snubCubeVerts = [];
const t = tribonacci;
for (const perm of [[1, 1/t, t], [1/t, t, 1], [t, 1, 1/t]]) {
  for (const s1 of [1, -1]) {
    for (const s2 of [1, -1]) {
      for (const s3 of [1, -1]) {
        if (s1 * s2 * s3 === 1) {
          snubCubeVerts.push([s1 * perm[0], s2 * perm[1], s3 * perm[2]]);
        }
      }
    }
  }
}
for (const perm of [[1/t, 1, t], [t, 1/t, 1], [1, t, 1/t]]) {
  for (const s1 of [1, -1]) {
    for (const s2 of [1, -1]) {
      for (const s3 of [1, -1]) {
        if (s1 * s2 * s3 === -1) {
          snubCubeVerts.push([s1 * perm[0], s2 * perm[1], s3 * perm[2]]);
        }
      }
    }
  }
}

const snubCube = {
  vertices: normalize(snubCubeVerts),
  faces: [] // Use convex hull
};

// Export all polyhedra
export const polyhedra = {
  // Platonic Solids
  tetrahedron: { name: 'Tetrahedron', category: 'platonic', ...tetrahedron },
  cube: { name: 'Cube', category: 'platonic', ...cube },
  octahedron: { name: 'Octahedron', category: 'platonic', ...octahedron },
  dodecahedron: { name: 'Dodecahedron', category: 'platonic', ...dodecahedron },
  icosahedron: { name: 'Icosahedron', category: 'platonic', ...icosahedron },

  // Archimedean Solids
  truncatedTetrahedron: { name: 'Truncated Tetrahedron', category: 'archimedean', ...truncatedTetrahedron },
  cuboctahedron: { name: 'Cuboctahedron', category: 'archimedean', ...cuboctahedron },
  truncatedOctahedron: { name: 'Truncated Octahedron', category: 'archimedean', ...truncatedOctahedron },
  rhombicuboctahedron: { name: 'Rhombicuboctahedron', category: 'archimedean', ...rhombicuboctahedron },
  snubCube: { name: 'Snub Cube', category: 'archimedean', ...snubCube },
  icosidodecahedron: { name: 'Icosidodecahedron', category: 'archimedean', ...icosidodecahedron },
  truncatedIcosahedron: { name: 'Truncated Icosahedron', category: 'archimedean', ...truncatedIcosahedron },
};

console.log('Polyhedra module loaded', Object.keys(polyhedra));
