import CustomBasicMaterial from "../../../utils/three/CustomBasicMaterial";

export default class Hero extends THREE.Mesh {
    constructor(time) {
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new CustomBasicMaterial({
            color: 0x000000,
            time
        });

        super(geometry, material);
    }

}