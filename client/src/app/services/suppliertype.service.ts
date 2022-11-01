import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';
import {Suppliertype} from '../entities/suppliertype';

@Injectable({
  providedIn: 'root'
})
export class SuppliertypeService {

  constructor(private http: HttpClient) { }

  async getAll(): Promise<Suppliertype[]>{
    const suppliertypes = await this.http.get<Suppliertype[]>(ApiManager.getURL('suppliertypes')).toPromise();
    return suppliertypes.map((suppliertype) => Object.assign(new Suppliertype(), suppliertype));
  }

}
