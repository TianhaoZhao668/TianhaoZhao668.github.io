import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';

function createGlbViewer(containerSelector, glbPath, options = {}) {
    const finalOptions = {
        autoRotateSpeed: 0.42,
        backgroundColor: 0xf1f5f3,
        ambientIntensity: 0.85,
        hemisphereIntensity: 1.15,
        directionalIntensity: 1.25,
        fov: 36,
        cameraHeightMultiplier: 0.78,
        cameraDistanceMultiplier: 2.55,
        minDistance: 0.2,
        maxDistance: 80,
        ...options,
    };

    const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(finalOptions.backgroundColor);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const w = container.clientWidth || container.offsetWidth || 640;
    const h = container.clientHeight || 480;
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(finalOptions.fov, w / h, 0.01, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = finalOptions.autoRotateSpeed;
    controls.minDistance = finalOptions.minDistance;
    controls.maxDistance = finalOptions.maxDistance;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    controls.addEventListener('end', () => { controls.autoRotate = true; });

    const addLights = () => {
        const ambient = new THREE.AmbientLight(0xffffff, finalOptions.ambientIntensity);
        scene.add(ambient);

        const hemi = new THREE.HemisphereLight(0xffffff, 0xd7ddd9, finalOptions.hemisphereIntensity);
        scene.add(hemi);

        const key = new THREE.DirectionalLight(0xffffff, finalOptions.directionalIntensity);
        key.position.set(3, 5, 4);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xffffff, finalOptions.directionalIntensity * 0.35);
        fill.position.set(-4, 2, -3);
        scene.add(fill);
    };

    const frameScene = (root) => {
        const box = new THREE.Box3().setFromObject(root);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        root.position.sub(sphere.center);

        camera.near = Math.max(sphere.radius / 1000, 0.01);
        camera.far = Math.max(sphere.radius * 12, 1000);
        camera.updateProjectionMatrix();
        camera.position.set(0, sphere.radius * finalOptions.cameraHeightMultiplier, sphere.radius * finalOptions.cameraDistanceMultiplier);
        controls.target.set(0, 0, 0);
        controls.update();
    };

    addLights();

    const loader = new GLTFLoader();
    loader.load(glbPath, (gltf) => {
        container.querySelector('.city-viewer__loading')?.remove();
        const root = gltf.scene;

        root.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material) => {
                    if (!material) return;
                    material.side = THREE.DoubleSide;
                    if (typeof material.roughness === 'number') material.roughness = Math.max(material.roughness, 0.72);
                    if (typeof material.metalness === 'number') material.metalness = Math.min(material.metalness, 0.08);
                    material.needsUpdate = true;
                });
            }
        });

        scene.add(root);
        frameScene(root);
    }, (event) => {
        const loading = container.querySelector('.city-viewer__loading');
        if (!loading || !event.total) return;
        const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
        loading.textContent = `Loading city mesh... ${progress}%`;
    }, (error) => {
        console.error('Error loading GLB:', error);
        const loading = container.querySelector('.city-viewer__loading');
        if (loading) loading.textContent = 'Unable to load city mesh.';
    });

    function onResize() {
        const w2 = container.clientWidth || container.offsetWidth || 640;
        const h2 = container.clientHeight || 480;
        renderer.setSize(w2, h2);
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', onResize);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    onResize();
    animate();

    return {
        scene,
        camera,
        renderer,
        controls,
    };
}

export { createGlbViewer };



