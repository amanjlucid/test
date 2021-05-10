import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Directive({
  selector: '[formControlName][numberDecimal]',
})

export class NumberDecimalMaskDirective {

  private regexString(max?: number) {
    const maxStr = max ? `{0,${max}}` : `+`;
    return `^(\\d${maxStr}(\\.\\d{0,2})?|\\.\\d{0,2})$`
  }
  private digitRegex: RegExp;
  private setRegex(maxDigits?: number) {
    this.digitRegex = new RegExp(this.regexString(maxDigits), 'g')
  }

  @Input()
  set maxDigits(maxDigits: number) {
    this.setRegex(maxDigits);
  }

  constructor(
    public ngControl: NgControl,
    private currencyPipe: CurrencyPipe
  ) {
    this.setRegex();
  }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event) {
    this.onInputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event) {
    this.onInputChange(event.target.value, true);
  }

  private lastValid = '';
  onInputChange(event, backspace) {
    event = (typeof event == "number") ? event.toString() : event;

    if (event == undefined) return
    // console.log(event);
    const replaceWithnumber = event.replace(/[^0-9.]+/g, '')
    const cleanValue = (replaceWithnumber.match(this.digitRegex) || []).join('')
    if (cleanValue || !replaceWithnumber) {
      this.lastValid = cleanValue
    }

    let rawVal = (cleanValue || this.lastValid)

    // let newVal = event.replace(/\D/g, '');

    let newVal = '';
    let splitVal = [];
    if (rawVal.indexOf('.') != -1) {
      splitVal = rawVal.split(".");
      newVal = splitVal[0];
    } else {
      newVal = rawVal;
    }


    // if (backspace && newVal.length <= 6) {
    //   newVal = newVal.substring(0, newVal.length - 1);
    // }

    // if (newVal.length === 0) {
    //   newVal = '';
    // } else if (newVal.length <= 3) {
    //   newVal = newVal.replace(/^(\d{0,3})/, '$1');
    // } else if (newVal.length <= 4) {
    //   newVal = newVal.replace(/^(\d{0,1})(\d{0,3})/, '$1,$2');
    // } else if (newVal.length <= 5) {
    //   newVal = newVal.replace(/^(\d{0,2})(\d{0,3})/, '$1,$2');
    // } else if (newVal.length <= 6) {
    //   newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '$1,$2');
    // } else if (newVal.length <= 7) {
    //   newVal = newVal.replace(/^(\d{0,1})(\d{0,3})(\d{0,4})/, '$1,$2,$3');
    // } else if (newVal.length <= 8) {
    //   newVal = newVal.replace(/^(\d{0,2})(\d{0,3})(\d{0,4})/, '$1,$2,$3');
    // } else if (newVal.length <= 9) {
    //   newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '$1,$2,$3');
    // } else {
    //   newVal = newVal.substring(0, 10);
    //   newVal = newVal.replace(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,4})/, '$1,$2,$3,$4');
    // }

    newVal = (splitVal.length > 0) ? `${newVal}.${splitVal[1]}` : newVal;
    this.ngControl.valueAccessor.writeValue(newVal);

    this.toNumber(newVal)
  }

  toNumber(val) {
    let valArr = val.split('');
    let valFiltered = valArr.filter(x => !isNaN(x))
    let valProcessed = valFiltered.join('')
    return valProcessed;
  }

}