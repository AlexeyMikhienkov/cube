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
    }

    chooseLine() {
        const {_currentLine, _linesCount} = this;

        switch (_currentLine) {
            case 0:
                return 1;
            case _linesCount - 1:
                return _linesCount - 2;
            default:
                const variants = [_currentLine - 1, _currentLine + 1];
                return variants[Math.round(Math.random())];
        }
    }

    fillLine(scene, oldCurrent, newCurrent) {
        const {
            linesCount, field: {offset, lineSize: {height}},
            enemy: {size: {width: enemyWidth, depth: enemyDepth}}
        } = baseSettings;
        const {_fieldHeight, _currentLine, _currentFilledDistance} = this;

        for (let line = 0; line < linesCount; line++) {
            if (line === oldCurrent || line === newCurrent || line === _currentLine)
                continue;

            if (checkProbability(1)) {
                const enemy = new Enemy();

                const posX = Math.floor(_currentFilledDistance);
                const posZ = height / 2 + (height + offset) * line - _fieldHeight / 2;

                enemy.position.set(posX + enemyWidth / 2, enemyDepth / 2, posZ);

                scene.add(enemy);
            }
        }

        this._currentFilledDistance++;

        if (!oldCurrent && !newCurrent)
            this._stepsCounter--;

    }

    fillVisibleField(scene, hero) {
        const {visibilityInMetres} = baseSettings;
        let distance = hero.position.x;

        if (distance + visibilityInMetres < this._currentFilledDistance) return;

        if (this._stepsCounter <= 0) {
            const newLine = this.chooseLine();
            this.fillLine(scene, this._currentLine, newLine);
            this._currentLine = newLine;
            this._stepsCounter = 10;
        }

        this.fillLine(scene);
    }

}