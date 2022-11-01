import {User} from './user';
import {DataPage} from '../shared/data-page';

export class Customer{
  id: number;
  code: string;
  tocreation: string;
  description: string;
  name: string;
  contact1: string;
  contact2: string;
  address: string;
  email: string;
  fax: string;
  creator: User;

  constructor(id: number = null) {
    this.id = id;
  }
}

export class CustomerDataPage extends DataPage {
  content: Customer[];
}
