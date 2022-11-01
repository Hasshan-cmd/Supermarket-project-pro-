import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PurchaseService} from '../../../../services/purchase.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {Purchase} from '../../../../entities/purchase';
import {ResourceLink} from '../../../../shared/resource-link';
import {Supplier} from '../../../../entities/supplier';
import {SupplierService} from '../../../../services/supplier.service';
import {PageRequest} from '../../../../shared/page-request';
import {DateHelper} from '../../../../shared/date-helper';
import {PurchaseitemSubFormComponent} from './purchaseitem-sub-form/purchaseitem-sub-form.component';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss']
})
export class PurchaseFormComponent extends AbstractComponent implements OnInit {

  @ViewChild(PurchaseitemSubFormComponent) purchaseitemSubForm: PurchaseitemSubFormComponent;

  suppliers: Supplier[] = [];

  form = new FormGroup({
    description: new FormControl(null, [
      Validators.maxLength(65536),
    ]),
    date: new FormControl(null, [
      Validators.required,
    ]),
    supplier: new FormControl(null, [
      Validators.required,
    ]),
    purchaseitem: new FormControl(),
  });

  get descriptionField(): FormControl {
    return this.form.controls.description as FormControl;
  }

  get dateField(): FormControl {
    return this.form.controls.date as FormControl;
  }

  get supplierField(): FormControl {
    return this.form.controls.supplier as FormControl;
  }

  get purchaseitemField(): FormControl {
    return this.form.controls.purchaseitem as FormControl;
  }

  get minDate(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  get maxDate(): Date {
    const today = new Date();
    return new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  }

  constructor(
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar,
    private router: Router,
    private supplierService: SupplierService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
    this.refreshData();
  }

  async loadData(): Promise<any>{

    this.updatePrivileges();
    if (!this.privilege.add) { return; }

    this.supplierService.getAllBasic(new PageRequest()).then((supplierDataPage) => {
      this.suppliers = supplierDataPage.content.filter((supplier) => {
        return supplier.supplierstatus.id === 1;
      });
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_PURCHASE);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_PURCHASES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_PURCHASE_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_PURCHASE);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_PURCHASE);
  }

  async submit(): Promise<void> {

    this.purchaseitemSubForm.resetForm();
    this.purchaseitemField.markAsDirty();

    if (this.form.invalid) { return; }

    const purchase: Purchase = new Purchase();
    purchase.description = this.descriptionField.value;
    purchase.date = DateHelper.getDateAsString(this.dateField.value);
    purchase.supplier = this.supplierField.value;
    purchase.purchaseitemList = this.purchaseitemField.value;

    try{
      const resourceLink: ResourceLink = await this.purchaseService.add(purchase);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/purchases/' + resourceLink.id);
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
          if (msg.date) { this.dateField.setErrors({server: msg.date}); knownError = true; }
          if (msg.supplier) { this.supplierField.setErrors({server: msg.supplier}); knownError = true; }
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
