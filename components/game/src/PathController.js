import {baseSettings, enemies, getDeltas, sortEnemiesDimensionsDesc} from "./settings";
import checkProbability from "../../../utils/number/probability";
import {itemsFactory} from "./ItemsFactory";
import {randomIntFromRange} from "../../../utils/number/randomIntFromRange";

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
     * Ширина поля с учетом всех линий и отступов между ними
     */
    _fieldHeight;

    /**
     * Массив пустых линий
     * @type {Array}
     * @private
     */
    _emptyLines = [];

    _rows = [];

    static ENEMIES_TYPES = sortEnemiesDimensionsDesc();
    static EMPTY_CELL = 0;
    static PATH_CELL = 1;
    static ENEMY_CELL = 2;
    static TYPES = {
        cell: "cell",
        row: "row"
    };

    /**
     * Конструктор класса
     */
    constructor() {
        const {offset, lineSize: {height}} = baseSettings.field;

        const {linesCount} = baseSettings;

        this._fieldHeight = linesCount * height + (linesCount - 1) * offset;

        this._currentLine = randomIntFromRange(0, linesCount - 1);
        this._emptyLines.push(this._currentLine);
    }

    /**
     * Выбор доступной линии для смены линий
     * @returns {number|*}
     */
    chooseNewEmptyLine() {
        const {_currentLine} = this;
        const {linesCount} = baseSettings;

        switch (_currentLine) {
            case 0:
                return 1;
            case linesCount - 1:
                return linesCount - 2;
            default:
                const variants = [_currentLine - 1, _currentLine + 1];
                return variants[Math.round(Math.random())];
        }
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
    }

    /**
     * Создание препятствия
     * @param row
     * @param column линия, на которой препятствие создается
     * @param type
     */
    createEnemy(row, column, settings) {
        const {
            field: {offset, lineSize: {height}},
            enemy: {size: {width: enemyWidth, depth: enemyDepth}},
            step
        } = baseSettings;

        const {type} = settings;

        const enemy = itemsFactory.getItem(type);
        enemy.create(settings);

        const posX = row * step;
        const posZ = height / 2 + (height + offset) * column - this._fieldHeight / 2;

        enemy.position.set(posX + enemyWidth / 2, enemyDepth / 2, posZ);

        return enemy;
    }

    /**
     * Проверка препятствий на "пройденность"
     * @param hero игрок (куб)
     */
    checkPassedEnemies(hero) {
        const currentRow = Math.floor(hero.position.x / baseSettings.step);
        const deletingRows = this._rows.filter(({_id}) => _id < currentRow - 10);

        deletingRows.forEach(row => {
            const deleteIndex = this._rows.indexOf(row);
            this._rows.splice(deleteIndex, 1);

            itemsFactory.pushItem(row);
        });
    }

    /**
     * Проверка необходимости заполнения поля
     * @param scene сцена`
     * @param hero игрок (куб)
     */
    fieldCheckAndFill(scene, hero) {
        const {visibilityInMetres, step} = baseSettings;
        const {maxHeight} = enemies;

        let distance = hero.position.x;
        let currentRow = 0;

        const lastRow = this._rows[this._rows.length - 1];

        if (lastRow)
            currentRow = lastRow._id;

        if (distance + visibilityInMetres >= currentRow * step + maxHeight) {
            this.createPathPart();
            this.setEnemiesOnField(scene);
            this.fieldCheckAndFill(scene, hero);
        }
    }

    setEnemiesOnField(scene) {
        const {maxHeight} = enemies;
        const {linesCount} = baseSettings;

        let lastRowId = 0;

        const lastRow = this._rows[this._rows.length - 1];

        if (lastRow)
            lastRowId = lastRow._id;

        const rowNumber = lastRowId - maxHeight + 1;

        const startRow = rowNumber > 1 ? rowNumber - maxHeight + 1 : 0;
        const endRow = rowNumber + maxHeight - 1;

        if (startRow < baseSettings.startOffset)
            return;

        for (let row = startRow; row <= endRow; row++)
            for (let column = 0; column < linesCount; column++) {
                if (!this.getCell(row, column)._isEmpty)
                    continue;

                if (checkProbability(this._probability)) {
                    PathController.ENEMIES_TYPES.forEach(enemySettings => {
                        const {dims, matrix} = enemySettings;

                        if (dims.columns + column > linesCount ||
                            dims.rows + row - 1 > endRow) return;

                        if (!this.checkMatricesIntersects(row, column, matrix)) {
                            const enemy = this.createEnemy(row, column, enemySettings);
                            this.editCellsMatrix(row, column, enemy, enemySettings);
                            scene.add(enemy);
                        }
                    })
                }
            }
    }

    checkMatricesIntersects(rowNumber, columnNumber, enemyMatrix) {
        for (let row = 0; row < enemyMatrix.length; row++)
            for (let column = 0; column < enemyMatrix[row].length; column++) {
                const invertedRow = enemyMatrix.length - 1 - row;

                if (enemyMatrix[row][column] === PathController.PATH_CELL &&
                    !this.getCell(rowNumber + invertedRow, columnNumber + column)._isEmpty)
                    return true;
            }

        return false;
    }

    getCell(row, column) {
        const storage = itemsFactory.getStorage(PathController.TYPES.cell);
        return storage.createdItems.find(cell => cell._row === row && cell._column === column);
    }

    editCellsMatrix(rowNumber, columnNumber, enemy, enemySettings) {
        const {dims: {rows: enemyMatrixRows, columns: enemyMatrixColumns}, matrix: enemyMatrix} = enemySettings;

        for (let row = 0; row < enemyMatrixRows; row++)
            for (let column = 0; column < enemyMatrixColumns; column++) {
                if (enemyMatrix[row][column] === PathController.PATH_CELL) {
                    const invertedRow = enemyMatrix.length - 1 - row;
                    const cell = this.getCell(rowNumber + invertedRow, columnNumber + column);

                    if (cell) {
                        cell._enemy = enemy;
                        cell._enemySettings = enemySettings;
                        cell._isEmpty = false;
                    }
                }
            }
    }

    /**
     * Обновление игровых значений
     * @param scene сцена
     * @param hero игрок (куб)
     * @param camera камера
     * @param started проверка, начата ли игра
     */
    updateValues(scene, hero, camera, lines, started) {
        if (started)
            this.updateOnTick(hero, camera, lines);

        this.fieldCheckAndFill(scene, hero, camera);
        this.checkPassedEnemies(hero);
    }

    createPathPart() {
        const {maxHeight: steps} = enemies;
        const {_maxCounter} = this;
        const {blocksInLine} = baseSettings;

        for (let row = 0; row < steps; row++) {
            if (this._stepsCounter <= 0)
                this._emptyLines.push(this.chooseNewEmptyLine());

            this.createNewRow();

            if (this._emptyLines.length > 1) {
                this.chooseNextCurrentLine();

                this._stepsCounter = Math.ceil(this._maxCounter);

                if (_maxCounter <= blocksInLine.min)
                    this._stepsCounter = blocksInLine.min;
            } else
                this._stepsCounter--;
        }
    }

    createNewRow() {
        const {_emptyLines} = this;
        const {linesCount} = baseSettings;

        const cells = [];

        const maxRowId =  this._rows.length ? Math.max(...this._rows.map(row => row._id)) : -1;

        for (let column = 0; column < linesCount; column++) {
            const cell = itemsFactory.getItem(PathController.TYPES.cell);
            cell.init(maxRowId + 1, column);

            if (_emptyLines.includes(column))
                cell._isEmpty = false;

            cells.push(cell);
        }

        const newRow = itemsFactory.getItem(PathController.TYPES.row);
        newRow.init(maxRowId + 1, cells);

        this._rows.push(newRow);
    }

    /**
     * Обновление игровых значений на каждый тик
     * @param hero герой
     * @param camera камера
     * @param lines дорожки для движения
     */
    updateOnTick(hero, camera, lines) {
        const {speed, probability, blocksInLine, backOffset} = baseSettings;

        if (this._probability < probability.max)
            this._probability += getDeltas().probability;

        if (this._speed < speed.max)
            this._speed += getDeltas().speed;

        if (this._maxCounter > blocksInLine.min)
            this._maxCounter -= getDeltas().blocksCounter;

        hero.position.x += this._speed;
        camera.position.x += this._speed;

        if (hero.position.x > backOffset)
            lines.forEach(line => line.position.x += this._speed);
    }
}
