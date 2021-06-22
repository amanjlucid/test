import { Directive } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
declare var jQuery: any;

@Directive({
    selector: '[decimalValidation]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: DecimalValidation,
        multi: true
    }]
})

export class DecimalValidation implements Validator {
    validate(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value != "" && control.value != 0) {
      
            const checkDecimal = /^[-+]?[0-9]+\.[0-9]+$/;
            let val = String(control.value);
            const checkDecimalVal = String(val).match(checkDecimal);
            if(checkDecimalVal == null){
                return { 'invalidDecimal': true };
            }
            
            let number = /^[.\d]+$/.test(control.value) ? +control.value : NaN;
            if (number !== number) {
                return { 'invalidDecimal': true };
            }

            return null;
        }



    }

}