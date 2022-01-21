import {baseSettings} from "./settings";
import gsap from "gsap";

export default class ActionController {
    _currentLine;

    _lines;

    constructor(lines) {
        this._currentLine = Math.ceil(baseSettings.linesCount / 2);
        this._lines = lines;
    }

    turnHero(hero, side) {
        const {linesCount} = baseSettings;

        switch(side) {
            case "left":
                if (this._currentLine === 0)
                    return;
                this._currentLine--;
                break;
            case "right":
                if (this._currentLine === linesCount - 1)
                    return;
                this._currentLine++;
                break;
        }

        const coords = this._lines[this._currentLine].position;

        gsap.to(hero.position, {
            z: coords.z,
            duration: 0.1,
            ease: "sine.inOut"
        });

    }

}