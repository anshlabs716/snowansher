/*
 * Minimal but functional bootstrap for SnowAnsher.
 * This restores a real WebGL canvas and a simple animated scene so the game does not
 * remain a black screen, while keeping the UI hooks already defined in the HTML.
 */
(function(){
  const root = window;
  const existingGame = root.game || {};

  function ensureCanvas() {
    let host = document.getElementById('canvas-container');
    if (!host) {
      host = document.createElement('div');
      host.id = 'canvas-container';
      document.body.prepend(host);
    }
    return host;
  }

  const host = ensureCanvas();

  if (typeof THREE === 'undefined') {
    console.error('SnowAnsher: THREE.js failed to load. The page is black because WebGL was never initialized.');
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x8dc8ff, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x90d7ff);
  scene.fog = new THREE.Fog(0x90d7ff, 18, 120);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 5.5, 18);

  const hemi = new THREE.HemisphereLight(0xeaf7ff, 0x2f5d7c, 1.2);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(8, 20, 8);
  scene.add(sun);

  const terrainGeo = new THREE.PlaneGeometry(70, 180, 70, 100);
  const terrainPos = terrainGeo.attributes.position;
  for (let i = 0; i < terrainPos.count; i++) {
    const x = terrainPos.getX(i);
    const y = terrainPos.getY(i);
    const wave = Math.sin(x * 0.17) * 0.8 + Math.cos(y * 0.19) * 0.8;
    terrainPos.setZ(i, wave);
  }
  terrainGeo.computeVertexNormals();

  const terrain = new THREE.Mesh(
    terrainGeo,
    new THREE.MeshStandardMaterial({
      color: 0xf5fbff,
      roughness: 0.95,
      metalness: 0.04,
      flatShading: false
    })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.9;
  scene.add(terrain);

  const particleCount = 1000;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 80;
    particlePositions[i * 3 + 1] = Math.random() * 25 + 5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 180;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    })
  );
  scene.add(particles);

  const clock = new THREE.Clock();

  function renderFrame() {
    const t = clock.getElapsedTime();
    const drift = Math.sin(t * 0.7) * 1.5;
    camera.position.x = drift;
    camera.position.y = 5.5 + Math.sin(t * 1.2) * 0.4;
    camera.lookAt(0, -0.3, -20);

    terrain.rotation.z = Math.sin(t * 0.35) * 0.07;
    particles.rotation.y = t * 0.05;
    particles.rotation.z = t * 0.03;

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(renderFrame);

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', handleResize);

  root.game = {
    ...existingGame,
    totalGifts: Number(localStorage.getItem('sr3d_gifts')) || 0,
    unlockedSleds: JSON.parse(localStorage.getItem('sr3d_unlocked') || '[]'),
    config: { ...(existingGame.config || {}), skin: localStorage.getItem('sr3d_skin') || '' },
    sound: { playGiftCollect: function(){ /* noop placeholder */ } },
    renderer,
    scene,
    camera,
    terrain,
    particles,

    start(mode){
      console.log('game.start()', mode);
      const menu = document.getElementById('menu-overlay');
      if (menu) menu.classList.add('hidden');
      const hud = document.getElementById('hud');
      if (hud) hud.classList.add('active');
    },

    retry(){
      console.log('game.retry()');
      const go = document.getElementById('gameover-overlay');
      if (go) go.classList.add('hidden');
      const hud = document.getElementById('hud');
      if (hud) hud.classList.add('active');
    },

    openMenu(){
      console.log('game.openMenu()');
      const menu = document.getElementById('menu-overlay');
      if (menu) menu.classList.remove('hidden');
    },

    togglePause(){
      console.log('game.togglePause()');
      const p = document.getElementById('pause-overlay');
      if (p) p.classList.toggle('hidden');
    },

    setOption(key, value){
      console.log('game.setOption()', key, value);
      if (key === 'theme') document.documentElement.setAttribute('data-theme', value);
      try { localStorage.setItem('sr3d_opt_' + key, value); } catch (e) {}
    },

    loadSledModel(id){
      console.log('game.loadSledModel()', id);
    }
  };

  try {
    if (typeof GameUI !== 'undefined') {
      root.gameUI = new GameUI(root.game);
      if (root.gameUI && typeof root.gameUI.renderGarageShowroom === 'function') {
        root.gameUI.renderGarageShowroom();
      }
    }
  } catch (err) {
    console.warn('Failed to initialize GameUI:', err);
  }
})();
