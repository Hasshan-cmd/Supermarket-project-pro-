import {Component, OnInit, ViewChild} from '@angular/core';
import {Purchase} from '../../../../entities/purchase';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {PurchaseService} from '../../../../services/purchase.service';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {ResourceLink} from '../../../../shared/resource-link';
import {Supplier} from '../../../../entities/supplier';
import {SupplierService} from '../../../../services/supplier.service';
import {PageRequest} from '../../../../shared/page-request';
import {DateHelper} from '../../../../shared/date-helper';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {PurchaseitemUpdateSubFormComponent} from './purchaseitem-update-sub-form/purchaseitem-update-sub-form.component';

@Component({
  selector: 'app-purchase-update-form',
  templateUrl: './purchase-update-form.component.html',
  styleUrls: ['./purchase-update-form.component.scss']
})
export class PurchaseUpdateFormComponent extends AbstractComponent implements OnInit {

  @ViewChild(PurchaseitemUpdateSubFormComponent) purchaseitemUpdateSubForm: PurchaseitemUpdateSubFormComponent;

  selectedId: number;
  purchase: Purchase;

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

  get isLate(): boolean {
    if (this.purchase === null){return true; }
    const now: Date = new Date();
    const creationTimeAsString: string = this.purchase.tocreation;
    const lastTimeTimestamp: number = Date.parse(creationTimeAsString) + (60 * 60 * 1000);
    const lastTime = new Date(lastTimeTimestamp);

    return now > lastTime;
  }

  constructor(
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar,
    private router: Router,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( async (params) => {
      this.selectedId =  + params.get('id');
      await this.loadData();
      this.refreshData();
    });
  }

  async loadData(): Promise<any>{

    this.updatePrivileges();
    if (!this.privilege.update) { return; }

    this.supplierService.getAllBasic(new PageRequest()).then((supplierDataPage) => {
      this.suppliers = supplierDataPage.content.filter((supplier) => {
        return supplier.supplierstatus.id === 1;
      });
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });

    this.purchase = await this.purchaseService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_PURCHASE);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_PURCHASES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_PURCHASE_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_PURCHASE);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_PURCHASE);
  }

  discardChanges(): void{
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void{
    if (this.descriptionField.pristine) { this.descriptionField.setValue(this.purchase.description); }
    if (this.dateField.pristine) { this.dateField.setValue(this.purchase.date); }
    if (this.supplierField.pristine) { this.supplierField.setValue(this.purchase.supplier.id); }
    if (this.purchaseitemField.pristine) { this.purchaseitemField.patchValue(this.purchase.purchaseitemList); }
  }

  async submit(): Promise<void> {

    this.purchaseitemUpdateSubForm.resetForm();
    this.purchaseitemField.markAsDirty();

    if (this.form.invalid) { return; }

    const newpurchase: Purchase = new Purchase();
    newpurchase.description = this.descriptionField.value;
    newpurchase.date = DateHelper.getDateAsString(this.dateField.value);
    newpurchase.supplier = this.supplierField.value;
    newpurchase.purchaseitemList = this.purchaseitemField.value;
    try{
      const resourceLink: ResourceLink = await this.purchaseService.update(this.selectedId, newpurchase);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/purchases/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/purchases');
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
