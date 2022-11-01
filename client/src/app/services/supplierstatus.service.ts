import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';
import {Supplierstatus} from '../entities/supplierstatus';

@Injectable({
  providedIn: 'root'
})
export class SupplierstatusService {

  constructor(private http: HttpClient) { }

  async getAll(): Promise<Supplierstatus[]>{
    const supplierstatuses = await this.http.get<Supplierstatus[]>(ApiManager.getURL('supplierstatuses')).toPromise();
    return supplierstatuses.map((supplierstatus) => Object.assign(new Supplierstatus(), supplierstatus));
  }

}
