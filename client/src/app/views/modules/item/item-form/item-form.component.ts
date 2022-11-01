import { Component, OnInit } from '@angular/core';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ItemService} from '../../../../services/item.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {Item} from '../../../../entities/item';
import {ResourceLink} from '../../../../shared/resource-link';
import {Category} from '../../../../entities/category';
import {CategoryService} from '../../../../services/category.service';
import {Supplier} from '../../../../entities/supplier';
import {SupplierService} from '../../../../services/supplier.service';
import {PageRequest} from '../../../../shared/page-request';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent extends AbstractComponent implements OnInit {

  categories: Category[] = [];
  suppliers: Supplier[] = [];

  get descriptionField(): FormControl {
    return this.form.controls.description as FormControl;
  }

  get nameField(): FormControl {
    return this.form.controls.name as FormControl;
  }

  get photoField(): FormControl {
    return this.form.controls.photo as FormControl;
  }

  get qtyField(): FormControl {
    return this.form.controls.qty as FormControl;
  }

  get ropField(): FormControl {
    return this.form.controls.rop as FormControl;
  }

  get priceField(): FormControl {
    return this.form.controls.price as FormControl;
  }

  get categoryField(): FormControl {
    return this.form.controls.category as FormControl;
  }

  get suppliersField(): FormControl {
    return this.form.controls.suppliers as FormControl;
  }

  constructor(
    private itemService: ItemService,
    private snackBar: MatSnackBar,
    private router: Router,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
  ) {
    super();
  }

  form = new FormGroup({
    description: new FormControl(null, [
      Validators.maxLength(65536),
    ]),
    name: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255),
    ]),
    photo: new FormControl(),
    qty: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(99999999),
      Validators.pattern('^([0-9]+)$')
    ]),
    rop: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(99999999.99),
      Validators.pattern('^([0-9]+)$')
    ]),
    price: new FormControl(null, [
      Validators.required,
      Validators.min(0.25),
      Validators.max(99999999),
      Validators.pattern('^([0-9]{1,8}([\.][0-9]{2})?)$')
    ]),
    category: new FormControl(null, [
      Validators.required,
    ]),
    suppliers: new FormControl(),
  });

  getSupplierName = (supplier: Supplier) => {
    return supplier.code + '-' + supplier.name;
  }

  ngOnInit(): void {
    this.loadData();
    this.refreshData();

    this.supplierService.getAllBasic(new PageRequest()).then((suppliers) => {
      this.suppliers = suppliers.content.filter((supplier) => {
        return supplier.supplierstatus.id === 1;
      });
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
  }

  async loadData(): Promise<any>{

    this.updatePrivileges();
    if (!this.privilege.add) { return; }

    this.categoryService.getAll().then((categories) => {
      this.categories = categories;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });

  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_ITEM);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_ITEMS);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_ITEM_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_ITEM);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_ITEM);
  }

  async submit(): Promise<void> {

    this.photoField.updateValueAndValidity();
    this.photoField.markAsTouched();
    if (this.form.invalid) { return; }

    const item: Item = new Item();
    item.description = this.descriptionField.value;
    item.name = this.nameField.value;
    const photoIds = this.photoField.value;
    if (photoIds !== null && photoIds !== []){
      item.photo = photoIds[0];
    }else{
      item.photo = null;
    }
    item.qty = this.qtyField.value;
    item.rop = this.ropField.value;
    item.price = this.priceField.value;
    item.category = this.categoryField.value;
    item.supplierList = this.suppliersField.value;
    try{
      const resourceLink: ResourceLink = await this.itemService.add(item);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/items/' + resourceLink.id);
      } else {
        this.form.reset();
        this.snackBar.open('Successfully saved', null, {duration: 2000});
      }
    }catch (e) {
      switch (e.status) {
        case 401: break;
        case 403: this.snackBar.open(e.error.message, null, {duration: 2000}); break;
        case 400:
          const msg = JSON.parse(e.error.message);
          let knownError = false;
          if (msg.description) { this.descriptionField.setErrors({server: msg.description}); knownError = true; }
          if (msg.name) { this.nameField.setErrors({server: msg.name}); knownError = true; }
          if (msg.qty) { this.qtyField.setErrors({server: msg.qty}); knownError = true; }
          if (msg.rop) { this.ropField.setErrors({server: msg.rop}); knownError = true; }
          if (msg.price) { this.priceField.setErrors({server: msg.price}); knownError = true; }
          if (msg.category) { this.categoryField.setErrors({server: msg.category}); knownError = true; }
          if (msg.suppliers) { this.suppliersField.setErrors({server: msg.suppliers}); knownError = true; }
          if (!knownError) {
            this.snackBar.open('Validation Error', null, {duration: 2000});
          }
          break;
        default:
          this.snackBar.open('Something is wrong', null, {duration: 2000});
      }
    }

  }
}
