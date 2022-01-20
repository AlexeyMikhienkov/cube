export default class Row {
    _id;

    _cells = [];

    constructor() {

    }

    init(number, cells) {
        this._id = number;
        this._cells = cells;
    }

    getCell(index) {
        return this._cells[index];
    }

    reset() {
        this._cells.forEach(cell => cell.reset());
        this._cells.length = 0;
    }

}