import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';
import {PageRequest} from '../shared/page-request';
import {ResourceLink} from '../shared/resource-link';
import {Salary, SalaryDataPage} from '../entities/salary';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  constructor(private http: HttpClient) { }

  async getAll(pageRequest: PageRequest): Promise<SalaryDataPage>{
    const url = pageRequest.getPageRequestURL('salaries');
    const salaryDataPage = await this.http.get<SalaryDataPage>(ApiManager.getURL(url)).toPromise();
    salaryDataPage.content = salaryDataPage.content.map((salary) => Object.assign(new Salary(), salary));
    return salaryDataPage;
  }

  async getAllBasic(pageRequest: PageRequest): Promise<SalaryDataPage>{
    const url = pageRequest.getPageRequestURL('salaries/basic');
    const salaryDataPage = await this.http.get<SalaryDataPage>(ApiManager.getURL(url)).toPromise();
    salaryDataPage.content = salaryDataPage.content.map((salary) => Object.assign(new Salary(), salary));
    return salaryDataPage;
  }

  async get(id: number): Promise<Salary>{
    const salary: Salary = await this.http.get<Salary>(ApiManager.getURL(`salaries/${id}`)).toPromise();
    return Object.assign(new Salary(), salary);
  }

  async delete(id: number): Promise<void>{
    return this.http.delete<void>(ApiManager.getURL(`salaries/${id}`)).toPromise();
  }

  async add(salary: Salary): Promise<ResourceLink>{
    return this.http.post<ResourceLink>(ApiManager.getURL(`salaries`), salary).toPromise();
  }

  async update(id: number, salary: Salary): Promise<ResourceLink>{
    return this.http.put<ResourceLink>(ApiManager.getURL(`salaries/${id}`), salary).toPromise();
  }

}
