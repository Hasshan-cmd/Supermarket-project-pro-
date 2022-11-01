import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiManager} from '../shared/api-manager';
import {Category} from '../entities/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  async getAll(): Promise<Category[]>{
    const categories = await this.http.get<Category[]>(ApiManager.getURL('categories')).toPromise();
    return categories.map((category) => Object.assign(new Category(), category));
  }

}
