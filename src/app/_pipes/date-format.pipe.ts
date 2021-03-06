import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';


@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
  
    if (value == null) {
      return ' ';
    }
   
    const momentDate = moment(new Date(value));
    if (!momentDate.isValid()) {
      return value
    };

    const tempDate = '01-Jan-1753';//new Date('01-Jan-1753');
    const mmDate = momentDate.format(args);
    if (mmDate.indexOf("1753") != -1 || mmDate == "00:00:00") {
      return ' ';
    } else {
      return mmDate;
    }

  }
}