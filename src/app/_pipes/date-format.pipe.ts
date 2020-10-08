import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';


@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    //return super.transform(value, args);
    //const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    // if(isIEOrEdge){
    //   var momentDate = moment(value);
    // } else {
    //   var momentDate = moment(new Date(value));
    // }
    if (value == null) {
      return ' ';
    }
    const momentDate = moment(new Date(value));
    if (!momentDate.isValid()) {
      return value
    };

    const tempDate = '01-Jan-1753';//new Date('01-Jan-1753');
    const mmDate = momentDate.format(args);
    if (tempDate == mmDate) {
      return ' ';
    } else {
      return mmDate;
    }

  }
}