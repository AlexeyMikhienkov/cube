import Enemy from "../Enemy";
import {baseSettings} from "../settings";
import {MeshBasicMaterial} from "three";

export default class SmallEnemy extends Enemy {
    constructor() {
        super()
    }

    create() {
        super.create();

        const {width: boxWidth, height: boxHeight, depth: boxDepth} = baseSettings.enemy.size;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new MeshBasicMaterial({
            color: 0xff0000,
        });

        const mesh = new THREE.Mesh(geometry, material);
        this.add(mesh);
    }
}