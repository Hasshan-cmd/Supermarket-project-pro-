import {User} from './user';
import {Gender} from './gender';
import {Nametitle} from './nametitle';
import {Civilstatus} from './civilstatus';
import {Designation} from './designation';
import {DataPage} from '../shared/data-page';
import {Employeestatus} from './employeestatus';

export class Employee {
  id: number;
  code: string;
  nametitle: Nametitle;
  callingname: string;
  civilstatus: Civilstatus;
  fullname: string;
  photo: string;
  dobirth: string;
  gender: Gender;
  nic: string;
  mobile: string;
  land: string;
  email: string;
  address: string;
  designation: Designation;
  dorecruit: string;
  employeestatus: Employeestatus;
  description: string;
  creator: User;
  tocreation: string;
}

export class EmployeeDataPage extends DataPage{
    content: Employee[];
}
