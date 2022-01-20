import Factory from "../../../utils/factory/Factory";
import SmallEnemy from "./enemies/SmallEnemy";
import MediumEnemy from "./enemies/MediumEnemy";
import BigEnemy from "./enemies/BigEnemy";

class ItemsFactory extends Factory {
    constructor() {
        super();
    }

    createItem(type) {
        let item;

        switch(type) {
            case "small":
                item = new SmallEnemy();
                break;
            case "medium":
                item = new MediumEnemy();
                break;
            case "big":
                item = new BigEnemy();
                break;
        }

        this.onCreateItem(type, item);

        return item;
    }

}

export const itemsFactory = new ItemsFactory();