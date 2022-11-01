import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';
import {PageRequest} from '../shared/page-request';
import {ResourceLink} from '../shared/resource-link';
import {Sale, SaleDataPage} from '../entities/sale';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private http: HttpClient) { }

  async getAll(pageRequest: PageRequest): Promise<SaleDataPage>{
    const url = pageRequest.getPageRequestURL('sales');
    const saleDataPage = await this.http.get<SaleDataPage>(ApiManager.getURL(url)).toPromise();
    saleDataPage.content = saleDataPage.content.map((sale) => Object.assign(new Sale(), sale));
    return saleDataPage;
  }

  async getAllBasic(pageRequest: PageRequest): Promise<SaleDataPage>{
    const url = pageRequest.getPageRequestURL('sales/basic');
    const saleDataPage = await this.http.get<SaleDataPage>(ApiManager.getURL(url)).toPromise();
    saleDataPage.content = saleDataPage.content.map((sale) => Object.assign(new Sale(), sale));
    return saleDataPage;
  }

  async get(id: number): Promise<Sale>{
    const sale: Sale = await this.http.get<Sale>(ApiManager.getURL(`sales/${id}`)).toPromise();
    return Object.assign(new Sale(), sale);
  }

  async delete(id: number): Promise<void>{
    return this.http.delete<void>(ApiManager.getURL(`sales/${id}`)).toPromise();
  }

  async add(sale: Sale): Promise<ResourceLink>{
    return this.http.post<ResourceLink>(ApiManager.getURL(`sales`), sale).toPromise();
  }

  async update(id: number, sale: Sale): Promise<ResourceLink>{
    return this.http.put<ResourceLink>(ApiManager.getURL(`sales/${id}`), sale).toPromise();
  }

}
