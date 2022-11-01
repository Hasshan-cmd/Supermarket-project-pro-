import {Injectable} from '@angular/core';
import {Gender} from '../entities/gender';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  async getRecentCustomerCount(): Promise<number>{
    const data = await this.http.get<any>(ApiManager.getURL('/dashboard/recent-customer-count')).toPromise();
    return data.count;
  }

  async getRecentPurchaseCount(): Promise<number>{
    const data = await this.http.get<any>(ApiManager.getURL('/dashboard/recent-purchase-count')).toPromise();
    return data.count;
  }

  async getRecentItemCount(): Promise<number>{
    const data = await this.http.get<any>(ApiManager.getURL('/dashboard/recent-item-count')).toPromise();
    return data.count;
  }

  async getRecentSaleCount(): Promise<number>{
    const data = await this.http.get<any>(ApiManager.getURL('/dashboard/recent-sale-count')).toPromise();
    return data.count;
  }

}
