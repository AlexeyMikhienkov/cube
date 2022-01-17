import {baseSettings} from "./settings";
import checkProbability from "../../../utils/number/probability";
import Enemy from "./Enemy";
import {randomIntFromRange} from "../../../utils/number/randomIntFromRange";

export default class PathController {
    _currentLine;
    _probability;
    _stepsCounter = 10;
    _currentFilledDistance = 0;
    _enemies;
    _linesCount;
    _fieldHeight;

    constructor(length) {
        const {offset, lineSize: {height}} = baseSettings.field;

        this._linesCount = length;
        this._fieldHeight = length * height + (length - 1) * offset;

        this._currentLine = randomIntFromRange(0, length - 1);
        console.log("current line:", this._currentLine)
    }

    chooseLine() {
        let newCurrentLine = randomIntFromRange(0, 2);

        while (newCurrentLine === this._currentLine) {
            newCurrentLine = randomIntFromRange(0, 2);
            console.log("new", newCurrentLine);
        }

        this._currentLine = newCurrentLine;
        console.log("НОВАЯ ЛИНИЯ:", this._currentLine)
    }

    fillRow(scene) {
        const {
            linesCount, field: {offset, lineSize: {height}},
            enemy: {size: {width: enemyWidth, depth: enemyDepth}}
        } = baseSettings;
        const {_fieldHeight, _currentLine, _currentFilledDistance} = this;

        for (let line = 0; line < linesCount; line++) {
            if (line === _currentLine) continue;

            if (checkProbability(0.2)) {
                const enemy = new Enemy();

                const posX = Math.floor(_currentFilledDistance);
                const posZ = height / 2 + (height + offset) * line - _fieldHeight / 2;

                enemy.position.set(posX + enemyWidth / 2, enemyDepth / 2, posZ);

                scene.add(enemy);
            }
        }

        this._currentFilledDistance++;
        this._stepsCounter--;

        console.log("steps", this._stepsCounter)
    }

    fillVisibleField(scene, hero) {
        const {visibilityInMetres} = baseSettings;
        let distance = hero.position.x;

        if (distance + visibilityInMetres < this._currentFilledDistance) return;

        if (this._stepsCounter <= 0) {
            this.chooseLine();
            this._stepsCounter = 10;
        }

        this.fillRow(scene);
    }

}