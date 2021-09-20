import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { SharedService, ServicePortalService, AlertService } from '../../_services'

@Component({
  selector: 'app-service-service-attr-info',
  templateUrl: './service-service-attr-info.component.html',
  styleUrls: ['./service-service-attr-info.component.css']
})
export class ServiceServiceAttrInfoComponent implements OnInit {
  @Input() servicingDetails: any;
  @Input() selectedServiceAttr: any;
  @Input() serviceAttrInfo: boolean = false;
  @Output() closeServiceAttrInfo = new EventEmitter<boolean>();
  readonly: boolean = true;
  public windowState = 'default'; //maximized
  public windowTop = '15';
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  gridView: DataResult;
  subs = new SubSink();
  serviceAttrProp: any;
  serviceAtteInfoData: any;


  constructor(
    private servicePortalService: ServicePortalService,
  ) { }

  ngOnInit() {
    this.serviceAttrProp = {
      Assid: this.servicingDetails.assid,
      contractor_Code: this.servicingDetails.contractor_Code,
      service_Contract_Code: this.servicingDetails.service_Contract_Code,
      Service_Type_Code: this.servicingDetails.service_Type_Code,
      ASJNumber: this.servicingDetails.job_Number,
      ATAID: this.selectedServiceAttr.ataid
    }
    this.getServiceAttrInfo(this.serviceAttrProp);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeServiceAttrInfoWin() {
    this.serviceAttrInfo = false;
    this.closeServiceAttrInfo.emit(this.serviceAttrInfo)
  }

  getServiceAttrInfo(params) {
    this.subs.add(
      this.servicePortalService.GetServiceAttrInfo(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.serviceAtteInfoData = data.data;
            this.gridView = process(this.serviceAtteInfoData, this.state)
            console.log(this.serviceAtteInfoData);
          }
        }
      )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.serviceAtteInfoData, this.state);
  }

}
