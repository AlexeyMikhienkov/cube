export default class Cell {
    _row;

    _column;

    _isEmpty = true;

    _enemy = null;

    constructor(row, column) {
        this._row = row;
        this._column = column;

    }

}