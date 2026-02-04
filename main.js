import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { polyhedra, polygonColors, buildColoredGeometry, buildEdgesGeometry } from './polyhedra.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 4;

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
let currentDisplay = 'solid';
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

  // Build colored geometry from face data
  const geometry = buildColoredGeometry(data.vertices, data.faces, scale);
  const solidMesh = new THREE.Mesh(geometry, coloredMaterial);

  // Build edges
  const edgesGeometry = buildEdgesGeometry(data.vertices, data.faces, scale);
  const edgesLine = new THREE.LineSegments(edgesGeometry, edgeMaterial);
  const wireframeLine = new THREE.LineSegments(edgesGeometry, wireframeMaterial);

  // Store references
  meshGroup.userData = { solidMesh, edgesLine, wireframeLine };
  scene.add(meshGroup);

  updateDisplay();
}

function updateDisplay() {
  if (!meshGroup) return;

  const { solidMesh, edgesLine, wireframeLine } = meshGroup.userData;

  // Clear group
  meshGroup.clear();

  switch (currentDisplay) {
    case 'solid':
      meshGroup.add(solidMesh);
      break;
    case 'wireframe':
      meshGroup.add(wireframeLine);
      break;
    case 'edges':
      meshGroup.add(solidMesh);
      meshGroup.add(edgesLine);
      break;
  }
}

// Generate UI buttons dynamically
function generateUI() {
  const shapeButtons = document.getElementById('shape-buttons');
  shapeButtons.innerHTML = '';

  // Group by category
  const categories = { platonic: [], archimedean: [] };
  for (const [key, data] of Object.entries(polyhedra)) {
    categories[data.category].push({ key, name: data.name });
  }

  // Platonic solids
  const platonicLabel = document.createElement('div');
  platonicLabel.className = 'category-label';
  platonicLabel.textContent = 'Platonic';
  shapeButtons.appendChild(platonicLabel);

  for (const { key, name } of categories.platonic) {
    const btn = document.createElement('button');
    btn.dataset.shape = key;
    btn.textContent = name;
    if (key === currentShape) btn.classList.add('active');
    btn.addEventListener('click', () => selectShape(key));
    shapeButtons.appendChild(btn);
  }

  // Archimedean solids
  const archiLabel = document.createElement('div');
  archiLabel.className = 'category-label';
  archiLabel.textContent = 'Archimedean';
  shapeButtons.appendChild(archiLabel);

  for (const { key, name } of categories.archimedean) {
    const btn = document.createElement('button');
    btn.dataset.shape = key;
    btn.textContent = name;
    btn.addEventListener('click', () => selectShape(key));
    shapeButtons.appendChild(btn);
  }

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
  document.querySelectorAll('#shape-buttons button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.shape === key);
  });
  currentShape = key;
  createPolyhedron();
}

// Display mode handlers
document.querySelectorAll('#display-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('#display-buttons .active').classList.remove('active');
    btn.classList.add('active');
    currentDisplay = btn.dataset.display;
    updateDisplay();
  });
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
