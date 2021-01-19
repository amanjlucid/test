import { FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import * as moment from "moment";
import { FormControl } from "@angular/forms";
import { retry } from 'rxjs/operators';
// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}


export function DateValidator(format = "DD/MM/YYYY"): any {
    return (control: FormControl): { [key: string]: any } => {
        if (control.value != null && control.value != "") {
            let date;
            if (control.value.day == undefined) {
                date = control.value;
                const dateObj = moment(date, format, true);
                if (isNaN(dateObj.year()) || isNaN(dateObj.month()) || isNaN(dateObj.date())) {
                    return { invalidDate: true };
                }
                if (dateObj.isValid()) {
                    const dd = { day: dateObj.date(), month: dateObj.month() + 1, year: dateObj.year() }
                    control.setValue(dd);
                }
            } else {
                date = `${control.value.day}/${control.value.month}/${control.value.year}`;
            }
            const val = moment(date, format, false);
            if (!val.isValid()) {
                return { invalidDate: true };
            }
            let today = moment().format("YYYY/MM/DD")
            let givenDate = val.format("YYYY/MM/DD");
            if (new Date(givenDate) > new Date(today)) {
                return { futureDate: true }
            }
        }
        return null;

    };
}

export function InstValidator(controlName: any, matchingControlName1: any, matchingControlName2: any) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl1 = formGroup.controls[matchingControlName1];
        const matchingControl2 = formGroup.controls[matchingControlName2];
        if (control.errors && !control.errors.isGeater) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        if (control.value == null || matchingControl1.value == null) {
            return;
        }
        const date1 = `${control.value.year}/${control.value.month}/${control.value.day}`
        const date2 = `${matchingControl1.value.year}/${matchingControl1.value.month}/${matchingControl1.value.day}`
        let installationDate = new Date(date1);
        let surveyDate = new Date(date2);

        if (installationDate > surveyDate) {
            return control.setErrors({ isGeater: true });
        }

        if (control.value == null || matchingControl2 == null) {
            return;
        }

        if (matchingControl2.value == "" || matchingControl2.value == null) {
            matchingControl2.setErrors(null);
        } else {
            const date3 = `${matchingControl2.value.year}/${matchingControl2.value.month}/${matchingControl2.value.day}`
            let serviceDate = new Date(date3);
            if (installationDate > serviceDate) {
                return control.setErrors({ isGeater: true });
            }
        }
        return control.setErrors(null);
    }
}

export function attrQuantityValidation(min, max) {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (min != undefined && max != undefined) {
            const quantity: number = control.value;
            if (quantity >= min && quantity <= max) {
                return null;
            } else {
                return { quanityInvalid: true };
            }
        } else {
            return null;
        }

    }


}


export function OrderDateValidator(controlName: any, matchingControlName1: any) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl1 = formGroup.controls[matchingControlName1];

        if (control.errors && !control.errors.isLower) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        if (matchingControl1.value == null || control.value == null) {
            return;
        }
        const date1 = `${control.value.year}/${control.value.month}/${control.value.day}`
        const date2 = `${matchingControl1.value.year}/${matchingControl1.value.month}/${matchingControl1.value.day}`
        let dateOne = new Date(date1);
        let dateTwo = new Date(date2);

        if (dateOne < dateTwo) {
            return control.setErrors({ isLower: true });
        }

        return control.setErrors(null);
    }
}


export function SimpleDateValidator(format = "DD/MM/YYYY"): any {
    return (control: FormControl): { [key: string]: any } => {
        if (control.value != null && control.value != "") {
            let date;
            if (control.value.day == undefined) {
                date = control.value;
                const dateObj = moment(date, format, true);
                if (isNaN(dateObj.year()) || isNaN(dateObj.month()) || isNaN(dateObj.date())) {
                    return { invalidDate: true };
                }
                if (dateObj.isValid()) {
                    const dd = { day: dateObj.date(), month: dateObj.month() + 1, year: dateObj.year() }
                    control.setValue(dd);
                }
            } else {
                date = `${control.value.day}/${control.value.month}/${control.value.year}`;
            }
            const val = moment(date, format, false);
            if (!val.isValid()) {
                return { invalidDate: true };
            }

        }
        return null;

    };
}

export function onlyImageType(): any {
    return (control: FormControl): { [key: string]: any } => {
        if (control.value != null && control.value != "") {
            let fileExt = "JPG, GIF, PNG, PDF";
            let extensions = (fileExt.split(','))
                .map(function (x) { return x.toLocaleUpperCase().trim() });
            let ext = control.value.toUpperCase().split('.').pop();
            let exists = extensions.includes(ext);
            if (!exists) {
                return { invalidExt: true };
            }
        }
        return null;

    };
}

export function MustbeTodayOrGreater(format = "DD/MM/YYYY"): any {
    return (control: FormControl): { [key: string]: any } => {
        if (control.value != null && control.value != "") {
            let date;
            if (control.value.day == undefined) {
                date = control.value;
                const dateObj = moment(date, format, true);
                if (isNaN(dateObj.year()) || isNaN(dateObj.month()) || isNaN(dateObj.date())) {
                    return { invalidDate: true };
                }
                if (dateObj.isValid()) {
                    const dd = { day: dateObj.date(), month: dateObj.month() + 1, year: dateObj.year() }
                    control.setValue(dd);
                }
            } else {
                date = `${control.value.day}/${control.value.month}/${control.value.year}`;
            }
            const val = moment(date, format, false);
            if (!val.isValid()) {
                return { invalidDate: true };
            }
            let today = moment().format("YYYY/MM/DD")
            let givenDate = val.format("YYYY/MM/DD");
            if (new Date(givenDate) < new Date(today)) {
                return { pastdate: true }
            }
        }
        return null;

    };
}

export function isNumberCheck(): ValidatorFn {
    return (control: FormControl): { [key: string]: boolean } | null => {
        if (control.value != null && control.value != "") {
            let number = /^[.\d]+$/.test(control.value) ? +control.value : NaN;
            if (number !== number) {
                return { 'isNotNumber': true };
            }
        }

        return null;
    };
}




