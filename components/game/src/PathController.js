import {baseSettings, enemies, getDeltas, sortEnemiesDimensionsDesc} from "./settings";
import checkProbability from "../../../utils/number/probability";
import {randomIntFromRange} from "../../../utils/number/randomIntFromRange";
import {itemsFactory} from "./ItemsFactory";
import Cell from "./Cell";
import {max} from "three/examples/jsm/renderers/nodes/ShaderNode";

export default class PathController {
    /**
     * Текущая линия без препятствий
     */
    _currentLine;

    /**
     * Вероятность появления препятствия
     * @type {number}
     * @private
     */
    _probability = baseSettings.probability.min;

    /**\
     * Максимальная длина линии без препятствий
     * @type {number}
     * @private
     */
    _maxCounter = baseSettings.blocksInLine.max;

    /**
     * Счетчик шагов для текущей линии от maxCounter до нуля
     * @type {number}
     * @private
     */
    _stepsCounter = baseSettings.blocksInLine.max;

    /**
     * Текущее значение скорости движения объектов
     * @type {number}
     * @private
     */
    _speed = baseSettings.speed.min;

    /**
     * Заполненное препятствиями пространство
     * @type {number}
     * @private
     */
    _currentFilledDistance = 0;

    /**
     * Число линий в игре
     */
    _linesCount;

    /**
     * Ширина поля с учетом всех линий и отступов между ними
     */
    _fieldHeight;

    /**
     * Массив пустых линий
     * @type {Array}
     * @private
     */
    _emptyLines = [];

    _cellsMatrix = [];

    static ENEMIES_TYPES = sortEnemiesDimensionsDesc();
    static EMPTY_CELL = 0;
    static PATH_CELL = 1;
    static ENEMY_CELL = 2;

    /**
     * Конструктор класса
     * @param linesCount число линий в игре
     */
    constructor(linesCount) {
        const {offset, lineSize: {height}} = baseSettings.field;

        this._linesCount = linesCount;
        this._fieldHeight = linesCount * height + (linesCount - 1) * offset;

        this._currentLine = randomIntFromRange(0, linesCount - 1);
        this._emptyLines.push(this._currentLine);

        console.log("!! CURRENT LINE:", this._currentLine);
      //  debugger
    }

    /**
     * Выбор доступной линии для смены линий
     * @returns {number|*}
     */
    chooseNewEmptyLine() {
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

    /**
     * Заполнение ряда игры
     * @param scene сцена
     */
    fillRow(scene) {
        const {blocksInLine} = baseSettings;
        const {_probability, _stepsCounter, _maxCounter, _linesCount, _emptyLines} = this;

        if (_stepsCounter <= 0)
            _emptyLines.push(this.chooseNewEmptyLine());

        const linesToFill = new Array(_linesCount)
            .fill(0)
            .map((item, index) => index)
            .filter(item => !_emptyLines.includes(item));

        linesToFill.forEach(line => {
            if (checkProbability(_probability))
                scene.add(this.createEnemy(line))
        });

        if (_emptyLines.length > 1) {
            this.chooseNextCurrentLine();

            this._stepsCounter = Math.ceil(this._maxCounter);

            if (_maxCounter <= blocksInLine.min)
                this._stepsCounter = blocksInLine.min;
        } else
            this._stepsCounter--;

        this._currentFilledDistance += baseSettings.step;
    }

    /**
     * Выбор новой пустой линии
     */
    chooseNextCurrentLine() {
        const {_emptyLines, _currentLine} = this;

        const currentLineIndex = _emptyLines.indexOf(_currentLine);

        if (currentLineIndex !== -1)
            _emptyLines.splice(currentLineIndex, 1);

        this._currentLine = _emptyLines[Math.floor(Math.random() * _emptyLines.length)];

        console.log("NEW CURRENT LINE:", this._currentLine);
     //   debugger
    }

    /**
     * Создание препятствия
     * @param line линия, на которой препятствие создается
     */
    createEnemy(line, type) {
        const {
            field: {offset, lineSize: {height}},
            enemy: {size: {width: enemyWidth, depth: enemyDepth}}
        } = baseSettings;

        const {_currentFilledDistance, _fieldHeight} = this;

        const enemy = itemsFactory.getItem(type);
        enemy.create();

        const posX = _currentFilledDistance;
        const posZ = height / 2 + (height + offset) * line - _fieldHeight / 2;

        enemy.position.set(posX + enemyWidth / 2, enemyDepth / 2, posZ);

        return enemy;
    }

    /**
     * Проверка препятствий на "пройденность"
     * @param hero игрок (куб)
     */
    checkPassedEnemies(hero) {
        const storage = itemsFactory.getStorage("enemy");
        const activeEnemies = storage.createdItems.filter(item => !storage.items.includes(item));

        activeEnemies.forEach(enemy => {
            if (enemy.position.x < hero.position.x - 20) {
                itemsFactory.pushItem(enemy);
                enemy.reset();
            }
        })
    }

    /**
     * Проверка необходимости заполнения поля
     * @param scene сцена
     * @param hero игрок (куб)
     * @param camera камера
     */
    fieldCheckAndFill(scene, hero, camera) {
        const {visibilityInMetres} = baseSettings;
        const {_currentFilledDistance} = this;
        const {maxHeight} = enemies;

        let distance = hero.position.x;

        if (distance + visibilityInMetres >= _currentFilledDistance + maxHeight) {
            this.createPathPart();
            this.setEnemiesOnField(scene);
            this.fieldCheckAndFill(scene, hero, camera);
        }
    }

    setEnemiesOnField(scene) {
        // Проверить, можем ли поставить препятствие (идти с самого крупного)
        //   пройтись по всем вариациям постановки препятствия в ряду:
        //    - если матрица препятствия не пересекается с путем, считаем вероятность установки)
        //    - если пересекается, рассматриваем след вариант постановки препятствия
        //    - если вариантов нет, переходим к след препятствию

        // Для каждого препятствия заглядывать на n-1 шагов назад, где n - высота препятствия

        // 1. Получить текущий номер ряда R
        // 2. Вычесть n-1, начать поиск подстановки с него (с R-2)
        // 3. Пройтись по рядам и от R-2 до R+2

        const {_currentFilledDistance, _probability} = this;
        const {maxHeight} = enemies;

        const rowNumber = Number(_currentFilledDistance / baseSettings.step);

        const startRow = rowNumber > 1 ? rowNumber - maxHeight + 1 : 0;
        const endRow = rowNumber + maxHeight - 1;

        for (let row = startRow; row <= endRow; row++)
            for (let column = 0; column < this._linesCount; column++) {
                const currentRowInMatrix = this._cellsMatrix.find(({rowNumber}) => rowNumber === row);

                if (currentRowInMatrix.rowArray[column] !== PathController.EMPTY_CELL)
                    continue;

                if (checkProbability(_probability)) {
                    PathController.ENEMIES_TYPES.map(enemy => {
                        if (enemy.dims.columns + column > this._linesCount) return;

                        if (this.canSetEnemy(row, column, enemy)) {
                    //        console.log(enemy.type)
                            this.editCellsMatrix(row, column, enemy);
                            scene.add(this.createEnemy(column, enemy.type))
                        }
                    })
                }
            }

        this._currentFilledDistance += baseSettings.step;
    }

    editCellsMatrix(row, column, enemy) {
        const {_cellsMatrix} = this;
        const {dims: {rows: enemyMatrixRows, columns: enemyMatrixColumns}, matrix: enemyMatrix} = enemy;

        for (let i = 0; i < enemyMatrixRows; i++)
            for (let j = 0; j < enemyMatrixColumns; j++) {
                if (enemyMatrix[i][j] === PathController.PATH_CELL) {
                    const matrixRow = _cellsMatrix.find(({rowNumber}) => rowNumber === row + i);
                    if (matrixRow === undefined) {
                        console.log("РЯД НЕ НАЙДЕН");
                        return
                    }
                    matrixRow.rowArray[column + j] = PathController.ENEMY_CELL;
                }
            }
    }

    canSetEnemy(row, column, enemy) {
        const {_cellsMatrix} = this;
        const {dims: {rows: enemyMatrixRows, columns: enemyMatrixColumns}, matrix: enemyMatrix} = enemy;

        console.log("!")

        const checkedRows = _cellsMatrix.filter(
            ({rowNumber}) => rowNumber >= row && rowNumber < row + enemyMatrixRows
        );

        console.log("!!")

        const slicedRowsMatrix = checkedRows.map(({rowArray}) => rowArray.slice(column, column + enemyMatrixColumns));

        console.log("!!!")

        return !(this.checkMatricesIntersects(enemyMatrix, slicedRowsMatrix))
    }

    checkMatricesIntersects(enemyMatrix, slicedRowsMatrix) {
        console.log(enemyMatrix);
        console.log(slicedRowsMatrix);

        //TODO: приходят неверные данные в матрицах (slicedRows) на 1 ряд меньше чем надо

        for (let i = 0; i < enemyMatrix.length; i++)
            for (let j = 0; j < enemyMatrix[i].length; j++)
                if (enemyMatrix[i][j] === PathController.PATH_CELL &&
                    slicedRowsMatrix[i][j] !== PathController.EMPTY_CELL)
                    return true;

        return false;
    }

    /**
     * Обновление игровых значений
     * @param scene сцена
     * @param hero игрок (куб)
     * @param camera камера
     * @param started проверка, начата ли игра
     */
    updateValues(scene, hero, camera, started) {
        if (started)
            this.updateOnTick(hero, camera);

        this.fieldCheckAndFill(scene, hero, camera);
        this.checkPassedEnemies(hero);
    }

    createPathPart() {
        const {maxHeight: steps} = enemies;
        const {_emptyLines, _maxCounter} = this;
        const {blocksInLine} = baseSettings;

     //   console.log("CREATE PATH PART");

        for (let row = 0; row < steps; row++) {
            if (this._stepsCounter <= 0)
                _emptyLines.push(this.chooseNewEmptyLine());

            this.createNewRow(steps, row);

            if (this._emptyLines.length > 1) {
                this.chooseNextCurrentLine();

                this._stepsCounter = Math.ceil(this._maxCounter);

                if (_maxCounter <= blocksInLine.min)
                    this._stepsCounter = blocksInLine.min;
            } else
                this._stepsCounter -= 1;
        }

/*        console.log("AFTER CREATING PATH PART:");
        console.log("cells matrix:", this._cellsMatrix);
        console.log("steps counter", this._stepsCounter)
        debugger*/
    }

    createNewRow(steps, row) {
        const {_currentFilledDistance, _linesCount, _emptyLines} = this;

        const rowNumber = Number(_currentFilledDistance / baseSettings.step) * steps + row;
        const rowArray = new Array(_linesCount).fill(PathController.EMPTY_CELL);

        for (let column = 0; column < _linesCount; column++) {
            //  const cell = new Cell(rowNumber, column);

            if (_emptyLines.includes(column))
                rowArray[column] = PathController.PATH_CELL;
        }

        this._cellsMatrix.push({
            rowNumber,
            rowArray
        });
    }

    /**
     * Обновление игровых значений на каждый тик
     * @param hero герой
     * @param camera камера
     */
    updateOnTick(hero, camera) {
        const {speed, probability, blocksInLine} = baseSettings;

        if (this._probability < probability.max)
            this._probability += getDeltas().probability;

        if (this._speed < speed.max)
            this._speed += getDeltas().speed;

        if (this._maxCounter > blocksInLine.min)
            this._maxCounter -= getDeltas().blocksCounter;

        hero.position.x += this._speed;
        camera.position.x += this._speed;
    }
}
