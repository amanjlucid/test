import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'assessmentHeader'
})
export class AssessmentHeaderPipe implements PipeTransform {
    transform(value: any, arr: any, columnName: string): any {
        let colName = "";
        // console.log({vl:value, ar : arr, cl : columnName})
        for (let vl of arr) {
            //console.log(vl[columnName]);
            if (vl[columnName] == value) {
                if (columnName == "concatgroup") {
                    if (vl.hasrepeatable == "Y") {
                        colName = `${vl.hasgroupid} ${vl.groupName}  - (${vl.hasALocation}) (${vl.hasAFloor})`;
                    } else {
                        colName = `${vl.hasgroupid} ${vl.groupName}`;
                    }

                    break;
                }
                if (columnName == "concateheading") {
                    colName = `${vl.hasgroupid}.${vl.hasheadingid} ${vl.hasheadingname}`;
                    break;
                }

                if (columnName == "concatquestion") {
                    colName = `${vl.hasgroupid}.${vl.hasheadingid}.${vl.hasquestionid} (${vl.hasquestioncode}) ${vl.hasquestiontext}`;
                    break;
                }

            }
        }


        return colName;
    }
}