import {MeshBasicMaterial} from "three";
import {baseSettings} from "./settings";

export default class Enemy extends THREE.Mesh {
    constructor() {
        const {width: boxWidth, height: boxHeight, depth: boxDepth} = baseSettings.enemy.size;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new MeshBasicMaterial({
            color: 0xff0000,
        });

        super(geometry, material);
    }

}