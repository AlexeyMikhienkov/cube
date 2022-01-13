import gsap from "gsap"
import CustomBasicMaterial from "../../utils/three/CustomBasicMaterial";

const {THREE} = global;

export default class Game {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
    }

    appendContainer(container) {
        container.appendChild(this.renderer.domElement);
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

        this.renderer.domElement.addEventListener('click', this.onClick);
    }

    onClick = (event) => {
        const canvasWidth = this.renderer.domElement.clientWidth;
        const canvasHeight = this.renderer.domElement.clientHeight;

        this.pointer.set(
            ((event.clientX - event.target.offsetLeft) / canvasWidth) * 2 - 1,
            - ((event.clientY - event.target.offsetTop) / canvasHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects([this.cube], false);

        const clickOffset = Math.PI / 2;

        const axis = ["x", "y", "z"];

        if (intersects.length > 0) {
            const randomAxis = axis[Math.floor(Math.random() * axis.length)];
            const offset = Math.random() * clickOffset * 2 - clickOffset;

            const newValue = this.cube.rotation[randomAxis] + offset;

            gsap.to(this.cube.rotation, {
                [randomAxis]: newValue,
                duration: 0.5,
                ease: "sine.inOut",
            });
        }
    };

    chooseRandomOffset(offset) {
        return Math.random() * offset * 2 - offset;
    }

    createCube() {
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new CustomBasicMaterial({
            color: 0x000000
        });

        this.material = material;

        const cube = new THREE.Mesh(geometry, material);
        this.cube = cube;

        console.log(cube)

        this.scene.add(cube);
    }

    addFog() {
        const color = 0xffffff;
        const near = 0.1;
        const far = 5;
        this.scene.fog = new THREE.Fog(color, near, far);
    }

    animate = () => {
        const {cube, renderer, scene, camera} = this;

   /*     cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;*/

        renderer.render(scene, camera);

        requestAnimationFrame(this.animate);
    }
}

export const game = new Game();
