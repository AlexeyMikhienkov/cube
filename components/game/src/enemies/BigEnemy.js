import Enemy from "../Enemy";
import {baseSettings} from "../settings";
import {MeshBasicMaterial} from "three";

export default class BigEnemy extends Enemy {
    _meshes = [];

    constructor() {
        super();
    }

    create() {
        super.create();

        const {width: boxWidth, height: boxHeight, depth: boxDepth} = baseSettings.enemy.size;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new MeshBasicMaterial({
            color: 0x0000ff,
        });

        for (let i = 0; i < 5; i++) {
            this._meshes.push(new THREE.Mesh(geometry, material))
        }

        this._meshes[0].position.set(0, 0, 0);
        this._meshes[1].position.set(boxWidth, 0, 0);
        this._meshes[2].position.set(boxWidth * 2, 0, 0);
        this._meshes[3].position.set(boxWidth * 2, 0, boxHeight);
        this._meshes[4].position.set(boxWidth * 2, 0, boxHeight * 2);

        this._meshes.forEach(mesh => this.add(mesh));
    }

}