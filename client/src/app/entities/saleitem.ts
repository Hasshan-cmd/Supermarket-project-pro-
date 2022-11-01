import {Sale} from './sale';
import {Item} from './item';

export class Saleitem {
  id: number;
  sale: Sale;
  item: Item;
  qty: number;
  unitprice: number;


  constructor(id: number = null) {
    this.id = id;
  }
}
