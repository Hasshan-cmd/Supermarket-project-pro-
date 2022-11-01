import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';
import {PageRequest} from '../shared/page-request';
import {ResourceLink} from '../shared/resource-link';
import {Customer, CustomerDataPage} from '../entities/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }

  async getAll(pageRequest: PageRequest): Promise<CustomerDataPage>{
    const url = pageRequest.getPageRequestURL('customers');
    const customerDataPage = await this.http.get<CustomerDataPage>(ApiManager.getURL(url)).toPromise();
    customerDataPage.content = customerDataPage.content.map((customer) => Object.assign(new Customer(), customer));
    return customerDataPage;
  }

  async getAllBasic(pageRequest: PageRequest): Promise<CustomerDataPage>{
    const url = pageRequest.getPageRequestURL('customers/basic');
    const customerDataPage = await this.http.get<CustomerDataPage>(ApiManager.getURL(url)).toPromise();
    customerDataPage.content = customerDataPage.content.map((customer) => Object.assign(new Customer(), customer));
    return customerDataPage;
  }

  async get(id: number): Promise<Customer>{
    const customer: Customer = await this.http.get<Customer>(ApiManager.getURL(`customers/${id}`)).toPromise();
    return Object.assign(new Customer(), customer);
  }

  async delete(id: number): Promise<void>{
    return this.http.delete<void>(ApiManager.getURL(`customers/${id}`)).toPromise();
  }

  async add(customer: Customer): Promise<ResourceLink>{
    return this.http.post<ResourceLink>(ApiManager.getURL(`customers`), customer).toPromise();
  }

  async update(id: number, customer: Customer): Promise<ResourceLink>{
    return this.http.put<ResourceLink>(ApiManager.getURL(`customers/${id}`), customer).toPromise();
  }

}
