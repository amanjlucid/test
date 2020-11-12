import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundOff'
})


export class RoundOffPipe implements PipeTransform {


  transform(input: any) {
    if (input == "" || input == 0) {
      return 0;
    }
    return Math.round(input);
  }


}