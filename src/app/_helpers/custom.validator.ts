import { FormGroup, AbstractControl } from '@angular/forms';

export class CustomValidators {
    static upperCaseValidation() {
        return (controls: AbstractControl): { [key: string]: any } | null => {
            const text = controls.value;
            if(text != null){
                if (text === text.toUpperCase) {
                    return null;
                } else {
                    return { 'strinUpperCase': true };
                }
            } else {
                return null;
            }
            
        }
    }


   
}