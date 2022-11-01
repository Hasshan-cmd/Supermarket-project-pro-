import { Component, OnInit } from '@angular/core';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomerService} from '../../../../services/customer.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {Customer} from '../../../../entities/customer';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {ResourceLink} from '../../../../shared/resource-link';

@Component({
  selector: 'app-customer-update-form',
  templateUrl: './customer-update-form.component.html',
  styleUrls: ['./customer-update-form.component.scss']
})
export class CustomerUpdateFormComponent extends AbstractComponent implements OnInit {

  customer: Customer;
  selectedId: number;

  form = new FormGroup({
    description: new FormControl(null, [
      Validators.maxLength(65536),
    ]),
    name: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255),
      Validators.pattern('^[a-zA-Z]+(([\',. -][a-zA-Z ])?[a-zA-Z]*)*$')
    ]),
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
    ])
  });


  get descriptionField(): FormControl {
    return this.form.controls.description as FormControl;
  }

  get nameField(): FormControl {
    return this.form.controls.name as FormControl;
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

  constructor(
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.selectedId = +params.get('id');
      await this.loadData();
      this.refreshData();
    });
  }

  async loadData(): Promise<any> {

    this.updatePrivileges();
    if (!this.privilege.update) {
      return;
    }

    this.customer = await this.customerService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_CUSTOMER);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_CUSTOMERS);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_CUSTOMER_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_CUSTOMER);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_CUSTOMER);
  }

  discardChanges(): void {
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void {
    if (this.nameField.pristine) {
      this.nameField.setValue(this.customer.name);
    }
    if (this.descriptionField.pristine) {
      this.descriptionField.setValue(this.customer.description);
    }
    if (this.contact1Field.pristine) {
      this.contact1Field.setValue(this.customer.contact1);
    }
    if (this.contact2Field.pristine) {
      this.contact2Field.setValue(this.customer.contact2);
    }
    if (this.addressField.pristine) {
      this.addressField.setValue(this.customer.address);
    }
    if (this.emailField.pristine) {
      this.emailField.setValue(this.customer.email);
    }
    if (this.faxField.pristine) {
      this.faxField.setValue(this.customer.fax);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const newcustomer: Customer = new Customer();
    newcustomer.description = this.descriptionField.value;
    newcustomer.name = this.nameField.value;
    newcustomer.contact1 = this.contact1Field.value;
    newcustomer.contact2 = this.contact2Field.value;
    newcustomer.address = this.addressField.value;
    newcustomer.email = this.emailField.value;
    newcustomer.fax = this.faxField.value;
    try {
      const resourceLink: ResourceLink = await this.customerService.update(this.selectedId, newcustomer);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/customers/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/customers');
      }
    } catch (e) {
      switch (e.status) {
        case 401:
          break;
        case 403:
          this.snackBar.open(e.error.message, null, {duration: 2000});
          break;
        case 400:
          const msg = JSON.parse(e.error.message);
          let knownError = false;
          if (msg.description) {
            this.descriptionField.setErrors({server: msg.description});
            knownError = true;
          }
          if (msg.name) {
            this.nameField.setErrors({server: msg.name});
            knownError = true;
          }
          if (msg.contact1) {
            this.contact1Field.setErrors({server: msg.contact1});
            knownError = true;
          }
          if (msg.contact2) {
            this.contact2Field.setErrors({server: msg.contact2});
            knownError = true;
          }
          if (msg.address) {
            this.addressField.setErrors({server: msg.address});
            knownError = true;
          }
          if (msg.email) {
            this.emailField.setErrors({server: msg.email});
            knownError = true;
          }
          if (msg.fax) {
            this.faxField.setErrors({server: msg.fax});
            knownError = true;
          }
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
