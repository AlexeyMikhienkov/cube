export default class Row {
    _id;

    _cells = [];

    constructor(number, cells) {
        this._id = number;
        this._cells = cells;
    }

    getCell(index) {
        return this._cells[index];
    }

}