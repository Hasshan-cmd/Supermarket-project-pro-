import { Component, OnInit } from '@angular/core';
import {Salary} from '../../../../entities/salary';
import {Employee} from '../../../../entities/employee';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SalaryService} from '../../../../services/salary.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {EmployeeService} from '../../../../services/employee.service';
import {PageRequest} from '../../../../shared/page-request';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {DateHelper} from '../../../../shared/date-helper';
import {ResourceLink} from '../../../../shared/resource-link';
import {AbstractComponent} from '../../../../shared/abstract-component';

@Component({
  selector: 'app-salary-update-form',
  templateUrl: './salary-update-form.component.html',
  styleUrls: ['./salary-update-form.component.scss']
})
export class SalaryUpdateFormComponent extends AbstractComponent implements OnInit {

  selectedId: number;
  salary: Salary;

  employees: Employee[] = [];

  form = new FormGroup({
    description: new FormControl(null, [
      Validators.maxLength(65536),
    ]),
    date: new FormControl(null, [
      Validators.required,
    ]),
    employee: new FormControl(null, [
      Validators.required,
    ]),
    amount: new FormControl(null, [
      Validators.required,
    ]),
  });
  get descriptionField(): FormControl {
    return this.form.controls.description as FormControl;
  }

  get dateField(): FormControl {
    return this.form.controls.date as FormControl;
  }

  get employeeField(): FormControl {
    return this.form.controls.employee as FormControl;
  }

  get amountField(): FormControl {
    return this.form.controls.amount as FormControl;
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
    if (this.salary === null){return true; }
    const now: Date = new Date();
    const creationTimeAsString: string = this.salary.tocreation;
    const lastTimeTimestamp: number = Date.parse(creationTimeAsString) + (60 * 60 * 1000);
    const lastTime = new Date(lastTimeTimestamp);

    return now > lastTime;
  }

  constructor(
    private salaryService: SalaryService,
    private snackBar: MatSnackBar,
    private router: Router,
    private employeeService: EmployeeService,
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

    this.employeeService.getAllBasic(new PageRequest()).then((employeeDataPage) => {
      this.employees = employeeDataPage.content;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });

    this.salary = await this.salaryService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_SALARY);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_SALARIES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_SALARY_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_SALARY);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_SALARY);
  }

  discardChanges(): void{
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void{
    if (this.descriptionField.pristine) { this.descriptionField.setValue(this.salary.description); }
    if (this.dateField.pristine) { this.dateField.setValue(this.salary.date); }
    if (this.employeeField.pristine) { this.employeeField.setValue(this.salary.employee.id); }
    if (this.amountField.pristine) { this.amountField.patchValue(this.salary.amount); }
  }

  async submit(): Promise<void> {

    if (this.form.invalid) { return; }

    const newsalary: Salary = new Salary();
    newsalary.description = this.descriptionField.value;
    newsalary.date = DateHelper.getDateAsString(this.dateField.value);
    newsalary.employee = this.employeeField.value;
    newsalary.amount = this.amountField.value;
    try{
      const resourceLink: ResourceLink = await this.salaryService.update(this.selectedId, newsalary);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/salaries/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/salaries');
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
          if (msg.employee) { this.employeeField.setErrors({server: msg.employee}); knownError = true; }
          if (msg.amount) { this.amountField.setErrors({server: msg.amount}); knownError = true; }
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
