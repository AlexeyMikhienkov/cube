import Enemy from "../Enemy";
import {baseSettings} from "../settings";
import {MeshBasicMaterial} from "three";

export default class MediumEnemy extends Enemy {
    _meshes = [];
    _offsetMeshes = [];

    constructor() {
        super();
    }

    create() {
        super.create();

        const {width: boxWidth, height: boxHeight, depth: boxDepth} = baseSettings.enemy.size;
        const {offset} = baseSettings.field;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new MeshBasicMaterial({
            color: 0x00ff00,
        });

        const geometryInOffset = new THREE.BoxGeometry(boxWidth, boxHeight, offset);


        for (let i = 0; i < 4; i++)
            this._meshes.push(new THREE.Mesh(geometry, material))

        for (let i = 0; i < 2; i++)
            this._offsetMeshes.push(new THREE.Mesh(geometryInOffset, material));



        this._meshes[0].position.set(0, 0, 0);
        this._meshes[1].position.set(boxWidth, 0, 0);
        this._meshes[2].position.set(boxWidth, 0, boxDepth + offset);
        this._meshes[3].position.set(0, 0, boxDepth + offset);
        this._offsetMeshes[0].position.set(0, 0, boxDepth - offset / 2);
        this._offsetMeshes[1].position.set(boxWidth, 0, boxDepth - offset / 2); // почему блин??????

        this._meshes.forEach(mesh => this.add(mesh));
        this._offsetMeshes.forEach(mesh => this.add(mesh));
    }
}