
import {User} from './user';
import {DataPage} from '../shared/data-page';
import {Suppliertype} from './suppliertype';
import {Supplierstatus} from './supplierstatus';

export class Supplier{
  id: number;
  code: string;
  tocreation: string;
  description: string;
  name: string;
  logo: string;
  contact1: string;
  contact2: string;
  address: string;
  email: string;
  fax: string;
  creator: User;
  suppliertype: Suppliertype;
  supplierstatus: Supplierstatus;


  constructor(id: number = null) {
    this.id = id;
  }
}

export class SupplierDataPage extends DataPage{
  content: Supplier[];
}
