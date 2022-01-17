import gsap from "gsap"
import Hero from "./Hero";
import Field from "./Field";
import {baseSettings} from "./settings";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Enemy from "./Enemy";
import PathController from "./PathController";

const {THREE} = global;

export default class GameController {
    scene;
    renderer;
    camera;
    hero;
    field;
    raycaster;
    pointer;
    _width;
    _height;
    time = 0;
    pathController;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
    }

    appendContainer(container) {
        container.appendChild(this.renderer.domElement);
    }

    init() {
        const {renderer} = this;

        this.initScene();
        this.initHero();
        this.initCamera();

        renderer.domElement.addEventListener('click', this.onClick);


        this.initField();
        //   this.initFog();
        this.initRaycaster();
        this.initHelpers();

        this.pathController = new PathController(this.field._lines.length);

        this.resize();

        this.animate()
    }

    initHelpers() {
        const {scene, camera, renderer} = this;

        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();
    }

    resize() {
        const {renderer, camera} = this;
        const parent = renderer.domElement.parentNode;

        if (!parent) return;

        const {clientWidth, clientHeight} = parent;
        renderer.setSize(clientWidth, clientHeight);

        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
    }

    initHero() {
        const hero = new Hero(this.time);

        hero.position.set(hero.geometry.parameters.height / 2, hero.geometry.parameters.height / 2, 0);

        this.hero = hero;
        this.scene.add(hero);
    }

    initField() {
        const field = new Field(baseSettings.linesCount);

        this.field = field;

        field.initLines(this.scene);
    }

    initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        this.scene = scene;
    }

    initCamera() {
        const fov = 75;
        const aspect = 1;
        const near = 1;
        const far = 20;

        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(-3, 2.5, 0);
        camera.lookAt(this.hero.position.x, this.hero.position.y, this.hero.position.z);

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
            -((event.clientY - event.target.offsetTop) / canvasHeight) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects([hero], false);

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
        const {renderer, scene, camera, hero, pathController} = this;

        hero.material.time = t;

        hero.position.x += 0.05;
        camera.position.x += 0.05;

        pathController.fillVisibleField(scene, hero);

        renderer.render(scene, camera);

        requestAnimationFrame(this.animate)
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
