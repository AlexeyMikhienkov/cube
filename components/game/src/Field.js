import {baseSettings} from "./settings";

export default class Field {
    _lines = [];

    constructor(lines) {
        for (let i = 0; i < lines; i++)
            this._lines.push(this.createLine())
    }

    initLines(scene) {
        const {offset, lineSize: {width, height}} = baseSettings.field;
        const fieldHeight = this._lines.length * height + (this._lines.length - 1) * offset;

        this._lines.forEach((line, index) => {
            line.position.set(width / 2, 0, height / 2 + (height + offset) * index - fieldHeight / 2);
            line.rotation.x = Math.PI / 2;

            console.log(line.position);

            scene.add(line)
        });
    }

    createLine() {
        const {width, height} = baseSettings.field.lineSize;

        const lineGeometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({color: 0xded0cd, side: THREE.DoubleSide});

        return new THREE.Mesh(lineGeometry, material);
    }

}