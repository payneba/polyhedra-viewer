import * as THREE from 'three';
import polyhedraData from 'polyhedra';

// Color convention by polygon type (number of sides)
export const polygonColors = {
  3: 0xe74c3c,  // Triangle - Red
  4: 0x3498db,  // Square - Blue
  5: 0x2ecc71,  // Pentagon - Green
  6: 0xf39c12,  // Hexagon - Orange
  8: 0x9b59b6,  // Octagon - Purple
  10: 0x1abc9c, // Decagon - Teal
};

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

// Convert polyhedra package data to our format
function convertPolyhedron(data, category) {
  return {
    name: data.name,
    category: category,
    vertices: data.vertex,
    faces: data.face
  };
}

// Build the polyhedra object from package data
export const polyhedra = {};

// Platonic Solids
const platonicMap = {
  'Tetrahedron': 'tetrahedron',
  'Cube': 'cube',
  'Octahedron': 'octahedron',
  'Dodecahedron': 'dodecahedron',
  'Icosahedron': 'icosahedron'
};

for (const [key, id] of Object.entries(platonicMap)) {
  polyhedra[id] = convertPolyhedron(polyhedraData.platonic[key], 'platonic');
}

// Archimedean Solids (all 13)
const archimedeanMap = {
  'TruncatedTetrahedron': 'truncatedTetrahedron',
  'Cuboctahedron': 'cuboctahedron',
  'TruncatedCube': 'truncatedCube',
  'TruncatedOctahedron': 'truncatedOctahedron',
  'Rhombicubocahedron': 'rhombicuboctahedron',
  'TruncatedCubocahedron': 'truncatedCuboctahedron',
  'SnubCuboctahedron': 'snubCube',
  'Icosidodecahedron': 'icosidodecahedron',
  'TruncatedDodecahedron': 'truncatedDodecahedron',
  'TruncatedIcosahedron': 'truncatedIcosahedron',
  'Rhombicosidodecahedron': 'rhombicosidodecahedron',
  'TruncatedIcosidodecahedron': 'truncatedIcosidodecahedron',
  'SnubIcosidodecahedron': 'snubDodecahedron'
};

for (const [key, id] of Object.entries(archimedeanMap)) {
  polyhedra[id] = convertPolyhedron(polyhedraData.archimedean[key], 'archimedean');
}

console.log('Polyhedra loaded:', Object.keys(polyhedra).length, 'shapes');
console.log('Platonic:', Object.values(polyhedra).filter(p => p.category === 'platonic').length);
console.log('Archimedean:', Object.values(polyhedra).filter(p => p.category === 'archimedean').length);
