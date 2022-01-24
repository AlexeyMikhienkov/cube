import {MeshBasicMaterial, Object3D} from "three";
import {baseSettings} from "./settings";

export default class Enemy extends Object3D {
    constructor() {
        super();
    }

    create(settings) {
        const {matrix, dims, type} = settings;

        const {width: boxWidth, height: boxHeight, depth: boxDepth} = baseSettings.enemy.size;
        const {offset} = baseSettings.field;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const offsetGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, offset);

        const material = new MeshBasicMaterial({
            color: type === 'small' ? 0xff0000 :
                    type === 'medium' ? 0x00ff00 :
                        type === 'big' ? 0x0000ff : null
            });


        for (let row = 0; row < dims.rows; row++)
            for (let column = 0; column < dims.columns; column++) {
                if (matrix[row][column] === 1) {
                    const invertedRow = dims.rows - 1 - row;
                    const mesh = new THREE.Mesh(geometry, material);

                    mesh.position.set(boxWidth * invertedRow, 0, (boxHeight + offset) * column);
                    this.add(mesh);
                }

                if (column < dims.columns - 1 && matrix[row][column] === 1 && matrix[row][column + 1] === 1) {
                    const invertedRow = dims.rows - 1 - row;
                    const offsetMesh = new THREE.Mesh(offsetGeometry, material);

                    offsetMesh.position.set(boxWidth * invertedRow, 0, boxDepth - offset / 2 + (boxDepth + offset) * column);
                    this.add(offsetMesh);
                }
            }

    }

    reset() {
        this.parent?.remove(this);
    }
}