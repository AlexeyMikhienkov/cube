import CustomBasicMaterial from "../../../utils/three/CustomBasicMaterial";

export default class Hero extends THREE.Object3D {
    _geometry;
    _material;

    constructor(time) {
        super();

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new CustomBasicMaterial({
            color: 0x000000,
            time
        });

        const cube = new THREE.Mesh(geometry, material);
        this.add(cube);

        this._geometry = geometry;
        this._material = material;
    }

}