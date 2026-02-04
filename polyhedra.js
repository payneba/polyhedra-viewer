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

// Johnson Solids (all 92)
for (let i = 1; i <= 92; i++) {
  const key = `J${i}`;
  if (polyhedraData.johnson[key]) {
    polyhedra[key.toLowerCase()] = convertPolyhedron(polyhedraData.johnson[key], 'johnson');
  }
}

console.log('Polyhedra loaded:', Object.keys(polyhedra).length, 'shapes');
console.log('Platonic:', Object.values(polyhedra).filter(p => p.category === 'platonic').length);
console.log('Archimedean:', Object.values(polyhedra).filter(p => p.category === 'archimedean').length);
console.log('Johnson:', Object.values(polyhedra).filter(p => p.category === 'johnson').length);

// Compute the dual polyhedron using polar reciprocation with respect to the midsphere
// This ensures all dual faces are planar (required for Catalan solids)
export function computeDual(vertices, faces) {
  // Helper functions
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const normalize = (v) => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  };

  // Step 1: Compute midsphere radius (average distance from origin to edge midpoints)
  const seenEdges = new Set();
  let midpointDistSum = 0;
  let edgeCount = 0;
  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i], b = face[(i + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        const va = vertices[a], vb = vertices[b];
        const mid = [(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2];
        midpointDistSum += Math.sqrt(dot(mid, mid));
        edgeCount++;
      }
    }
  }
  const midsphereR2 = Math.pow(midpointDistSum / edgeCount, 2);

  // Step 2: Compute dual vertices using polar reciprocation
  // For each face, the dual vertex is at distance r²/d along the face normal,
  // where d is the distance from origin to the face plane
  const dualVertices = faces.map(face => {
    const faceVerts = face.map(i => vertices[i]);
    const v0 = faceVerts[0], v1 = faceVerts[1], v2 = faceVerts[2];
    const normal = normalize(cross(sub(v1, v0), sub(v2, v0)));

    // Distance from origin to face plane
    const d = Math.abs(dot(v0, normal));

    // Determine which side of origin the face is on
    const centroid = faceVerts.reduce(
      (acc, v) => [acc[0] + v[0], acc[1] + v[1], acc[2] + v[2]],
      [0, 0, 0]
    );
    centroid[0] /= face.length;
    centroid[1] /= face.length;
    centroid[2] /= face.length;
    const sign = dot(centroid, normal) > 0 ? 1 : -1;

    // Dual vertex position
    const dist = midsphereR2 / d;
    return [normal[0] * dist * sign, normal[1] * dist * sign, normal[2] * dist * sign];
  });

  // Step 3: Build vertex-to-faces adjacency
  const vertexToFaces = {};
  for (let fi = 0; fi < faces.length; fi++) {
    for (const vi of faces[fi]) {
      if (!vertexToFaces[vi]) vertexToFaces[vi] = [];
      vertexToFaces[vi].push(fi);
    }
  }

  // Step 4: Build dual faces by ordering faces around each vertex by edge adjacency
  // Two faces are adjacent around a vertex if they share an edge at that vertex
  const dualFaces = [];

  // Build edge-to-faces map for adjacency lookup
  const edgeToFaces = {};
  for (let fi = 0; fi < faces.length; fi++) {
    const face = faces[fi];
    for (let i = 0; i < face.length; i++) {
      const a = face[i], b = face[(i + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeToFaces[key]) edgeToFaces[key] = [];
      edgeToFaces[key].push(fi);
    }
  }

  for (const vi of Object.keys(vertexToFaces)) {
    const adjFaces = vertexToFaces[vi];
    if (adjFaces.length < 3) continue;

    const vertexIdx = parseInt(vi);

    // Order faces by walking around the vertex via shared edges
    const orderedFaces = [adjFaces[0]];
    const used = new Set([adjFaces[0]]);

    while (orderedFaces.length < adjFaces.length) {
      const currentFace = orderedFaces[orderedFaces.length - 1];
      const face = faces[currentFace];

      // Find edges of this face that include the vertex
      let foundNext = false;
      for (let i = 0; i < face.length; i++) {
        if (face[i] === vertexIdx || face[(i + 1) % face.length] === vertexIdx) {
          const a = face[i], b = face[(i + 1) % face.length];
          const key = a < b ? `${a}-${b}` : `${b}-${a}`;
          const sharedFaces = edgeToFaces[key];

          for (const nextFace of sharedFaces) {
            if (nextFace !== currentFace && adjFaces.includes(nextFace) && !used.has(nextFace)) {
              orderedFaces.push(nextFace);
              used.add(nextFace);
              foundNext = true;
              break;
            }
          }
          if (foundNext) break;
        }
      }

      // Safety: if we can't find next face, add remaining faces (shouldn't happen for valid polyhedra)
      if (!foundNext) {
        for (const f of adjFaces) {
          if (!used.has(f)) {
            orderedFaces.push(f);
            used.add(f);
            break;
          }
        }
      }
    }

    const faceIndices = orderedFaces;

    // Compute polygon normal using Newell's method
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < faceIndices.length; i++) {
      const curr = dualVertices[faceIndices[i]];
      const next = dualVertices[faceIndices[(i + 1) % faceIndices.length]];
      nx += (curr[1] - next[1]) * (curr[2] + next[2]);
      ny += (curr[2] - next[2]) * (curr[0] + next[0]);
      nz += (curr[0] - next[0]) * (curr[1] + next[1]);
    }

    // Compute face centroid
    let cx = 0, cy = 0, cz = 0;
    for (const fi of faceIndices) {
      cx += dualVertices[fi][0];
      cy += dualVertices[fi][1];
      cz += dualVertices[fi][2];
    }
    cx /= faceIndices.length;
    cy /= faceIndices.length;
    cz /= faceIndices.length;

    // For a convex polyhedron centered at origin, face normal should point
    // in same direction as centroid (outward from origin)
    if (nx * cx + ny * cy + nz * cz < 0) {
      faceIndices.reverse();
    }

    dualFaces.push(faceIndices);
  }

  // Step 5: Normalize to similar scale as original
  const origDist = Math.sqrt(dot(vertices[0], vertices[0]));
  const dualDist = Math.sqrt(dot(dualVertices[0], dualVertices[0]));
  const scaleFactor = origDist / dualDist;

  const normalizedVertices = dualVertices.map(v => [
    v[0] * scaleFactor,
    v[1] * scaleFactor,
    v[2] * scaleFactor
  ]);

  return { vertices: normalizedVertices, faces: dualFaces };
}
