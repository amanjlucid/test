import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataResult, process, State, SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { SharedService, ServicePortalService, AlertService, LoaderService } from '../../_services'

@Component({
  selector: 'app-service-service-attribute',
  templateUrl: './service-service-attribute.component.html',
  styleUrls: ['./service-service-attribute.component.css']
})
export class ServiceServiceAttributeComponent implements OnInit {
  readonly: boolean = true;
  subs = new SubSink();
  gridView: DataResult;
  selectedAsset: any;
  serviceAttrGridData: any;
  @Input() servicingDetails: any;
  @Output() closeServiceDetailsWin = new EventEmitter<boolean>();
  filter: CompositeFilterDescriptor;
  multiple = false;
  allowUnsort = true;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  serviceAttrProp: any = {
    Assid: "",
    contractor_Code: "",
    service_Contract_Code: "",
    Service_Type_Code: "",
    ASJNumber: "",
    Switch: "1"
  }
  currentUser: any;
  selectedServiceAttr: any;
  serviceAttrInfo: boolean = false;
  infoBtn: boolean = true;
  ignoreBtn: boolean = true;
  inactiveBtn: boolean = true;
  deleteBtn: boolean = true;
  addUpdateBtn: boolean = true;
  inactiveBtnName: string = "Set to Inactive";
  checkJobUpdateStatus: number = 1;

  constructor(
    private shareData: SharedService,
    private servicePortalService: ServicePortalService,
    private alertService: AlertService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.serviceAttrProp = {
      Assid: this.servicingDetails.assid,
      contractor_Code: this.servicingDetails.contractor_Code,
      service_Contract_Code: this.servicingDetails.service_Contract_Code,
      Service_Type_Code: this.servicingDetails.service_Type_Code,
      ASJNumber: this.servicingDetails.job_Number,
      Switch: "1"
    }
    this.getServiceAttributeGridData(this.serviceAttrProp);
    this.simJobUpdateStatus(this.servicingDetails.job_Number);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getServiceAttributeGridData(serviceAttrProp: any) {
    this.subs.add(
      this.servicePortalService.GetAssetServiceJobAttributes(serviceAttrProp).subscribe(
        data => {
          if (data.isSuccess) {
            this.serviceAttrGridData = data.data;
            this.gridView = process(this.serviceAttrGridData, this.state)
          }
        }
      )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.serviceAttrGridData, this.state);
  }

  filterGrid() {
    this.defaultStateForBtns();
    this.getServiceAttributeGridData(this.serviceAttrProp);
  }

  simJobUpdateStatus(jobNumber) {
    this.subs.add(
      this.servicePortalService.simJobUpdateStatus(jobNumber).subscribe(
        data => {
          if (data.isSuccess) {
            this.checkJobUpdateStatus = data.data;
            console.log(this.checkJobUpdateStatus);
          }
        }
      )
    )
  }

  updateServiceAttrStatus(process) {
    if (this.selectedServiceAttr == undefined) {
      this.alertService.error("Please select item from the grid.");
      return
    }
    let updateServiceAttrProp = {
      Assid: this.servicingDetails.assid,
      contractor_Code: this.servicingDetails.contractor_Code,
      service_Contract_Code: this.servicingDetails.service_Contract_Code,
      Service_Type_Code: this.servicingDetails.service_Type_Code,
      ASJNumber: this.servicingDetails.job_Number,
      ATAID: this.selectedServiceAttr.ataid,
      Process: process,
      Userid: this.currentUser.userId,
      Valid: '',
      Status: '',
      StatusDescription: '',
      StatusColour: ''
    }
    // call api if btn is not disabled
    if (!this.ignoreBtn && process == 1) {
      this.updateAssetAttributeStatus(updateServiceAttrProp);
    } else if (!this.inactiveBtn && process == 2) {
      this.updateAssetAttributeStatus(updateServiceAttrProp);
    } else if (!this.deleteBtn && process == 3) {
      this.updateAssetAttributeStatus(updateServiceAttrProp);
    } else if (!this.addUpdateBtn && process == 4) {
      this.updateAssetAttributeStatus(updateServiceAttrProp);
    } else {
      //console.log('out');
      return;
    }
    this.loaderService.pageShow();
    setTimeout(() => {
      this.getServiceAttributeGridData(this.serviceAttrProp);
      this.defaultStateForBtns();
      this.loaderService.pageHide();
    }, 1000);

  }

  updateAssetAttributeStatus(params) {
    this.subs.add(
      this.servicePortalService.UpdateAssetAttributeStatus(params).subscribe(
        data => {
          if (data.isSuccess == false) {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  defaultStateForBtns() {
    this.infoBtn = true;
    this.ignoreBtn = true;
    this.inactiveBtn = true;
    this.deleteBtn = true;
    this.addUpdateBtn = true;
    this.inactiveBtnName = "Set to Inactive";
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedServiceAttr = dataItem;
    this.defaultStateForBtns();
    if (this.selectedServiceAttr.attrInfoCount > 0) {
      this.infoBtn = false;
    }

    // check buttons enable and disable condition
    if (this.selectedServiceAttr.statusDesc == "Add Inactive Servicing Attribute") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.ignoreBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "Delete Servicing Attribute") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.ignoreBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "Ignore Servicing Attribute") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.deleteBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "Update Servicing Attribute") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.ignoreBtn = false;
        this.deleteBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "Add Servicing Attribute") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.ignoreBtn = false;
        this.inactiveBtnName = "Set to Add Inactive";
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "Asset Attribute Added") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.ignoreBtn = false;
        this.deleteBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "No Action") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
        this.inactiveBtnName = "Set to Add Inactive";
      } else {
        this.defaultStateForBtns();
      }
    } else if (this.selectedServiceAttr.statusDesc == "Servicing Attribute Updated") {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    } else {
      if (this.checkJobUpdateStatus == 0) {
        this.addUpdateBtn = false;
        this.inactiveBtn = false;
      } else {
        this.defaultStateForBtns();
      }
    }

  }

  openServiceAttrInfo() {
    if (this.selectedServiceAttr.attrInfoCount <= 0) {
      return
    }
    $('.serviceAttrCharBlur').addClass('ovrlay');
    this.serviceAttrInfo = true;
  }

  closeServiceAttrInfo($event) {
    $('.serviceAttrCharBlur').removeClass('ovrlay');
    this.serviceAttrInfo = $event;
  }

  closeServiceDetailWindow() {
    this.closeServiceDetailsWin.emit(false);
  }




}
