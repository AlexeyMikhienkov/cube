import CustomBasicMaterial from "../../../utils/three/CustomBasicMaterial";

export default class Hero extends THREE.Mesh {
    constructor(time) {
        const boxWidth = 0.8;
        const boxHeight = 0.8;
        const boxDepth = 0.8;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new CustomBasicMaterial({
            color: 0x000000,
            time
        });

        super(geometry, material);
    }

}