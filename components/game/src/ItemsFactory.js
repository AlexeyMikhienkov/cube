import Factory from "../../../utils/factory/Factory";
import Enemy from "./Enemy";

class ItemsFactory extends Factory {
    constructor() {
        super();
    }

    createItem(type) {
        let item;

        if (type === "enemy") {
            item = new Enemy();
        }

        this.onCreateItem(type, item);

        return item;
    }

}

export const itemsFactory = new ItemsFactory();