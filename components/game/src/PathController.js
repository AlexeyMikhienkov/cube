import {baseSettings, getDeltas} from "./settings";
import checkProbability from "../../../utils/number/probability";
import {randomIntFromRange} from "../../../utils/number/randomIntFromRange";
import {itemsFactory} from "./ItemsFactory";

export default class PathController {
    _currentLine;
    _probability = baseSettings.probability.min;
    _maxCounter = baseSettings.blocksInLine.max;
    _stepsCounter = baseSettings.blocksInLine.max;
    _currentFilledDistance = 0;
    _linesCount;
    _fieldHeight;
    _speed = baseSettings.speed.min;
    _emptyLines = [];
    _enemies = [];

    constructor(length) {
        const {offset, lineSize: {height}} = baseSettings.field;

        this._linesCount = length;
        this._fieldHeight = length * height + (length - 1) * offset;

        this._currentLine = randomIntFromRange(0, length - 1);
        this._emptyLines.push(this._currentLine);
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

    fillRow(scene) {
        const {blocksInLine} = baseSettings;
        const {_probability, _stepsCounter, _maxCounter, _linesCount, _emptyLines} = this;

        if (_stepsCounter <= 0)
            _emptyLines.push(this.chooseLine());

        const linesToFill = new Array(_linesCount)
            .fill(0)
            .map((item, index) => index)
            .filter(item => !_emptyLines.includes(item));

        linesToFill.forEach(line => {
            if (checkProbability(_probability))
                scene.add(this.createEnemy(line))
        });

        if (_emptyLines.length > 1) {
            this.chooseNewCurrentLine();

            this._stepsCounter = Math.ceil(this._maxCounter);

            if (_maxCounter <= blocksInLine.min)
                this._stepsCounter = blocksInLine.min;
        } else
            this._stepsCounter--;

        this._currentFilledDistance += baseSettings.step;
    }

    chooseNewCurrentLine() {
        const {_emptyLines, _currentLine} = this;

        const currentLineIndex = _emptyLines.indexOf(_currentLine);

        if (currentLineIndex !== -1)
            _emptyLines.splice(currentLineIndex, 1);

        this._currentLine = _emptyLines[Math.floor(Math.random() * _emptyLines.length)];
    }

    createEnemy(line) {
        const {
            field: {offset, lineSize: {height}},
            enemy: {size: {width: enemyWidth, depth: enemyDepth}}
        } = baseSettings;
        
        const {_currentFilledDistance, _fieldHeight} = this;

        //TODO: создавать через фабрику
        const enemy = itemsFactory.getItem("enemy");
        this._enemies.push(enemy);

        const posX = _currentFilledDistance;
        const posZ = height / 2 + (height + offset) * line - _fieldHeight / 2;

        enemy.position.set(posX + enemyWidth / 2, enemyDepth / 2, posZ);

        return enemy;
    }

    checkPassedEnemies(hero) {
        this._enemies.forEach(enemy => {
            if (enemy.position.x < hero.position.x - 20) {
                itemsFactory.pushItem(enemy);
                this._enemies.splice(this._enemies.indexOf(enemy), 1);
            }
        })
    }

    checkNeedToFill(scene, hero, camera, started) {
        const {visibilityInMetres} = baseSettings;
        const {_currentFilledDistance, _speed} = this;
        let distance = hero.position.x;

        if (started) {
            hero.position.x += this._speed;
            camera.position.x += this._speed;
        }

        if (distance + visibilityInMetres >= _currentFilledDistance) {
            this.fillRow(scene);
            this.checkNeedToFill(scene, hero, camera, started);
        }
    }

    updateValues(scene, hero, camera, started) {
        if (started)
            this.updateOnTick(started);

        this.checkNeedToFill(scene, hero, camera, started);

        this.checkPassedEnemies(hero);
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
