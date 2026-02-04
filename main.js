import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { polyhedra, polygonColors, buildColoredGeometry, buildEdgesGeometry, computeDual } from './polyhedra.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 8;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('container').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight2.position.set(-5, -5, -5);
scene.add(directionalLight2);

// Materials
const coloredMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  metalness: 0.2,
  roughness: 0.5,
  side: THREE.DoubleSide
});

const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 3
});

const wireframeMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 2
});

// State
let currentShape = 'tetrahedron';
let currentDisplay = 'edges';
let showDual = false;
let meshGroup = null;

function createPolyhedron() {
  // Remove existing group
  if (meshGroup) {
    scene.remove(meshGroup);
    meshGroup.traverse(child => {
      if (child.geometry) child.geometry.dispose();
    });
  }

  meshGroup = new THREE.Group();
  const data = polyhedra[currentShape];
  const scale = 1.5;

  // Get vertices and faces (possibly from dual)
  let vertices = data.vertices;
  let faces = data.faces;

  if (showDual) {
    const dual = computeDual(data.vertices, data.faces);
    vertices = dual.vertices;
    faces = dual.faces;
  }

  // Build colored geometry from face data
  const geometry = buildColoredGeometry(vertices, faces, scale);
  const solidMesh = new THREE.Mesh(geometry, coloredMaterial);

  // Build edges
  const edgesGeometry = buildEdgesGeometry(vertices, faces, scale);
  const edgesLine = new THREE.LineSegments(edgesGeometry, edgeMaterial);
  const wireframeLine = new THREE.LineSegments(edgesGeometry, wireframeMaterial);

  // Store references
  meshGroup.userData = { solidMesh, edgesLine, wireframeLine };
  scene.add(meshGroup);

  updateDisplay();
  updateShapeInfo(vertices, faces);
}

function updateDisplay() {
  if (!meshGroup) return;

  const { solidMesh, edgesLine, wireframeLine } = meshGroup.userData;

  // Clear group
  meshGroup.clear();

  if (currentDisplay === 'wireframe') {
    meshGroup.add(wireframeLine);
  } else {
    // Default: solid + edges
    meshGroup.add(solidMesh);
    meshGroup.add(edgesLine);
  }
}

// Dual name mappings for Catalan solids
const dualNames = {
  tetrahedron: 'Tetrahedron',
  cube: 'Octahedron',
  octahedron: 'Cube',
  dodecahedron: 'Icosahedron',
  icosahedron: 'Dodecahedron',
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

function updateShapeInfo(vertices, faces) {
  const infoEl = document.getElementById('shape-info');
  if (!infoEl) return;

  const data = polyhedra[currentShape];
  // Use specific dual name if available, otherwise "Dual of X"
  const name = showDual
    ? (dualNames[currentShape] || `Dual of ${data.name}`)
    : data.name;

  // Count edges (each edge shared by 2 faces)
  const edgeSet = new Set();
  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i], b = face[(i + 1) % face.length];
      edgeSet.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }
  }

  infoEl.innerHTML = `
    <div class="shape-name">${name}</div>
    <div class="shape-stats">
      <span>${vertices.length} vertices</span>
      <span>${edgeSet.size} edges</span>
      <span>${faces.length} faces</span>
    </div>
  `;
}

// Generate a thumbnail for a polyhedron
function generateThumbnail(shapeKey, size = 50) {
  const data = polyhedra[shapeKey];

  // Create offscreen renderer
  const thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  thumbRenderer.setSize(size, size);
  thumbRenderer.setClearColor(0x000000, 0);

  // Create scene
  const thumbScene = new THREE.Scene();

  // Create camera
  const thumbCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  thumbCamera.position.z = 6;

  // Add lighting
  const thumbAmbient = new THREE.AmbientLight(0xffffff, 0.6);
  thumbScene.add(thumbAmbient);
  const thumbDir = new THREE.DirectionalLight(0xffffff, 0.8);
  thumbDir.position.set(2, 2, 2);
  thumbScene.add(thumbDir);

  // Create grayscale material
  const thumbMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.1,
    roughness: 0.6,
    side: THREE.DoubleSide
  });

  // Build geometry
  const geometry = buildColoredGeometry(data.vertices, data.faces, 1.2);
  // Override colors with grayscale
  const grayGeometry = new THREE.BufferGeometry();
  grayGeometry.setAttribute('position', geometry.getAttribute('position'));
  grayGeometry.setAttribute('normal', geometry.getAttribute('normal'));

  const mesh = new THREE.Mesh(grayGeometry, thumbMaterial);

  // Add edges
  const edgesGeometry = buildEdgesGeometry(data.vertices, data.faces, 1.2);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

  // Rotate for better view
  mesh.rotation.x = 0.4;
  mesh.rotation.y = 0.6;
  edges.rotation.x = 0.4;
  edges.rotation.y = 0.6;

  thumbScene.add(mesh);
  thumbScene.add(edges);

  // Render
  thumbRenderer.render(thumbScene, thumbCamera);

  // Get data URL
  const dataUrl = thumbRenderer.domElement.toDataURL();

  // Cleanup
  thumbRenderer.dispose();
  grayGeometry.dispose();
  geometry.dispose();
  edgesGeometry.dispose();
  thumbMaterial.dispose();
  edgesMaterial.dispose();

  return dataUrl;
}

// Generate UI buttons dynamically
function generateUI() {
  const shapeButtons = document.getElementById('shape-buttons');
  shapeButtons.innerHTML = '';

  // Group by category
  const categories = { platonic: [], archimedean: [], johnson: [] };
  for (const [key, data] of Object.entries(polyhedra)) {
    if (categories[data.category]) {
      categories[data.category].push({ key, name: data.name });
    }
  }

  // Helper to create a category section
  function createSection(name, shapes, collapsed = false, scrollable = false) {
    const section = document.createElement('div');
    section.className = 'category-section' + (collapsed ? ' collapsed' : '') + (scrollable ? ' scrollable' : '');

    const label = document.createElement('div');
    label.className = 'category-label';
    label.innerHTML = `<span class="collapse-icon">${collapsed ? '+' : '−'}</span> ${name} <span class="category-count">(${shapes.length})</span>`;
    label.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      const icon = label.querySelector('.collapse-icon');
      icon.textContent = section.classList.contains('collapsed') ? '+' : '−';
    });
    section.appendChild(label);

    const content = document.createElement('div');
    content.className = 'category-content';

    for (const { key, name } of shapes) {
      const thumb = document.createElement('div');
      thumb.className = 'shape-thumb';
      thumb.dataset.shape = key;
      if (key === currentShape) thumb.classList.add('active');

      const img = document.createElement('img');
      img.src = generateThumbnail(key);
      img.alt = name;
      thumb.appendChild(img);

      const tooltip = document.createElement('span');
      tooltip.className = 'tooltip';
      tooltip.textContent = name;
      thumb.appendChild(tooltip);

      thumb.addEventListener('click', () => selectShape(key));
      content.appendChild(thumb);
    }

    section.appendChild(content);
    return section;
  }

  shapeButtons.appendChild(createSection('Platonic', categories.platonic, false));
  shapeButtons.appendChild(createSection('Archimedean', categories.archimedean, false));
  shapeButtons.appendChild(createSection('Johnson', categories.johnson, true, true));

  // Generate color legend
  generateColorLegend();
}

function generateColorLegend() {
  const legend = document.getElementById('color-legend');
  if (!legend) return;

  legend.innerHTML = '';
  const names = {
    3: 'Triangle',
    4: 'Square',
    5: 'Pentagon',
    6: 'Hexagon',
    8: 'Octagon',
    10: 'Decagon'
  };

  for (const [sides, color] of Object.entries(polygonColors)) {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const swatch = document.createElement('span');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = '#' + color.toString(16).padStart(6, '0');

    const label = document.createElement('span');
    label.textContent = names[sides] || `${sides}-gon`;

    item.appendChild(swatch);
    item.appendChild(label);
    legend.appendChild(item);
  }
}

function selectShape(key) {
  document.querySelectorAll('.shape-thumb').forEach(thumb => {
    thumb.classList.toggle('active', thumb.dataset.shape === key);
  });
  currentShape = key;
  createPolyhedron();
}

// Wireframe toggle handler
const wireframeToggle = document.getElementById('wireframe-toggle');
wireframeToggle.addEventListener('click', () => {
  if (currentDisplay === 'wireframe') {
    currentDisplay = 'edges';
    wireframeToggle.classList.remove('active');
  } else {
    currentDisplay = 'wireframe';
    wireframeToggle.classList.add('active');
  }
  updateDisplay();
});

// Dual toggle handler
const dualToggle = document.getElementById('dual-toggle');
dualToggle.addEventListener('click', () => {
  showDual = !showDual;
  dualToggle.classList.toggle('active', showDual);
  createPolyhedron();
});

// Theme toggle handler
let isDarkMode = true;
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('light-mode', !isDarkMode);
  themeToggle.textContent = isDarkMode ? '☀️' : '🌙';

  // Update scene background
  scene.background = new THREE.Color(isDarkMode ? 0x1a1a2e : 0xe8e8f0);

  // Update edge colors
  const edgeColor = isDarkMode ? 0xffffff : 0x333333;
  edgeMaterial.color.setHex(edgeColor);
  wireframeMaterial.color.setHex(edgeColor);

  // Adjust lighting for light mode (brighter)
  ambientLight.intensity = isDarkMode ? 0.5 : 0.8;
  directionalLight.intensity = isDarkMode ? 0.8 : 1.0;
  directionalLight2.intensity = isDarkMode ? 0.4 : 0.6;
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Initialize
console.log('Initializing...');
try {
  console.log('polyhedra:', polyhedra);
  generateUI();
  console.log('UI generated');
  createPolyhedron();
  console.log('Polyhedron created');
  animate();
  console.log('Animation started');
} catch (e) {
  console.error('Initialization error:', e);
}
