import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {HelperService, WopmConfigurationService } from '../../../../_services';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-wopm-sec-jobroles',
  templateUrl: './wopm-sec-jobroles.component.html',
  styleUrls: ['./wopm-sec-jobroles.component.css']
})
export class WopmSecJobrolesComponent implements OnInit, OnDestroy {
  subs = new SubSink();
    state: State = {
      skip: 0,
      sort: [],
      group: [],
      filter: {
        logic: "and",
        filters: []
      }
    }

    allowUnsort = true;
    multiple = false;
  @Input() securityFunctionWindow: boolean = false
  @Input() JobRole: string
  @Input() RoleType: string
  @Output() closeSecurityFunctionWindow = new EventEmitter<boolean>();
  loading: boolean = false;
  securityFunctions: any
  securityFunctionsTemp: any
  public gridView: DataResult;

  constructor(

    private wopmConfigurationService: WopmConfigurationService,
    private helper: HelperService

  ) { }

  ngOnInit(): void {
    this.getGridDataDetails();
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  distinctPrimitive(fieldName: string): any {
    return distinct(this.securityFunctions, fieldName).map(item => {
      return { val: item[fieldName], text: item[fieldName] }
    });
  }

  getGridDataDetails() {
    this.loading = true;
    this.subs.add(
      this.wopmConfigurationService.getWorksOrderSecurityFunctionsForJobRole(this.RoleType, this.JobRole).subscribe(
        data => {
          if (data.isSuccess) {
            const secFunctions = data.data;
            this.securityFunctions = secFunctions;
            this.securityFunctionsTemp = Object.assign([], secFunctions);
            this.gridView = process(this.securityFunctionsTemp, this.state);
            this.loading = false;
          }
        }
      )
    )
  }


  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.securityFunctionsTemp, this.state);
  }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.securityFunctionsTemp, this.state);

  }


  export() {
    if (this.securityFunctions.length != undefined && this.securityFunctions.length > 0) {
     let tempData = this.securityFunctions;
     let label = {
       'function': 'Function',
       'portalArea': 'Works Order Area',
     }
      this.helper.exportAsExcelFile(tempData, 'Security Functions for Role Type: ' + this.RoleType + ' - Job Role: '+ this.JobRole , label)
    } else {
      alert('There is no data to export');
    }
 }


  closeSecFunctionWindow()
  {
    this.securityFunctionWindow = false;
    this.closeSecurityFunctionWindow.emit(true)

  }


}

