import Hero from "./Hero";
import Field from "./Field";
import {baseSettings} from "./settings";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import PathController from "./PathController";
import ActionController from "./ActionController";

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
    actionController;
    _started = false;

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
        this.initRaycaster();
       // this.initHelpers();

        this.setHeroStartPosition();

        document.addEventListener('keydown', this.onKeyDown.bind(this));

        this.pathController = new PathController();
        this.actionController = new ActionController(this.field._lines);

        this.resize();

        this.animate()
    }

    onKeyDown(event) {
        event.preventDefault();
       // if (!this._started) return;

        switch(event.keyCode) {
            case 37:
                this.actionController.turnHero(this.hero, "left");
                break;
            case 39:
                this.actionController.turnHero(this.hero, "right");
                break;
            default:
                break;
        }
    }

    setHeroStartPosition() {
        const {hero, field: {_lines}} = this;
        const {width, height} = baseSettings.hero.size;
        const {linesCount} = baseSettings;

        const centralLineIndex = Math.ceil(linesCount / 2);
        const centralLine = _lines[centralLineIndex];

        hero.position.set(width / 2, centralLine.position.y + height / 2, centralLine.position.z);
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
        const far = 30;

        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(-3, 2.5, 0);
        camera.lookAt(this.hero.position.x, this.hero.position.y, this.hero.position.z);

        this.camera = camera;
        this.scene.add(camera);
    }

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
    }

    onClick = (event) => {
        const {renderer, pointer, raycaster, hero, camera} = this;
        const canvasWidth = renderer.domElement.clientWidth;
        const canvasHeight = renderer.domElement.clientHeight;

        event.preventDefault();

        pointer.set(
            ((event.clientX - event.target.offsetLeft) / canvasWidth) * 2 - 1,
            -((event.clientY - event.target.offsetTop) / canvasHeight) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects([hero], false);

        if (intersects.length > 0)
            this._started = !this._started;
    };

    animate = (t) => {
        const {renderer, scene, camera, hero, pathController, _started} = this;

        hero.material.time = t;

        pathController.updateValues(scene, hero, camera, _started);

        renderer.render(scene, camera);

        requestAnimationFrame(this.animate)
    }
}

export const game = new GameController();
