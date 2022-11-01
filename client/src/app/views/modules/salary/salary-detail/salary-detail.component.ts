import { Component, OnInit } from '@angular/core';
import {Salary} from '../../../../entities/salary';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SalaryService} from '../../../../services/salary.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeleteConfirmDialogComponent} from '../../../../shared/views/delete-confirm-dialog/delete-confirm-dialog.component';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {AbstractComponent} from '../../../../shared/abstract-component';

@Component({
  selector: 'app-salary-detail',
  templateUrl: './salary-detail.component.html',
  styleUrls: ['./salary-detail.component.scss']
})
export class SalaryDetailComponent extends AbstractComponent implements OnInit {
  salary: Salary;
  selectedId: number;
  logo: any = null;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private salaryService: SalaryService,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( async (params) => {
      this.selectedId = + params.get('id');
      try{
        await this.loadData();
      } finally {
        this.initialLoaded();
        this.refreshData();
      }
    });
  }

  async delete(): Promise<void>{
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '300px',
      data: {message: this.salary.code + ' - ' + this.salary.date}
    });

    dialogRef.afterClosed().subscribe( async result => {
      if (!result) { return; }

      try {
        await this.salaryService.delete(this.selectedId);
        await this.router.navigateByUrl('/salaries');
      }catch (e) {
        this.snackBar.open(e.error.message, null, {duration: 4000});
      }
    });
  }

  async loadData(): Promise<any> {
    this.updatePrivileges();
    this.salary = await this.salaryService.get(this.selectedId);
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_SALARY);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_SALARIES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_SALARY_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_SALARY);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_SALARY);
  }
}
