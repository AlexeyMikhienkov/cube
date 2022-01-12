//import * as THREE from 'three'
import gsap from "gsap"

const {THREE} = global;

export default class Game {
    renderer;

    constructor() {

    }

    init() {
        const scene = new THREE.Scene();
        this.scene = scene;
        scene.background = new THREE.Color(0xffffff);

        this.renderer.setSize(600, 600);

        const fov = 75;
        const aspect = 2;
        const near = 0.5;
        const far = 10;

        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera = camera;

        camera.position.set(0, 0, 2);
        scene.add(camera);

        this.createCube();
        this.addFog();

        this.initRaycaster();

        this.animate()
    }

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        document.addEventListener('click', this.onClick);
    }

    onClick = (event) => {
        const canvasWidth = this.renderer.domElement.clientWidth;
        const canvasHeight = this.renderer.domElement.clientHeight;

        this.pointer.set((event.clientX / canvasWidth) * 2 - 1, - (event.clientY / canvasHeight) * 2 + 1);

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects([this.cube], false);

        const clickOffset = Math.PI / 2;

        if (intersects.length > 0) {
            const axis = this.chooseRandomAxis();
            const offset = this.chooseRandomOffset(clickOffset);

            const newValue = this.cube.rotation[axis] + offset;

            gsap.to(this.cube.rotation, {
                [axis]: newValue,
                duration: 0.5,
                ease: "sine.inOut",
                onComplete: () => console.log(this.cube.rotation)
            });

            console.log(axis, offset);
        }
    };

    chooseRandomOffset(offset) {
        return Math.random() * offset * 2 - offset;
    }

    chooseRandomAxis() {
        const rnd = Math.floor(Math.random() * 3);

        switch(rnd) {
            case 0:
                return "x";
            case 1:
                return "y";
            case 2:
                return "z";
        }
    }

    createCube() {
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new THREE.MeshPhongMaterial({
            color: 0x44aa72
        });

        this.material = material;

        const cube = new THREE.Mesh(geometry, material);
        this.cube = cube;

        this.scene.add(cube);


    }

    addFog() {
        const color = 0xffffff;
        const near = 0.1;
        const far = 5;
        this.scene.fog = new THREE.Fog(color, near, far);
    }

    animate() {
        const {cube, renderer, scene, camera} = this;

   /*     cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;*/

        renderer.render(scene, camera);

        requestAnimationFrame(() => this.animate());
    }
}

export const game = new Game();

// git remote set-url origin https://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@github.com/AlexeyMikhienkov/cube.git