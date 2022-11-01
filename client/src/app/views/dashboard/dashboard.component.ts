import { Component, OnInit } from '@angular/core';
import {AbstractComponent} from '../../shared/abstract-component';
import {LoggedUser} from '../../shared/logged-user';
import {UsecaseList} from '../../usecase-list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {DashboardService} from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends AbstractComponent implements OnInit {

  receentCustomerCount = 0;
  receentPurchaseCount = 0;
  receentItemCount = 0;
  receentSaleCount = 0;

  public dashboardPrivilege = {
    showCustomers: false,
    showPurchases: false,
    showItems: false,
    showSales: false,
  };

  ngOnInit(): void{
    this.loadData();
    this.refreshData();
  }

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    super();
  }

  async loadData(): Promise<any> {
    this.updatePrivileges();
    this.receentCustomerCount = await this.dashboardService.getRecentCustomerCount();
    this.receentPurchaseCount = await this.dashboardService.getRecentPurchaseCount();
    this.receentItemCount = await this.dashboardService.getRecentItemCount();
    this.receentSaleCount = await this.dashboardService.getRecentSaleCount();
  }

  updatePrivileges(): any {
    this.dashboardPrivilege.showCustomers = LoggedUser.can(UsecaseList.SHOW_ALL_CUSTOMERS);
    this.dashboardPrivilege.showPurchases = LoggedUser.can(UsecaseList.SHOW_ALL_PURCHASES);
    this.dashboardPrivilege.showItems = LoggedUser.can(UsecaseList.SHOW_ALL_ITEMS);
    this.dashboardPrivilege.showSales = LoggedUser.can(UsecaseList.SHOW_ALL_SALES);
  }
}
