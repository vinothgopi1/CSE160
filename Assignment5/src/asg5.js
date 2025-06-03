// asg5.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;

const robotArmy = [];
const alienCreatureArmy = [];
const skyUFOs = [];
const fencePosts = [];
const fallingAsteroids = [];

let raycaster;
let mouse;
let sunMesh;

let chargeState = 'idle';
let chargeStartTime = 0;
const chargeDuration = 2000;
const returnDuration = 2000;
const chargeDistance = 25;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createFallingAsteroid() {
    const asteroidGeometries = [
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.DodecahedronGeometry(1.2)
    ];
    const geom = asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)];

    const colors = [0x8B0000, 0x696969, 0x36454F];
    const material = new THREE.MeshPhongMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });

    const asteroid = new THREE.Mesh(geom, material);

    asteroid.position.set(
        (Math.random() - 0.5) * 60,
        30 + Math.random() * 10,
        (Math.random() - 0.5) * 60
    );
    asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    scene.add(asteroid);
    return asteroid;
}

function onDocumentMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([sunMesh]);

    if (intersects.length > 0 && chargeState === 'idle') {
        chargeState = 'charging';
        chargeStartTime = Date.now();
        console.log("Sun clicked! Armies charging.");
    }
}

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();

    robotArmy.forEach(character => {
        const model = character.model;
        const initialPos = character.initialPosition;
        let targetY = -5;

        if (chargeState === 'charging') {
            const progress = Math.min(1, (currentTime - chargeStartTime) / chargeDuration);
            const chargeTargetX = initialPos.x < 0 ? initialPos.x + chargeDistance : initialPos.x - chargeDistance;
            model.position.x = initialPos.x + (chargeTargetX - initialPos.x) * progress;
            model.position.y = initialPos.y;
        } else if (chargeState === 'returning') {
            const progress = Math.min(1, (currentTime - chargeStartTime) / returnDuration);
            model.position.x = initialPos.x + (model.position.x - initialPos.x) * (1 - progress);
            model.position.y = initialPos.y;
        } else {
            targetY = -5 + Math.sin(currentTime * 0.002 + robotArmy.indexOf(character) * 0.5) * 0.2;
            model.position.y = targetY;
        }
    });

    alienCreatureArmy.forEach(character => {
        const model = character.model;
        const initialPos = character.initialPosition;
        let targetY = -5;

        if (chargeState === 'charging') {
            const progress = Math.min(1, (currentTime - chargeStartTime) / chargeDuration);
            const chargeTargetX = initialPos.x < 0 ? initialPos.x + chargeDistance : initialPos.x - chargeDistance;
            model.position.x = initialPos.x + (chargeTargetX - initialPos.x) * progress;
            model.position.y = initialPos.y;
        } else if (chargeState === 'returning') {
            const progress = Math.min(1, (currentTime - chargeStartTime) / returnDuration);
            model.position.x = initialPos.x + (model.position.x - initialPos.x) * (1 - progress);
            model.position.y = initialPos.y;
        } else {
            targetY = -5 + Math.cos(currentTime * 0.002 + alienCreatureArmy.indexOf(character) * 0.5) * 0.2;
            model.position.y = targetY;
        }
    });

    if (chargeState === 'charging' && (currentTime - chargeStartTime) >= chargeDuration) {
        chargeState = 'returning';
        chargeStartTime = currentTime;
        console.log("Armies reached charge point. Returning.");
    } else if (chargeState === 'returning' && (currentTime - chargeStartTime) >= returnDuration) {
        chargeState = 'idle';
        console.log("Armies returned to idle position.");
    }

    skyUFOs.forEach((ufo, index) => {
        const speed = 0.0005 + index * 0.0001;
        const radius = 30 + index * 10;

        ufo.position.x = Math.cos(Date.now() * speed) * radius;
        ufo.position.z = Math.sin(Date.now() * speed) * radius;
        ufo.rotation.y = Date.now() * speed + Math.PI / 2;
    });

    for (let i = fallingAsteroids.length - 1; i >= 0; i--) {
        const asteroid = fallingAsteroids[i];
        asteroid.position.y -= 0.1;
        asteroid.rotation.x += 0.02;
        asteroid.rotation.y += 0.01;

        if (asteroid.position.y < -10) {
            scene.remove(asteroid);
            fallingAsteroids.splice(i, 1);
            fallingAsteroids.push(createFallingAsteroid());
        }
    }

    controls.update();

    renderer.render(scene, camera);
}

function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 50);

    const canvas = document.getElementById('webgl');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    window.addEventListener('resize', onWindowResize);

    const textureLoader = new THREE.TextureLoader();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

    textureLoader.load(
        '../assets/galaxy.jpeg',
        function (texture) {
            const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
            skyGeometry.scale(-1, 1, 1);
            const skyMaterial = new THREE.MeshBasicMaterial({ map: texture });
            const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
            scene.add(skybox);
        },
        undefined,
        function (err) {
            console.error('Error loading skybox texture:', err);
            scene.background = new THREE.Color(0x000000);
        }
    );

    const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(0, 15, 0);
    scene.add(sunMesh);

    const planeGeometry = new THREE.PlaneGeometry(80, 80);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -7;
    plane.receiveShadow = true;
    scene.add(plane);

    const numFallingAsteroids = 5;
    for (let i = 0; i < numFallingAsteroids; i++) {
        fallingAsteroids.push(createFallingAsteroid());
    }
    console.log("Falling asteroids (animated primary shapes) added.");

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        '../assets/models/RobotExpressive.glb',
        function (gltf) {
            const originalRobotModel = gltf.scene;

            const numRobots = 12;
            for (let i = 0; i < numRobots; i++) {
                const robot = originalRobotModel.clone();
                const initialX = -25 + (Math.random() - 0.5) * 10;
                const initialZ = (Math.random() - 0.5) * 60;
                robot.position.set(initialX, -5, initialZ);
                robot.scale.set(1.5, 1.5, 1.5);
                robot.rotation.y = Math.PI / 2;

                robot.traverse(function (node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                scene.add(robot);
                robotArmy.push({ model: robot, initialPosition: new THREE.Vector3(initialX, -5, initialZ) });
            }
            console.log("Robot Army Loaded.");
        },
        undefined,
        function (error) {
            console.error('An error occurred loading the Robot GLTF model:', error);
        }
    );

    gltfLoader.load(
        '../assets/models/Zombie.glb',
        function (gltf) {
            const originalZombieModel = gltf.scene;

            const numZombies = 12;
            for (let i = 0; i < numZombies; i++) {
                const zombie = originalZombieModel.clone();
                const initialX = 25 + (Math.random() - 0.5) * 10;
                const initialZ = (Math.random() - 0.5) * 60;
                zombie.position.set(initialX, -5, initialZ);
                zombie.scale.set(1.0, 1.0, 1.0);
                zombie.rotation.y = -Math.PI / 2;

                zombie.traverse(function (node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                scene.add(zombie);
                alienCreatureArmy.push({ model: zombie, initialPosition: new THREE.Vector3(initialX, -5, initialZ) });
            }
            console.log("Zombie Army Loaded.");
        },
        undefined,
        function (error) {
            console.error('An error occurred loading the Zombie GLTF model:', error);
            const fallbackGeometry = new THREE.CapsuleGeometry(1, 2, 4, 8);
            const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const numFallbackZombies = 12;
            for (let i = 0; i < numFallbackZombies; i++) {
                const fallbackZombie = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
                const initialX = 25 + (Math.random() - 0.5) * 10;
                const initialZ = (Math.random() - 0.5) * 60;
                fallbackZombie.position.set(initialX, -5, initialZ);
                fallbackZombie.castShadow = true;
                fallbackZombie.receiveShadow = true;
                scene.add(fallbackZombie);
                alienCreatureArmy.push({ model: fallbackZombie, initialPosition: new THREE.Vector3(initialX, -5, initialZ) });
            }
            console.log("Zombie GLTF failed to load, using fallback capsules for zombie army.");
        }
    );

    gltfLoader.load(
        '../assets/models/UFO.glb',
        function (gltf) {
            const originalSkyUFOModel = gltf.scene;

            const numSkyUFOs = 8;
            for (let i = 0; i < numSkyUFOs; i++) {
                const ufo = originalSkyUFOModel.clone();
                ufo.position.set(
                    (Math.random() - 0.5) * 80,
                    15 + Math.random() * 15,
                    (Math.random() - 0.5) * 80
                );
                ufo.scale.set(1.5, 1.5, 1.5);
                ufo.rotation.y = Math.random() * Math.PI * 2;

                ufo.traverse(function (node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                scene.add(ufo);
                skyUFOs.push(ufo);
            }
            console.log("Sky UFOs Loaded.");
        },
        undefined,
        function (error) {
            console.error('An error occurred loading the Sky UFO GLTF model:', error);
            const fallbackGeometry = new THREE.SphereGeometry(2, 16, 16);
            const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0x8888ff });
            const numFallbackSkyUFOs = 8;
            for (let i = 0; i < numFallbackSkyUFOs; i++) {
                const fallbackUFO = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
                fallbackUFO.position.set(
                    (Math.random() - 0.5) * 80,
                    15 + Math.random() * 15,
                    (Math.random() - 0.5) * 80
                );
                fallbackUFO.castShadow = true;
                fallbackUFO.receiveShadow = true;
                scene.add(fallbackUFO);
                skyUFOs.push(fallbackUFO);
            }
            console.log("Sky UFO GLTF failed to load, using fallback spheres for sky UFOs.");
        }
    );

    console.log("Battlefield terrain obstacles removed.");

    textureLoader.load(
        '../assets/textures/brick_diffuse.jpg',
        function(fenceTexture) {
            const fenceMaterial = new THREE.MeshPhongMaterial({ map: fenceTexture });
            const fencePostGeometry = new THREE.BoxGeometry(1, 4, 1);
            const fenceConeGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);
            const redMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });

            const perimeter = 38;
            const fencePositions = [
                new THREE.Vector3(perimeter, -5, perimeter),
                new THREE.Vector3(perimeter, -5, -perimeter),
                new THREE.Vector3(-perimeter, -5, perimeter),
                new THREE.Vector3(-perimeter, -5, -perimeter),
                new THREE.Vector3(perimeter, -5, 0),
                new THREE.Vector3(-perimeter, -5, 0),
                new THREE.Vector3(0, -5, perimeter),
                new THREE.Vector3(0, -5, -perimeter),
            ];

            fencePositions.forEach(pos => {
                const post = new THREE.Mesh(fencePostGeometry, fenceMaterial);
                post.position.copy(pos);
                post.castShadow = true;
                post.receiveShadow = true;
                scene.add(post);
                fencePosts.push(post);

                const cone = new THREE.Mesh(fenceConeGeometry, redMaterial);
                cone.position.set(pos.x, pos.y + 2.75, pos.z);
                cone.castShadow = true;
                cone.receiveShadow = true;
                scene.add(cone);
                fencePosts.push(cone);
            });
            console.log("Perimeter fence with red cones added.");
        },
        undefined,
        function(err) {
            console.error('Error loading fence texture:', err);
            const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            const fallbackRedMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
            const fencePostGeometry = new THREE.BoxGeometry(1, 4, 1);
            const fenceConeGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);

            const perimeter = 38;
            const fencePositions = [
                new THREE.Vector3(perimeter, -5, perimeter),
                new THREE.Vector3(perimeter, -5, -perimeter),
                new THREE.Vector3(-perimeter, -5, perimeter),
                new THREE.Vector3(-perimeter, -5, -perimeter),
                new THREE.Vector3(perimeter, -5, 0),
                new THREE.Vector3(-perimeter, -5, 0),
                new THREE.Vector3(0, -5, perimeter),
                new THREE.Vector3(0, -5, -perimeter),
            ];
            fencePositions.forEach(pos => {
                const post = new THREE.Mesh(fencePostGeometry, fallbackMaterial);
                post.position.copy(pos);
                post.castShadow = true;
                post.receiveShadow = true;
                scene.add(post);
                fencePosts.push(post);

                const cone = new THREE.Mesh(fenceConeGeometry, fallbackRedMaterial);
                cone.position.set(pos.x, pos.y + 2.75, pos.z);
                cone.castShadow = true;
                cone.receiveShadow = true;
                scene.add(cone);
                fencePosts.push(cone);
            });
            console.log("Fence texture failed to load, using fallback materials for fence.");
        }
    );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI * 0.9;
    controls.minDistance = 5;
    controls.maxDistance = 100;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 20, 10);
    directionalLight.target.position.set(0, -5, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 80;
    directionalLight.shadow.camera.left = -40;
    directionalLight.shadow.camera.right = 40;
    directionalLight.shadow.camera.top = 40;
    directionalLight.shadow.camera.bottom = -40;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    const pointLight = new THREE.PointLight(0xffffee, 50, 50);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    scene.add(pointLight);

    const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0x000000, 0.2);
    scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(0x444444, 0.3);
    scene.add(ambientLight);

    console.log("The \"Wow Point\" for this application is the creation of a dynamic intergalactic battlefield. It features a robot army facing off against a zombie army, with UFOs patrolling the skies, and a perimeter fence, creating a visually rich and narrative-driven exploration experience.");

    animate();
}

window.onload = initScene;