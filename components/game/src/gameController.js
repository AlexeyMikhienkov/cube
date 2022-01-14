import gsap from "gsap"
import Hero from "./hero";

const {THREE} = global;

export default class GameController {
    scene;
    renderer;
    camera;
    hero;
    raycaster;
    pointer;
    time = 0;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
    }

    appendContainer(container) {
        container.appendChild(this.renderer.domElement);
    }

    init() {
        const {renderer} = this;

        this.initScene();
        this.initCamera();

        renderer.setSize(600, 600);
        renderer.domElement.addEventListener('click', this.onClick);

        this.initHero();
        this.initFog();
        this.initRaycaster();

        this.animate()
    }

    initHero() {
        const hero = new Hero(this.time);

        this.hero = hero;
        this.scene.add(hero);
    }

    initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        this.scene = scene;
    }

    initCamera() {
        const fov = 75;
        const aspect = 2;
        const near = 0.5;
        const far = 10;

        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 0, 2);

        this.camera = camera;
        this.scene.add(camera);
    }

    initFog() {
        const color = 0xffffff;
        const near = 0.1;
        const far = 5;

        this.scene.fog = new THREE.Fog(color, near, far);
    }

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
    }

    onClick = (event) => {
        const {renderer, pointer, raycaster, hero, camera} = this;
        const canvasWidth = renderer.domElement.clientWidth;
        const canvasHeight = renderer.domElement.clientHeight;

        pointer.set(
            ((event.clientX - event.target.offsetLeft) / canvasWidth) * 2 - 1,
            - ((event.clientY - event.target.offsetTop) / canvasHeight) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects([hero], true);

        const clickOffset = Math.PI / 2;
        const axis = ["x", "y", "z"];

        if (intersects.length > 0) {
            const randomAxis = axis[Math.floor(Math.random() * axis.length)];
            const offset = Math.random() * clickOffset * 2 - clickOffset;

            const newValue = hero.rotation[randomAxis] + offset;

            gsap.to(hero.rotation, {
                [randomAxis]: newValue,
                duration: 0.5,
                ease: "sine.inOut",
            });
        }
    };

    animate = (t) => {
        const {renderer, scene, camera, hero} = this;

        hero._material.time = t;

        renderer.render(scene, camera);

        requestAnimationFrame(this.animate);
    }
}

export const game = new GameController();

// classes:
// Hero (куб) - визуал куба
// Enemy (препятствие) - визуал препятствия
// Field (игровое поле) - массив пустых ячеек, массив ячеек с потенциальными препятствиями,
//     сколько шагов текущая ячейка является пустой (const), счетчик пройденных шагов для пустой ячейки,
//     подсчет вероятности появления препятствия на непустых ячейках
// Cell (игровая ячейка) - пустая/непустая
