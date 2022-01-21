import {itemsFactory} from "./ItemsFactory";

export default class Row {
    _id = null;

    _cells = [];

    init(number, cells) {
        this._id = number;
        this._cells = cells;
    }

    getCell(index) {
        return this._cells[index];
    }

    reset() {
        this._cells.forEach(cell => {
            itemsFactory.pushItem(cell);
        });

        this._cells.length = 0;
        this._id = null;
    }

}