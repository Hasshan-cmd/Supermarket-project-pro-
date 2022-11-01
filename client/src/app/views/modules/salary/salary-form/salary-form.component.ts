import { Component, OnInit } from '@angular/core';
import {Employee} from '../../../../entities/employee';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SalaryService} from '../../../../services/salary.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {EmployeeService} from '../../../../services/employee.service';
import {PageRequest} from '../../../../shared/page-request';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {Salary} from '../../../../entities/salary';
import {DateHelper} from '../../../../shared/date-helper';
import {ResourceLink} from '../../../../shared/resource-link';
import {AbstractComponent} from '../../../../shared/abstract-component';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.scss']
})
export class SalaryFormComponent extends AbstractComponent implements OnInit {
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

  constructor(
    private salaryService: SalaryService,
    private snackBar: MatSnackBar,
    private router: Router,
    private employeeService: EmployeeService,
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

    this.employeeService.getAllBasic(new PageRequest()).then((employeeDataPage) => {
      this.employees = employeeDataPage.content;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_SALARY);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_SALARIES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_SALARY_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_SALARY);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_SALARY);
  }

  async submit(): Promise<void> {

    if (this.form.invalid) { return; }

    const salary: Salary = new Salary();
    salary.description = this.descriptionField.value;
    salary.date = DateHelper.getDateAsString(this.dateField.value);
    salary.employee = this.employeeField.value;
    salary.amount = this.amountField.value;

    try{
      const resourceLink: ResourceLink = await this.salaryService.add(salary);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/salaries/' + resourceLink.id);
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
