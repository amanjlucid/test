import { Component, OnInit, Input } from '@angular/core';
import { DataResult, process, State, SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { SharedService, ServicePortalService, HelperService } from '../../_services'
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-service-service-history',
  templateUrl: './service-service-history.component.html',
  styleUrls: ['./service-service-history.component.css']
})
export class ServiceServiceHistoryComponent implements OnInit {

  readonly: boolean = true;
  subs = new SubSink();
  gridView: DataResult;
  selectedAsset: any;
  @Input() servicingDetails: any;
  filter: CompositeFilterDescriptor;
  multiple = false;
  allowUnsort = true;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  serviceAttrProp: any = {
    Assid: "",
    contractor_Code: "",
    service_Contract_Code: "",
    ASJNumber: "",
  }
  serviceHistoryGridData: any;


  constructor(
    private helper: HelperService,
    private servicePortalService: ServicePortalService,
    
  ) { }

  ngOnInit() {
    // console.log(this.servicingDetails);
    this.serviceAttrProp = {
      Assid: this.servicingDetails.assid,
      contractor_Code: this.servicingDetails.contractor_Code,
      service_Contract_Code: this.servicingDetails.service_Contract_Code,
      ASJNumber: this.servicingDetails.job_Number,
    }
    this.getServiceHistoryGridData(this.serviceAttrProp);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getServiceHistoryGridData(serviceAttrProp: any) {
    this.subs.add(
      this.servicePortalService.GetAssetServiceJobHistory(serviceAttrProp).subscribe(
        data => {
          if (data.isSuccess) {
            let tempData = data.data;
            tempData.map(s => {
              s.history_Date = (s.history_Date != "") ? this.helper.formatDateTime(s.history_Date) : s.history_Date;
            });
            this.serviceHistoryGridData = tempData;
            this.gridView = process(this.serviceHistoryGridData, this.state)
          }
        }
      )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.serviceHistoryGridData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.serviceHistoryGridData, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    console.log("row");
  }

}
