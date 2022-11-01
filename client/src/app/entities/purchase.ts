
import {User} from './user';
import {DataPage} from '../shared/data-page';
import {Suppliertype} from './suppliertype';
import {Supplierstatus} from './supplierstatus';
import {Category} from './category';
import {Itemstatus} from './itemstatus';
import {Customer} from './customer';
import {Purchaseitem} from './purchaseitem';
import {Supplier} from './supplier';

export class Purchase{
  id: number;
  code: string;
  tocreation: string;
  description: string;
  creator: User;
  supplier: Supplier;
  date: string;
  total: number;

  purchaseitemList: Purchaseitem[];

  constructor(id: number = null) {
    this.id = id;
  }
}

export class PurchaseDataPage extends DataPage{
  content: Purchase[];
}
