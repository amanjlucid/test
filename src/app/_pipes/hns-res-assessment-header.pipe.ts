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
                        if (vl.hasALocation != "" && vl.hasAFloor != "")
                        {
                          colName = `${vl.hasgroupseq} ${vl.groupName}  - (${vl.hasALocation}) (${vl.hasAFloor})`;
                        }
                        else
                        {
                          colName = `${vl.hasgroupseq} ${vl.groupName}`;
                        }

                    } else {
                        colName = `${vl.hasgroupseq} ${vl.groupName}`;
                    }

                    break;
                }
                if (columnName == "concateheading") {
                    colName = `${vl.hasgroupseq}.${vl.hasheadingseq} ${vl.hasheadingname}`;
                    break;
                }

                if (columnName == "concatquestion") {
                    colName = `${vl.hasgroupseq}.${vl.hasheadingseq}.${vl.hasquestionseq} (${vl.hasquestioncode}) ${vl.hasquestiontext}`;
                    break;
                }

            }
        }


        return colName;
    }
}
