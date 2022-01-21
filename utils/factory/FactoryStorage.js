export default class FactoryStorage {
  items = [];
  createdItems = [];

  constructor({type = "unknown"} = {}) {
    this.type = type;
  }

  pop() {
    if (!this.items.length)
      return null;
    return this.items.splice(this.items.length - 1, 1)[0];
  }

  resetItems() {
    const {items, createdItems} = this;
    createdItems.forEach(item => {
      if (items.indexOf(item) !== -1) return;
      this.push(item);
    });
  }

  onCreateItem(type, item) {
    item._storageType = type;

    if (this.createdItems.indexOf(item) === -1)
      this.createdItems.push(item);
  }

  push(item = {}) {
    const {items} = this;

/*    console.log(this.items);
    console.log(this.createdItems);
    debugger*/

    if (items.indexOf(item) !== -1) {
      console.log("Item already added:", item);
      return this;
    }

    if (typeof item.reset === "function")
      item.reset();
    items.push(item);
  }
}
