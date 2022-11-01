import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';
import {TokenManager} from '../../shared/security/token-manager';
import {AuthenticationService} from '../../shared/authentication.service';
import {LoggedUser} from '../../shared/logged-user';
import {LinkItem} from '../../shared/link-item';
import {ThemeManager} from '../../shared/views/theme-manager';
import {UsecaseList} from '../../usecase-list';
import {NotificationService} from '../../services/notification.service';
import {PrimeNumbers} from '../../shared/prime-numbers';
import {Notification} from '../../entities/notification';

@Component({
  selector: 'app-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss']
})
export class MainWindowComponent implements OnInit, OnDestroy {

  constructor(
    private userService: UserService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) {
    if (!TokenManager.isContainsToken()){
      this.router.navigateByUrl('/login');
    }
  }

  get loggedUserName(): string{
    return LoggedUser.getName();
  }

  get loggedUserPhoto(): string{
    return LoggedUser.getPhoto();
  }

  refreshRate = PrimeNumbers.getRandomNumber();
  unreadNotificationCount = '0';
  isLive = true;
  sidenavOpen = false;
  sidenaveMode = 'side';
  usecasesLoaded = false;
  linkItems: LinkItem[] = [];
  isDark: boolean;
  latestNotifications: Notification[] = [];

  async loadData(): Promise<void>{
    this.notificationService.getUnreadCount().then((count) => {
      if (count > 99) { this.unreadNotificationCount = '99+'; }
      else{ this.unreadNotificationCount = count.toString(); }
    }).catch((e) => {
      console.log(e);
    });

    this.notificationService.getLatest().then(async (data) => {
      this.latestNotifications = data;
      for (const notification of data){
        if (!notification.dodelivered){
          await this.notificationService.setDelivered(notification.id);
        }
      }
    }).catch((e) => {
      console.log(e);
    });

  }

  setNotificationsAsRead(): void{
    for (const notification of this.latestNotifications){
      if (!notification.doread){
        this.notificationService.setRead(notification.id);
      }
    }
  }

  refreshData(): void{
    setTimeout( async () => {
      if (!this.isLive) { return; }
      try{
        await this.loadData();
      }finally {
        this.refreshData();
      }
    }, this.refreshRate);
  }

  async ngOnInit(): Promise<void> {
    this.userService.me().then((user) => {
      LoggedUser.user = user;
    });
    this.userService.myUsecases().then((usecases) => {
      LoggedUser.usecases = usecases;
      this.setLinkItems();
      this.usecasesLoaded = true;
    });
    this.setSidenavSettings();
    this.isDark = ThemeManager.isDark();
    await this.loadData();
    this.refreshData();
  }

  async logout(): Promise<void>{
    await this.authenticationService.destroyToken();
    TokenManager.destroyToken();
    LoggedUser.clear();
    this.router.navigateByUrl('/login');
  }

  setSidenavSettings(): void{
    const width = window.innerWidth;
    if (width < 992){
      this.sidenavOpen = false;
      this.sidenaveMode = 'over';
    }else{
      this.sidenavOpen = true;
      this.sidenaveMode = 'side';
    }
  }

  private setLinkItems(): void{
    const dashboardLink = new LinkItem('Dashboard', '/', 'dashboard');
    const userLink = new LinkItem('User Management', '', 'admin_panel_settings');
    const roleLink = new LinkItem('Role Management', '', 'assignment_ind');
    const employeeLink = new LinkItem('Employee Management', '/', 'trip_origin');
    const customerLink = new LinkItem('Customer Management', '/', 'supervised_user_circle');
    const supplierLink = new LinkItem('Supplier Management', '/', 'local_shipping');
    const itemLink = new LinkItem('Item Management', '/', 'list_alt');
    const purchaseLink = new LinkItem('Purchase Management', '/', 'store');
    const saleLink = new LinkItem('Sale Management', '/', 'add_shopping_cart');
    const salaryLink = new LinkItem('Salary Management', '/', 'work');

    const showUserLink = new LinkItem('Show All Users', '/users', 'list');
    showUserLink.addUsecaseId(UsecaseList.SHOW_ALL_USERS);
    userLink.children.push(showUserLink);

    const addUserLink = new LinkItem('Add New User', '/users/add', 'add');
    addUserLink.addUsecaseId(UsecaseList.ADD_USER);
    userLink.children.push(addUserLink);

    const showRoleLink = new LinkItem('Show All Roles', '/roles', 'list');
    showRoleLink.addUsecaseId(UsecaseList.SHOW_ALL_ROLES);
    roleLink.children.push(showRoleLink);

    const addRoleLink = new LinkItem('Add New Role', '/roles/add', 'add');
    addRoleLink.addUsecaseId(UsecaseList.ADD_ROLE);
    roleLink.children.push(addRoleLink);

    const addNewEmployeeLink = new LinkItem('Add New Employee', 'employees/add', 'add');
    addNewEmployeeLink.addUsecaseId(UsecaseList.ADD_EMPLOYEE);
    employeeLink.children.push(addNewEmployeeLink);

    const showAllEmployeeLink = new LinkItem('Show All Employee', 'employees', 'list');
    showAllEmployeeLink.addUsecaseId(UsecaseList.SHOW_ALL_EMPLOYEES);
    employeeLink.children.push(showAllEmployeeLink);

    const addNewCustomerLink = new LinkItem('Add New Customer', 'customers/add', 'add');
    addNewCustomerLink.addUsecaseId(UsecaseList.ADD_CUSTOMER);
    customerLink.children.push(addNewCustomerLink);

    const showAllCustomerLink = new LinkItem('Show All Customer', 'customers', 'list');
    showAllCustomerLink.addUsecaseId(UsecaseList.SHOW_ALL_CUSTOMERS);
    customerLink.children.push(showAllCustomerLink);

    const addNewSupplierLink = new LinkItem('Add New Supplier', 'suppliers/add', 'add');
    addNewSupplierLink.addUsecaseId(UsecaseList.ADD_SUPPLIER);
    supplierLink.children.push(addNewSupplierLink);

    const showAllSupplierLink = new LinkItem('Show All Supplier', 'suppliers', 'list');
    showAllSupplierLink.addUsecaseId(UsecaseList.SHOW_ALL_SUPPLIERS);
    supplierLink.children.push(showAllSupplierLink);

    const addNewItemLink = new LinkItem('Add New Item', 'items/add', 'add');
    addNewItemLink.addUsecaseId(UsecaseList.ADD_ITEM);
    itemLink.children.push(addNewItemLink);

    const showAllItemLink = new LinkItem('Show All Item', 'items', 'list');
    showAllItemLink.addUsecaseId(UsecaseList.SHOW_ALL_ITEMS);
    itemLink.children.push(showAllItemLink);

    const addNewPurchaseLink = new LinkItem('Add New Purchase', 'purchases/add', 'add');
    addNewPurchaseLink.addUsecaseId(UsecaseList.ADD_PURCHASE);
    purchaseLink.children.push(addNewPurchaseLink);

    const showAllPurchaseLink = new LinkItem('Show All Purchase', 'purchases', 'list');
    showAllPurchaseLink.addUsecaseId(UsecaseList.SHOW_ALL_PURCHASES);
    purchaseLink.children.push(showAllPurchaseLink);

    const addNewSaleLink = new LinkItem('Add New Sale', 'sales/add', 'add');
    addNewSaleLink.addUsecaseId(UsecaseList.ADD_SALE);
    saleLink.children.push(addNewSaleLink);

    const showAllSaleLink = new LinkItem('Show All Sale', 'sales', 'list');
    showAllSaleLink.addUsecaseId(UsecaseList.SHOW_ALL_SALES);
    saleLink.children.push(showAllSaleLink);

    const addNewSalaryLink = new LinkItem('Add New Salary', 'salaries/add', 'add');
    addNewSalaryLink.addUsecaseId(UsecaseList.ADD_SALARY);
    salaryLink.children.push(addNewSalaryLink);

    const showAllSalaryLink = new LinkItem('Show All Salary', 'salaries', 'list');
    showAllSalaryLink.addUsecaseId(UsecaseList.SHOW_ALL_SALARIES);
    salaryLink.children.push(showAllSalaryLink);

    this.linkItems.push(dashboardLink);
    this.linkItems.push(userLink);
    this.linkItems.push(roleLink);
    this.linkItems.push(employeeLink);
    this.linkItems.push(customerLink);
    this.linkItems.push(supplierLink);
    this.linkItems.push(itemLink);
    this.linkItems.push(purchaseLink);
    this.linkItems.push(saleLink);
    this.linkItems.push(salaryLink);

  }

  changeTheme(e): void{
    if (e.checked){
      ThemeManager.setDark(true);
      this.isDark = true;
    }else{
      ThemeManager.setDark(false);
      this.isDark = false;
    }
  }

  ngOnDestroy(): void {
    this.isLive = false;
  }
}
