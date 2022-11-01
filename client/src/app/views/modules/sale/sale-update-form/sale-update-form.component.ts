import {Component, OnInit, ViewChild} from '@angular/core';
import {SaleitemUpdateSubFormComponent} from '../../sale/sale-update-form/saleitem-update-sub-form/saleitem-update-sub-form.component';
import {Sale} from '../../../../entities/sale';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SaleService} from '../../../../services/sale.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {DateHelper} from '../../../../shared/date-helper';
import {ResourceLink} from '../../../../shared/resource-link';
import {AbstractComponent} from '../../../../shared/abstract-component';

@Component({
  selector: 'app-sale-update-form',
  templateUrl: './sale-update-form.component.html',
  styleUrls: ['./sale-update-form.component.scss']
})
export class SaleUpdateFormComponent extends AbstractComponent implements OnInit {
  @ViewChild(SaleitemUpdateSubFormComponent) saleitemUpdateSubForm: SaleitemUpdateSubFormComponent;

  selectedId: number;
  sale: Sale;

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

  get isLate(): boolean {
    if (this.sale === null){return true; }
    const now: Date = new Date();
    const creationTimeAsString: string = this.sale.tocreation;
    const lastTimeTimestamp: number = Date.parse(creationTimeAsString) + (60 * 60 * 1000);
    const lastTime = new Date(lastTimeTimestamp);

    return now > lastTime;
  }

  constructor(
    private saleService: SaleService,
    private snackBar: MatSnackBar,
    private router: Router,
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

    this.sale = await this.saleService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_SALE);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_SALES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_SALE_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_SALE);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_SALE);
  }

  discardChanges(): void{
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void{
    if (this.descriptionField.pristine) { this.descriptionField.setValue(this.sale.description); }
    if (this.dateField.pristine) { this.dateField.setValue(this.sale.date); }
    if (this.saleitemField.pristine) { this.saleitemField.patchValue(this.sale.saleitemList); }
  }

  async submit(): Promise<void> {

    // this.saleitemUpdateSubForm.resetForm();
    this.saleitemField.markAsDirty();

    if (this.form.invalid) { return; }

    const newsale: Sale = new Sale();
    newsale.description = this.descriptionField.value;
    newsale.date = DateHelper.getDateAsString(this.dateField.value);
    newsale.saleitemList = this.saleitemField.value;
    try{
      const resourceLink: ResourceLink = await this.saleService.update(this.selectedId, newsale);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/sales/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/sales');
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
