import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataResult, process, State, SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { SharedService, ServicePortalService, ConfirmationDialogService, AlertService } from '../../_services'
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-service-service-info',
  templateUrl: './service-service-info.component.html',
  styleUrls: ['./service-service-info.component.css']
})
export class ServiceServiceInfoComponent implements OnInit {
  readonly: boolean = true;
  subs = new SubSink();
  gridView: DataResult;
  @Input() servicingDetails: any;
  filter: CompositeFilterDescriptor;
  multiple = false;
  allowUnsort = true;
  state: State = {
    skip: 0,
    sort: [{
      field: 'service_Info',
      dir: 'asc'
    }],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  serviceInfoGrid: any;
  editBtnDisabled: boolean = true;
  deleteBtnDisabled: boolean = true;
  openAddEditInfo: boolean = false;
  selectedServiceInfo: any;
  serviceInfo: any;
  @Output() closeServiceDetailsWin = new EventEmitter<boolean>();


  constructor(
    private servicePortalService: ServicePortalService,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.serviceInfo = {
      Assid: this.servicingDetails.assid,
      Service_Type_Code: this.servicingDetails.service_Type_Code
    }
    this.getServiceInfoData(this.serviceInfo);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getServiceInfoData(params: any) {
    this.subs.add(
      this.servicePortalService.GetAssetServiceJobInfo(params).subscribe(
        data => {
          this.serviceInfoGrid = data.data;
          this.gridView = process(this.serviceInfoGrid, this.state)
        }
      )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.serviceInfoGrid, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.serviceInfoGrid, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedServiceInfo = dataItem;
    this.editBtnDisabled = false;
    this.deleteBtnDisabled = this.selectedServiceInfo.itemExists == "Y" ? false : true;
  }

  openAddEditInfoMethod() {
    $('.editServiceInfo').addClass('ovrlay')
    this.openAddEditInfo = true;
  }

  closeAddEditInfo($event) {
    this.editBtnDisabled = true;
    this.deleteBtnDisabled = true;
    this.getServiceInfoData(this.serviceInfo);
    $('.editServiceInfo').removeClass('ovrlay')
    this.openAddEditInfo = $event;
  }

  closeServiceDetailWindow(){
    this.closeServiceDetailsWin.emit(false);
  }

  deleteInfo() {
    const serviceInfo = {
      Assid: this.servicingDetails.assid,
      Service_Type_Code: this.servicingDetails.service_Type_Code,
      ServiceInfoCode: this.selectedServiceInfo.service_Info,
      Valid: ''
    }
    this.subs.add(
      this.servicePortalService.DeleteServiceJobInfo(serviceInfo).subscribe(
        data => {
          if (data.isSuccess) {
            this.getServiceInfoData(this.serviceInfo);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  openConfirmationDialog() {
    if (this.selectedServiceInfo != undefined) {
      $('.k-window-wrapper').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Delete service info item ?')
        .then((confirmed) => (confirmed) ? this.deleteInfo() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error('Please select one service info');
    }

  }

}
