import {itemsFactory} from "./ItemsFactory";

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
        if (this._enemy) {
            const storage = itemsFactory.getStorage(this._enemySettings.type);
            const usedEnemies = storage.createdItems.filter(item => !storage.items.includes(item));

            if (usedEnemies.includes(this._enemy))
                itemsFactory.pushItem(this._enemy);

            this._enemy = null;
        }

        this._row = null;
        this._column = null;
        this._isEmpty = true;
        this._enemySettings = null;
    }

}