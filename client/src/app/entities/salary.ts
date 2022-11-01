
import {User} from './user';
import {DataPage} from '../shared/data-page';
import {Category} from './category';
import {Itemstatus} from './itemstatus';
import {Employee} from './employee';

export class Salary{
  id: number;
  code: string;
  tocreation: string;
  description: string;
  creator: User;
  employee: Employee;
  date: string;
  amount: number;

  constructor(id: number = null) {
    this.id = id;
  }
}

export class SalaryDataPage extends DataPage{
  content: Salary[];
}
