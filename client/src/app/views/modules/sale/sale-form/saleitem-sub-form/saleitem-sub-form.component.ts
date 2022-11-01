import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {AbstractSubFormComponent} from '../../../../../shared/ui-components/abstract-sub-form/abstract-sub-form.component';
import {Saleitem} from '../../../../../entities/saleitem';
import {ItemService} from '../../../../../services/item.service';
import {Item} from '../../../../../entities/item';
import {PageRequest} from '../../../../../shared/page-request';

@Component({
  selector: 'app-saleitem-sub-form',
  templateUrl: './saleitem-sub-form.component.html',
  styleUrls: ['./saleitem-sub-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SaleitemSubFormComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SaleitemSubFormComponent),
      multi: true
    }
  ],
})
export class SaleitemSubFormComponent extends AbstractSubFormComponent<Saleitem> implements OnInit {

  hasValidations = false;

  items: Item[] = [];

  form = new FormGroup({
    id: new FormControl(null),
    item: new FormControl(),
    qty: new FormControl(),
    unitprice: new FormControl(),
  });

  get idField(): FormControl {
    return this.form.controls.id as FormControl;
  }

  get itemField(): FormControl {
    return this.form.controls.item as FormControl;
  }

  get qtyField(): FormControl {
    return this.form.controls.qty as FormControl;
  }

  get unitpriceField(): FormControl {
    return this.form.controls.unitprice as FormControl;
  }

  get isFormEmpty(): boolean{
    return this.isEmptyField(this.idField)
      && this.isEmptyField(this.itemField)
      && this.isEmptyField(this.qtyField)
      && this.isEmptyField(this.unitpriceField);
  }

  get total(): number{
    let total = 0;

    this.dataList.forEach((saleitem) => {
      total += saleitem.qty * saleitem.unitprice;
    });
    return total;
  }

  constructor(
    private snackBar: MatSnackBar,
    protected dialog: MatDialog,
    private itemService: ItemService,
  ) {
    super();
  }

  setUnitprice(): void{
    const selectedItemId = this.itemField.value;
    if (!selectedItemId) { return; }
    const selectedItem = this.getObjectById(this.items, selectedItemId);
    this.unitpriceField.patchValue(selectedItem.price.toFixed(2));
  }

  ngOnInit(): void {
      this.itemService.getAllBasic(new PageRequest()).then((itemDataPage) => {
      this.items = itemDataPage.content;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
  }

  setValidations(): void{
    this.hasValidations = true;

    this.itemField.setValidators([
      Validators.required,
    ]);
    this.qtyField.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(99999999),
      Validators.pattern('^([0-9]+)$')
    ]);
    this.unitpriceField.setValidators([
      Validators.required,
      Validators.min(0),
      Validators.max(99999999.99),
      Validators.pattern('^([0-9]{1,8}([\.][0-9]{2})?)$')
    ]);
  }

  removeValidations(): void{
    this.hasValidations = false;
    this.itemField.clearValidators();
    this.qtyField.clearValidators();
    this.unitpriceField.clearValidators();
  }

  fillForm(dataItem: Saleitem): void {
    this.idField.patchValue(dataItem.id);
    this.itemField.patchValue(dataItem.item.id);
    this.qtyField.patchValue(dataItem.qty);
    this.unitpriceField.patchValue(dataItem.unitprice);
  }

  resetForm(): void {
    this.form.reset();
    this.removeValidations();
  }

  getDeleteConfirmMessage(saleitem: Saleitem): string {
    return 'Are you sure to remove \u201C' + saleitem.item.name + '\u2010?';
  }

  getUpdateConfirmMessage(saleitem: Saleitem): string {
    if (this.isFormEmpty){
      return '\'Are you sure to update \u201C\u00A0' + saleitem.item.name + '\u00A0\u2010\u00A0?';
    }
    return '\'Are you sure to update \u201C\u00A0' + saleitem.item.name + '\u00A0\u2010 and discard existing form data\u00A0?';
  }

  addData(): void {
    if (this.form.invalid){ return; }

    const dataItem: Saleitem = new Saleitem();
    dataItem.id = this.idField.value;
    dataItem.item = this.getObjectById(this.items, this.itemField.value);
    dataItem.qty = this.qtyField.value;
    dataItem.unitprice = this.unitpriceField.value;

    if (!this.checkQuantity()){
      return;
    }

    const exists = this.dataList.some((existingDataItem) => {
      return existingDataItem.item.id === dataItem.item.id;
    });

    if (exists){
      this.snackBar.open('Selected item and unit price are already exist in the table.', null, {duration: 2000});
    }else {
      this.addToTop(dataItem);
      this.resetForm();
    }
  }

  checkQuantity(): boolean{
    const item = this.getObjectById(this.items, this.itemField.value);
    const givenQty = this.qtyField.value;
    if (givenQty > item.qty){
      this.qtyField.setErrors({quantityOverflow: 'Remaining quantity on the stock is ' + item.qty});
      return false;
    }
    return true;
  }

  customValidations(): object {
    return null;
  }

}
