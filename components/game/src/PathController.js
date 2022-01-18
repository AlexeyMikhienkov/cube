import {baseSettings, getDeltas} from "./settings";
import checkProbability from "../../../utils/number/probability";
import Enemy from "./Enemy";
import {randomIntFromRange} from "../../../utils/number/randomIntFromRange";

export default class PathController {
    _currentLine;
    _probability = baseSettings.probability.min;
    _maxCounter = baseSettings.blocksInLine.max;
    _stepsCounter = baseSettings.blocksInLine.max;
    _currentFilledDistance = 0;
    _linesCount;
    _fieldHeight;
    _speed = baseSettings.speed.min;

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
        const {_fieldHeight, _currentLine, _currentFilledDistance, _probability} = this;

        for (let line = 0; line < linesCount; line++) {
            if (line === oldCurrent || line === newCurrent || line === _currentLine)
                continue;

            if (checkProbability(_probability)) {
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

    fillVisibleField(scene, hero, camera, started) {
        const {visibilityInMetres} = baseSettings;
        const {_currentFilledDistance, _currentLine, _stepsCounter, _maxCounter} = this;
        let distance = hero.position.x;

        if (started) {
            hero.position.x += this._speed;
            camera.position.x += this._speed;
        }

        if (distance + visibilityInMetres >= _currentFilledDistance)
            this.fillLine(scene);

        if (_stepsCounter <= 0) {
            const newLine = this.chooseLine();
            this.fillLine(scene, _currentLine, newLine);
            this._currentLine = newLine;

            this._stepsCounter = Math.ceil(this._maxCounter);

            if (_maxCounter <= baseSettings.blocksInLine.min)
                this._stepsCounter = baseSettings.blocksInLine.min;
        }
    }

    updateValues(scene, hero, camera, started) {
        if (started) {
            this.updateOnTick(started);
        }

        this.fillVisibleField(scene, hero, camera, started)
    }

    updateOnTick() {
        const {speed, probability, blocksInLine} = baseSettings;

        if (this._probability < probability.max)
            this._probability += getDeltas().probability;

        if (this._speed < speed.max)
            this._speed += getDeltas().speed;

        if (this._maxCounter > blocksInLine.min)
            this._maxCounter -= getDeltas().blocksCounter;
    }
}
