import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'refDetail',
    pure: true
})
export class AsbestosRefDetailPipe implements PipeTransform {
    transform(item: any, ref: any): any {
        let refe = ref.split(":")
        let sample: any;

        item.sampleList.forEach(element => {
            sample = element;
        });
      

        if (sample != undefined) {
            return `Analysis ${sample.sampleReference}, Presence =${sample.presence}`;
        }

    }
}