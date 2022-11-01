import { Component, OnInit } from '@angular/core';
import {Item} from '../../../../entities/item';
import {Category} from '../../../../entities/category';
import {Itemstatus} from '../../../../entities/itemstatus';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {CategoryService} from '../../../../services/category.service';
import {ItemstatusService} from '../../../../services/itemstatus.service';
import {ItemService} from '../../../../services/item.service';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {ResourceLink} from '../../../../shared/resource-link';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {Supplier} from '../../../../entities/supplier';
import {SupplierService} from '../../../../services/supplier.service';
import {PageRequest} from '../../../../shared/page-request';

@Component({
  selector: 'app-item-update-form',
  templateUrl: './item-update-form.component.html',
  styleUrls: ['./item-update-form.component.scss']
})
export class ItemUpdateFormComponent extends AbstractComponent implements OnInit {

  selectedId: number;
  item: Item;

  categories: Category[] = [];
  suppliers: Supplier[] = [];
  itemstatuses: Itemstatus[] = [];

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

  get itemstatusField(): FormControl {
    return this.form.controls.itemstatus as FormControl;
  }

  get suppliersField(): FormControl {
    return this.form.controls.suppliers as FormControl;
  }

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private categoryservice: CategoryService,
    private itemstatusService: ItemstatusService,
    private itemService: ItemService,
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
    itemstatus: new FormControl(null, [
      Validators.required,
    ]),
    suppliers: new FormControl(),
  });

  getSupplierName = (supplier: Supplier) => {
    return supplier.code + '-' + supplier.name;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( async (params) => {
      this.selectedId =  + params.get('id');
      await this.loadData();
      this.refreshData();

      this.supplierService.getAllBasic(new PageRequest()).then((suppliers) => {
        this.suppliers = suppliers.content.filter((supplier) => {

          if (this.item){
            for (const su of this.item.supplierList) {
              if (su.id === supplier.id){
                return true;
              }
            }
          }

          return supplier.supplierstatus.id === 1;
        });
      }).catch((e) => {
        console.log(e);
        this.snackBar.open('Something is wrong', null, {duration: 2000});
      });
    });
  }

  async loadData(): Promise<any>{

    this.updatePrivileges();
    if (!this.privilege.update) { return; }

    this.categoryservice.getAll().then((categories) => {
      this.categories = categories;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });

    this.itemstatusService.getAll().then((itemstatueses) => {
      this.itemstatuses = itemstatueses;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
    this.item = await this.itemService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_ITEM);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_ITEMS);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_ITEM_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_ITEM);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_ITEM);
  }

  discardChanges(): void{
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void{
    if (this.descriptionField.pristine) { this.descriptionField.setValue(this.item.description); }
    if (this.nameField.pristine) { this.nameField.setValue(this.item.name); }
    if (this.qtyField.pristine) { this.qtyField.setValue(this.item.qty); }
    if (this.ropField.pristine) { this.ropField.setValue(this.item.rop); }
    if (this.priceField.pristine) { this.priceField.setValue(this.item.price); }
    if (this.categoryField.pristine) { this.categoryField.setValue(this.item.category.id); }
    if (this.itemstatusField.pristine) { this.itemstatusField.setValue(this.item.itemstatus.id); }
    if (this.suppliersField.pristine) { this.suppliersField.setValue(this.item.supplierList); }
    if (this.photoField.pristine) {
      if (this.item.photo) { this.photoField.setValue([this.item.photo]); }
      else { this.photoField.setValue([]); }
    }
  }

  async submit(): Promise<void> {
    this.photoField.updateValueAndValidity();
    this.photoField.markAsTouched();
    if (this.form.invalid) { return; }

    const newitem: Item = new Item();
    newitem.description = this.descriptionField.value;
    newitem.name = this.nameField.value;
    const photoIds = this.photoField.value;
    if (photoIds !== null && photoIds !== []){
      newitem.photo = photoIds[0];
    }else{
      newitem.photo = null;
    }
    newitem.qty = this.qtyField.value;
    newitem.rop = this.ropField.value;
    newitem.price = this.priceField.value;
    newitem.category = this.categoryField.value;
    newitem.itemstatus = this.itemstatusField.value;
    newitem.supplierList = this.suppliersField.value;
    try{
      const resourceLink: ResourceLink = await this.itemService.update(this.selectedId, newitem);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/items/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/items');
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
          if (msg.itemstatus) { this.itemstatusField.setErrors({server: msg.itemstatus}); knownError = true; }
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
