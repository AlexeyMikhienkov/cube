import CustomBasicMaterial from "../../../utils/three/CustomBasicMaterial";
import {baseSettings} from "./settings";

export default class Hero extends THREE.Mesh {
    constructor(time) {
        const {width, height, depth} = baseSettings.hero.size;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new CustomBasicMaterial({
            color: 0x000000,
            time
        });

        super(geometry, material);
    }

}