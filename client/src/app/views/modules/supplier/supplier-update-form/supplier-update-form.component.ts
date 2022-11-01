import { Component, OnInit } from '@angular/core';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {Supplier} from '../../../../entities/supplier';
import {Nametitle} from '../../../../entities/nametitle';
import {Civilstatus} from '../../../../entities/civilstatus';
import {Gender} from '../../../../entities/gender';
import {Designation} from '../../../../entities/designation';
import {Supplierstatus} from '../../../../entities/supplierstatus';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NametitleService} from '../../../../services/nametitle.service';
import {CivilstatusService} from '../../../../services/civilstatus.service';
import {GenderService} from '../../../../services/gender.service';
import {DesignationService} from '../../../../services/designation.service';
import {SupplierstatusService} from '../../../../services/supplierstatus.service';
import {SupplierService} from '../../../../services/supplier.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {DateHelper} from '../../../../shared/date-helper';
import {ResourceLink} from '../../../../shared/resource-link';
import {Suppliertype} from '../../../../entities/suppliertype';
import {SuppliertypeService} from '../../../../services/suppliertype.service';

@Component({
  selector: 'app-supplier-update-form',
  templateUrl: './supplier-update-form.component.html',
  styleUrls: ['./supplier-update-form.component.scss']
})
export class SupplierUpdateFormComponent extends AbstractComponent implements OnInit {

  selectedId: number;
  supplier: Supplier;

  suppliertypes: Suppliertype[] = [];
  supplierstatuses: Supplierstatus[] = [];

  form = new FormGroup({
    description: new FormControl(null, [
      Validators.maxLength(65536),
    ]),
    name: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255),
    ]),
    logo: new FormControl(),
    contact1: new FormControl(null, [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('^([0][0-9]{9})$'),
    ]),
    contact2: new FormControl(null, [
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('^([0][0-9]{9})$'),
    ]),
    address: new FormControl(null, [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(65535),
    ]),
    email: new FormControl(null, [
      Validators.minLength(5),
      Validators.maxLength(255),
      Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
    ]),
    fax: new FormControl(null, [
      Validators.minLength(5),
      Validators.maxLength(255),
      Validators.pattern('^([0][0-9]{9})$'),
    ]),
    suppliertype: new FormControl(null, [
      Validators.required,
    ]),
    supplierstatus: new FormControl(null, [
      Validators.required,
    ]),
  });

  get descriptionField(): FormControl {
    return this.form.controls.description as FormControl;
  }

  get nameField(): FormControl {
    return this.form.controls.name as FormControl;
  }

  get logoField(): FormControl {
    return this.form.controls.logo as FormControl;
  }

  get contact1Field(): FormControl {
    return this.form.controls.contact1 as FormControl;
  }

  get contact2Field(): FormControl {
    return this.form.controls.contact2 as FormControl;
  }

  get addressField(): FormControl {
    return this.form.controls.address as FormControl;
  }

  get emailField(): FormControl {
    return this.form.controls.email as FormControl;
  }

  get faxField(): FormControl {
    return this.form.controls.fax as FormControl;
  }

  get suppliertypeField(): FormControl {
    return this.form.controls.suppliertype as FormControl;
  }

  get supplierstatusField(): FormControl {
    return this.form.controls.supplierstatus as FormControl;
  }

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private suppliertypeService: SuppliertypeService,
    private supplierstatusService: SupplierstatusService,
    private supplierService: SupplierService,
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

    this.suppliertypeService.getAll().then((suppliertypes) => {
      this.suppliertypes = suppliertypes;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });

    this.supplierstatusService.getAll().then((supplierstatueses) => {
      this.supplierstatuses = supplierstatueses;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
    this.supplier = await this.supplierService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_SUPPLIER);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_SUPPLIERS);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_SUPPLIER_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_SUPPLIER);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_SUPPLIER);
  }

  discardChanges(): void{
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void{
    if (this.descriptionField.pristine) { this.descriptionField.setValue(this.supplier.description); }
    if (this.nameField.pristine) { this.nameField.setValue(this.supplier.name); }
    if (this.contact1Field.pristine) { this.contact1Field.setValue(this.supplier.contact1); }
    if (this.contact2Field.pristine) { this.contact2Field.setValue(this.supplier.contact2); }
    if (this.addressField.pristine) { this.addressField.setValue(this.supplier.address); }
    if (this.emailField.pristine) { this.emailField.setValue(this.supplier.email); }
    if (this.faxField.pristine) { this.faxField.setValue(this.supplier.fax); }
    if (this.suppliertypeField.pristine) { this.suppliertypeField.setValue(this.supplier.suppliertype.id); }
    if (this.supplierstatusField.pristine) { this.supplierstatusField.setValue(this.supplier.supplierstatus.id); }
    if (this.logoField.pristine) {
      if (this.supplier.logo) { this.logoField.setValue([this.supplier.logo]); }
      else { this.logoField.setValue([]); }
    }
  }

  async submit(): Promise<void> {
    this.logoField.updateValueAndValidity();
    this.logoField.markAsTouched();
    if (this.form.invalid) { return; }

    const newsupplier: Supplier = new Supplier();
    newsupplier.description = this.descriptionField.value;
    newsupplier.name = this.nameField.value;
    const logoIds = this.logoField.value;
    if (logoIds !== null && logoIds !== []){
      newsupplier.logo = logoIds[0];
    }else{
      newsupplier.logo = null;
    }
    newsupplier.contact1 = this.contact1Field.value;
    newsupplier.contact2 = this.contact2Field.value;
    newsupplier.address = this.addressField.value;
    newsupplier.email = this.emailField.value;
    newsupplier.fax = this.faxField.value;
    newsupplier.suppliertype = this.suppliertypeField.value;
    newsupplier.supplierstatus = this.supplierstatusField.value;
    try{
      const resourceLink: ResourceLink = await this.supplierService.update(this.selectedId, newsupplier);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/suppliers/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/suppliers');
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
          if (msg.contact1) { this.contact1Field.setErrors({server: msg.contact1}); knownError = true; }
          if (msg.contact2) { this.contact2Field.setErrors({server: msg.contact2}); knownError = true; }
          if (msg.address) { this.addressField.setErrors({server: msg.address}); knownError = true; }
          if (msg.email) { this.emailField.setErrors({server: msg.email}); knownError = true; }
          if (msg.fax) { this.faxField.setErrors({server: msg.fax}); knownError = true; }
          if (msg.suppliertype) { this.suppliertypeField.setErrors({server: msg.suppliertype}); knownError = true; }
          if (msg.supplierstatus) { this.supplierstatusField.setErrors({server: msg.supplierstatus}); knownError = true; }
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
