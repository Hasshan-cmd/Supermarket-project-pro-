import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {PageRequest} from '../../../../shared/page-request';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {DateHelper} from '../../../../shared/date-helper';
import {ResourceLink} from '../../../../shared/resource-link';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {SaleitemSubFormComponent} from '../../sale/sale-form/saleitem-sub-form/saleitem-sub-form.component';
import {SaleService} from '../../../../services/sale.service';
import {Sale} from '../../../../entities/sale';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss']
})
export class SaleFormComponent extends AbstractComponent implements OnInit {
  @ViewChild(SaleitemSubFormComponent) saleitemSubForm: SaleitemSubFormComponent;


  form = new FormGroup({
    description: new FormControl(null, [
      Validators.maxLength(65536),
    ]),
    date: new FormControl(null, [
      Validators.required,
    ]),
    saleitem: new FormControl(),
  });

  get descriptionField(): FormControl {
    return this.form.controls.description as FormControl;
  }

  get dateField(): FormControl {
    return this.form.controls.date as FormControl;
  }

  get saleitemField(): FormControl {
    return this.form.controls.saleitem as FormControl;
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
    private saleService: SaleService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    super();
  }

  today = new Date();

  currentMonth = this.today.getUTCMonth() + 1;
  currentDay = this.today.getUTCDay();
  currentYear = this.today.getUTCFullYear();

  TodayDate = "09/16/2022";

  FinalMonth :any;
  FinalDay :any;

  ngOnInit(): void {
    this.loadData();
    this.refreshData();

    if (this.currentMonth < 10){
      this.FinalMonth = "0" + this.currentMonth;
    }else {
      this.FinalMonth = this.currentMonth;
    }

    if (this.currentDay < 10){
      this.FinalDay = "0" + this.currentDay;
    }else {
      this.FinalDay = this.currentDay;
    }

    this.TodayDate = this.currentMonth + "/" + this.currentDay + "/" + this.currentYear ;

  }

  async loadData(): Promise<any>{

    this.updatePrivileges();
    if (!this.privilege.add) { return; }

  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_SALE);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_SALES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_SALE_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_SALE);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_SALE);
  }

  async submit(): Promise<void> {

    this.saleitemSubForm.resetForm();
    this.saleitemField.markAsDirty();

    if (this.form.invalid) { return; }

    const sale: Sale = new Sale();
    sale.description = this.descriptionField.value;
    sale.date = DateHelper.getDateAsString(this.dateField.value);
    sale.saleitemList = this.saleitemField.value;

    try{
      const resourceLink: ResourceLink = await this.saleService.add(sale);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/sales/' + resourceLink.id);
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
