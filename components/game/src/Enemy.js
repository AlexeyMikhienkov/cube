import {MeshBasicMaterial, Object3D} from "three";
import {baseSettings} from "./settings";

export default class Enemy extends Object3D {
    constructor() {
        super();
    }

    create() {

    }

    reset() {
        this.parent?.remove(this);
    }
}