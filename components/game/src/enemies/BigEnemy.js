import Enemy from "../Enemy";
import {baseSettings} from "../settings";
import {MeshBasicMaterial} from "three";

export default class BigEnemy extends Enemy {
    _meshes = [];
    _offsetMeshes = [];

    create(settings) {
        super.create();

        const {matrix, dims} = settings;

        const {width: boxWidth, height: boxHeight, depth: boxDepth} = baseSettings.enemy.size;
        const {offset} = baseSettings.field;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new MeshBasicMaterial({
            color: 0x0000ff,
        });

        const geometryInOffset = new THREE.BoxGeometry(boxWidth, boxHeight, offset);

        const blocksCount = matrix.flat().reduce((prev, cur) => prev + cur, 0);

        for (let i = 0; i < blocksCount; i++) {
            this._meshes.push(new THREE.Mesh(geometry, material));
        }

        for (let i = 0; i < dims.columns; i++) {
            this._offsetMeshes.push(new THREE.Mesh(geometryInOffset, material))
        }

        let meshesCounter = 0;

        for (let row = 0; row < dims.rows; row++)
            for (let column = 0; column < dims.columns; column++) {
                if (matrix[row][column] === 1) {
                    const invertedRow = dims.rows - 1 - row;
                    const mesh = this._meshes[meshesCounter];

                    mesh.position.set(boxWidth * invertedRow, 0, (boxHeight + offset) * column);

                    meshesCounter++;
                }
            }

        this._offsetMeshes[0].position.set(boxWidth * 2, 0, boxDepth - offset / 2);
        this._offsetMeshes[1].position.set(boxWidth * 2, 0, boxDepth * 2 + offset / 2);

        this._meshes.forEach(mesh => this.add(mesh));

        this._offsetMeshes.forEach(mesh => this.add(mesh))
    }

}