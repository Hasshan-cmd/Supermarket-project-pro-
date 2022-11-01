
import {User} from './user';
import {DataPage} from '../shared/data-page';
import {Suppliertype} from './suppliertype';
import {Supplierstatus} from './supplierstatus';
import {Category} from './category';
import {Itemstatus} from './itemstatus';
import {Supplier} from './supplier';

export class Item{
  id: number;
  code: string;
  tocreation: string;
  description: string;
  creator: User;
  name: string;
  photo: string;
  qty: number;
  rop: number;
  price: number;
  category: Category;
  itemstatus: Itemstatus;

  supplierList: Supplier[];

  constructor(id: number = null) {
    this.id = id;
  }
}

export class ItemDataPage extends DataPage{
  content: Item[];
}
