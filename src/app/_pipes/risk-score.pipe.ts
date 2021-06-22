import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'riskScore',
    pure: true
})
export class RiskScorePipe implements PipeTransform {
    transform(value: any, ref?: any): any {
        if (isNaN(value)) {
            return 0
        } else {
           return  Math.round(value * 100);
        }
       
    }
}