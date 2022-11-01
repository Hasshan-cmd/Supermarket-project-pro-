import {Item} from './item';
import {Purchase} from './purchase';

export class Purchaseitem {
  id: number;
  purchase: Purchase;
  item: Item;
  qty: number;
  unitprice: number;


  constructor(id: number = null) {
    this.id = id;
  }
}
