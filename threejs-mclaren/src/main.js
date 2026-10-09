import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Inisialisasi Scene & Background Gelap Elegan
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);
scene.fog = new THREE.FogExp2(0x0b0b0b, 0.03);

// 2. Kamera (POV)
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 2.5, 6);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 4. Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Batasi agar kamera tidak tembus lantai

// 5. Pencahayaan Studio (Lighting)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const blueAccentLight = new THREE.PointLight(0x00aaff, 5, 10);
blueAccentLight.position.set(-5, 2, -3);
scene.add(blueAccentLight);

// 6. Panggung Pameran (Pedestal & Floor)
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.4,
  metalness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
floor.receiveShadow = true;
scene.add(floor);

// Lingkaran Neon Panggung
const ringGeo = new THREE.RingGeometry(2.5, 2.6, 64);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3333, side: THREE.DoubleSide });
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.rotation.x = -Math.PI / 2;
ringMesh.position.y = -0.49;
scene.add(ringMesh);

// 7. Kontainer & Impor Model 3D McLaren (.glb)
const carContainer = new THREE.Group();
scene.add(carContainer);

let isRotating = true;
const loader = new GLTFLoader();

loader.load(
  '/models/mclaren.glb',
  function (gltf) {
    console.log('Model McLaren berhasil dimuat');
    const car = gltf.scene;

    // Aktifkan bayangan pada setiap mesh mobil
    car.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    // Otomatis atur skala agar proporsional di tengah scene
    const box = new THREE.Box3().setFromObject(car);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const targetSize = 3;
    const scale = targetSize / maxSize;
    car.scale.setScalar(scale);

    car.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );

    carContainer.add(car);
  },
  undefined,
  function (error) {
    console.error('Gagal memuat model McLaren:', error);
  }
);

// 8. Interaksi Tombol Spasi (Toggle Rotasi Showcase)
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    isRotating = !isRotating;
  }
});

// 9. Animasi / Render Loop
function animate() {
  requestAnimationFrame(animate);

  if (isRotating && carContainer) {
    carContainer.rotation.y += 0.004;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// 10. Responsif Terhadap Ukuran Layar Browser
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});