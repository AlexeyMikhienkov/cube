export default class Cell {
    _row;

    _column;

    _isEmpty = true;

    _enemy = null;

    _enemySettings = null;

    init(row, column) {
        this._row = row;
        this._column = column;
    }

    reset() {
        this._row = null;
        this._column = null;
        this._isEmpty = true;
    }

}