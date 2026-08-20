let scene;
let camera;
let renderer;
let player;
let playerBody;
let ground;
let world;
let snowflakes;
let obstacles = [];
let keys = {};
let sounds = {};
let playerX = 0;
let playerY = 0.7;
let speed = 0;
let score = 0;
let gifts = 0;
let running = false;
let jumping = false;
let jumpVelocity = 0;
let lastTime = 0;

function text(id, value) {
	const element = document.getElementById(id);
	if (element) element.textContent = value;
}

function visible(id, value, display = 'block') {
	const element = document.getElementById(id);
	if (element) element.style.display = value ? display : 'none';
}

const game = {
	config: {
		graphics: localStorage.getItem('sr3d_gfx') || 'medium',
		sensitivity: Number(localStorage.getItem('sr3d_sens')) || 1.2,
		volume: Number(localStorage.getItem('sr3d_vol')) || 0.5,
		skin: Number(localStorage.getItem('sr3d_skin')) || 0,
		fov: Number(localStorage.getItem('sr3d_fov')) || 70
	},

	init() {
		this.setupScene();
		this.setupUI();
		this.setupControls();
		this.setupAudio();
		const loader = document.getElementById('loader');
		if (loader) setTimeout(() => loader.remove(), 700);
		requestAnimationFrame((time) => this.animate(time));
	},

	setupScene() {
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x12365a);
		scene.fog = new THREE.Fog(0x12365a, 160, 1000);
		camera = new THREE.PerspectiveCamera(this.config.fov, innerWidth / innerHeight, 0.1, 3000);
		camera.position.set(0, 8, 24);
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(innerWidth, innerHeight);
		renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.shadowMap.enabled = this.config.graphics !== 'low';
		const host = document.getElementById('game-canvas') || document.body;
		host.appendChild(renderer.domElement);

		scene.add(new THREE.HemisphereLight(0xdff4ff, 0x163657, 1.5));
		const sun = new THREE.DirectionalLight(0xfff0cf, 2.1);
		sun.position.set(-180, 300, 140);
		sun.castShadow = renderer.shadowMap.enabled;
		scene.add(sun);

		const skyMaterial = new THREE.MeshBasicMaterial({
			color: 0x397eaa,
			side: THREE.BackSide
		});
		const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 24, 16), skyMaterial);
		scene.add(sky);

		const terrainGeometry = new THREE.PlaneGeometry(900, 3000, 100, 160);
		const positions = terrainGeometry.attributes.position.array;
		for (let i = 0; i < positions.length; i += 3) {
			const x = positions[i];
			const z = -positions[i + 1];
			positions[i + 2] = this.snowHeight(x, z);
		}
		terrainGeometry.computeVertexNormals();
		ground = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({
			color: 0xd9edf6,
			roughness: 0.92,
			metalness: 0
		}));
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		scene.add(ground);

		const snowGeometry = new THREE.BufferGeometry();
		const particles = [];
		for (let i = 0; i < 1800; i++) particles.push((Math.random() - 0.5) * 500, Math.random() * 90, -Math.random() * 900);
		snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
		snowflakes = new THREE.Points(snowGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.45, transparent: true, opacity: 0.55, depthWrite: false }));
		scene.add(snowflakes);

		this.createPlayer();
		world = new CANNON.World();
		world.gravity.set(0, -22, 0);
		playerBody = new CANNON.Body({ mass: 1, type: CANNON.Body.KINEMATIC, collisionResponse: false });
		playerBody.addShape(new CANNON.Box(new CANNON.Vec3(1.15, 0.45, 2))); 
		world.addBody(playerBody);
	},

	snowHeight(x, z) {
		return Math.sin(z * 0.012) * 1.8 + Math.sin(z * 0.031 + x * 0.02) * 0.35 + Math.max(0, Math.abs(x) - 30) * 0.025;
	},

	createPlayer() {
		player = new THREE.Group();
		const colors = [0xc0392b, 0x2980b9, 0x27ae60];
		const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 4), new THREE.MeshStandardMaterial({ color: colors[this.config.skin], metalness: 0.45, roughness: 0.3 }));
		body.castShadow = true;
		player.add(body);
		const seat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.15, 1.1), new THREE.MeshStandardMaterial({ color: 0x182337, roughness: 0.8 }));
		seat.position.set(0, 0.65, -0.45);
		player.add(seat);
		const runnerMaterial = new THREE.MeshStandardMaterial({ color: 0xaed8ed, metalness: 0.8, roughness: 0.22 });
		for (const x of [-0.82, 0.82]) {
			const runner = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 4.6), runnerMaterial);
			runner.position.set(x, -0.3, 0);
			runner.castShadow = true;
			player.add(runner);
		}
		player.position.set(0, playerY, 0);
		scene.add(player);
	},

	setupUI() {
		document.querySelectorAll('.tab-btn').forEach((button) => button.addEventListener('click', () => {
			document.querySelectorAll('.tab-btn, .panel').forEach((item) => item.classList.remove('active'));
			button.classList.add('active');
			const panel = document.getElementById(button.dataset.tab);
			if (panel) panel.classList.add('active');
		}));
		text('best-hud', localStorage.getItem('sr3d_best') || 0);
		text('garage-gifts', localStorage.getItem('sr3d_gifts') || 0);
		const values = [['gfx-quality', this.config.graphics], ['sens', this.config.sensitivity], ['fov-range', this.config.fov], ['audio-vol', this.config.volume]];
		values.forEach(([id, value]) => { const element = document.getElementById(id); if (element) element.value = value; });
	},

	setupControls() {
		addEventListener('keydown', (event) => { keys[event.key.toLowerCase()] = true; });
		addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });
		addEventListener('resize', () => {
			if (!renderer || !camera) return;
			camera.aspect = innerWidth / innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(innerWidth, innerHeight);
		});
	},

	setupAudio() {
		const volume = this.config.volume;
		['bg', 'crash', 'gift', 'slide', 'boost'].forEach((key) => { sounds[key] = new Audio(); sounds[key].volume = volume; });
	},

	start(difficulty) {
		speed = { easy: 70, medium: 110, hard: 160 }[difficulty] || 110;
		score = 0;
		gifts = 0;
		playerX = 0;
		playerY = this.snowHeight(0, 0) + 0.72;
		jumping = false;
		jumpVelocity = 0;
		player.position.set(playerX, playerY, 0);
		player.rotation.set(0, 0, 0);
		playerBody.position.set(playerX, playerY, 0);
		text('gifts-hud', 0);
		text('score-hud', 0);
		text('speed-val', Math.floor(speed * 1.5));
		visible('menu', false);
		visible('game-over', false);
		const hud = document.getElementById('hud');
		if (hud) hud.style.visibility = 'visible';
		running = true;
		lastTime = 0;
	},

	setSkin(id) {
		this.config.skin = id;
		localStorage.setItem('sr3d_skin', id);
		if (player && player.children[0]) player.children[0].material.color.set([0xc0392b, 0x2980b9, 0x27ae60][id]);
	},

	updateSetting(key, value) {
		this.config[key] = key === 'graphics' ? value : Number(value);
		localStorage.setItem('sr3d_' + key, value);
		if (key === 'fov' && camera) { camera.fov = Number(value); camera.updateProjectionMatrix(); }
		if (key === 'volume') Object.values(sounds).forEach((sound) => { sound.volume = Number(value); });
		if (key === 'graphics') location.reload();
	},

	animate(time) {
		requestAnimationFrame((nextTime) => this.animate(nextTime));
		const delta = Math.min((time - (lastTime || time)) / 1000, 0.04);
		lastTime = time;
		if (running) this.update(delta);
		renderer.render(scene, camera);
	},

	update(delta) {
		let steer = 0;
		if (keys.a || keys.arrowleft) steer -= 1;
		if (keys.d || keys.arrowright) steer += 1;
		playerX += steer * this.config.sensitivity * delta * 24;
		playerX = Math.max(-30, Math.min(30, playerX));
		const surface = this.snowHeight(playerX, -score * 2.2);
		if ((keys[' '] || keys.w || keys.arrowup) && !jumping) { jumping = true; jumpVelocity = 14; }
		if (jumping) { jumpVelocity -= 28 * delta; playerY += jumpVelocity * delta; if (playerY <= surface + 0.72) { playerY = surface + 0.72; jumping = false; } } else playerY = surface + 0.72;
		score += speed * delta * 0.02;
		player.position.set(playerX, playerY, 0);
		player.rotation.z += (-steer * 0.25 - player.rotation.z) * 0.12;
		playerBody.position.copy(player.position);
		text('score-hud', Math.floor(score));
		text('speed-val', Math.floor(speed * 1.5));
		camera.position.x += (playerX * 0.6 - camera.position.x) * 0.08;
		camera.position.y += (playerY + 8 - camera.position.y) * 0.08;
		camera.lookAt(playerX * 0.35, playerY, -65);
		const positions = snowflakes.geometry.attributes.position.array;
		for (let i = 1; i < positions.length; i += 3) { positions[i] -= delta * 10; if (positions[i] < 0) positions[i] = 90; }
		snowflakes.geometry.attributes.position.needsUpdate = true;
	},

	retry() { location.reload(); },
	toMenu() { location.reload(); }
};

window.game = game;

function boot() {
	if (window.THREE && window.CANNON) game.init();
}

document.addEventListener('DOMContentLoaded', boot);
