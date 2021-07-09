import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, WorksOrdersService, SharedService, WorksorderReportService, HelperService } from 'src/app/_services';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-wo-association-manage',
  templateUrl: './wo-association-manage.component.html',
  styleUrls: ['./wo-association-manage.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoAssociationsManageComponent implements OnInit {
  @Input() WoAssociationsManageWindow: boolean = false;
  @Output() WoAssociationsManageWindowEvent = new EventEmitter<boolean>();
  @Input() worksOrderData: any;

  subs = new SubSink();

  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  public filter: CompositeFilterDescriptor;
  pageSize = 25;
  title = 'Select Work Order Associations';


  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = true;

  gridData: any;
  gridView: DataResult;
  public mySelection: number[] = [];
  // selectedRows = [];
  ReasonAssociationWindow = false;
  AddAssociationWindow = false;
  reason = '';
  HeaderTitle = '';
  UpdateAssociationWindow = false;
  selectableSettings: SelectableSettings;
  selectedAssociationSingle: any;
  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  constructor(
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
    private worksOrderReportService: WorksorderReportService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
  ) {
    this.setSelectableSettings();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'multiple'
    };
  }

  ngOnInit(): void {
    this.subs.add(
      combineLatest([
        this.sharedService.worksOrdersAccess,
        this.sharedService.woUserSecObs,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderAccess = data[0];
          this.worksOrderUsrAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    if (this.worksOrderData.hasOwnProperty('name')) {
      this.worksOrderData.woname = this.worksOrderData.name;
    }

    this.GetWEBWorksOrdersAssociations();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData, this.state);
    this.chRef.detectChanges();
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.gridData, this.state);
    this.chRef.detectChanges();
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.gridData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.gridData.length
    };
    this.chRef.detectChanges();
  }

  cellClickHandler({
    sender,
    column,
    rowIndex,
    columnIndex,
    dataItem,
    originalEvent
  }) {

    if (originalEvent.ctrlKey == false) {
      if (this.mySelection.length > 0) {
        this.mySelection = [dataItem.wosequence];
        this.chRef.detectChanges();
      }
    }

    if (columnIndex > 1)
      this.selectedAssociationSingle = dataItem;
    //console.log('dataItem' + JSON.stringify(dataItem));
    //console.log(this.mySelection);
  }


  deleteAssociations(item = null) {
    if (item != null) this.mySelection = [item.wosequence];
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteAssociationsConfirmed(confirmed) : console.log(confirmed))
      .catch(() => console.log('User dismissed the dialog.'));
  }


  deleteAssociationsConfirmed(deleteConfirmed: boolean) {
    if (deleteConfirmed) {
      let params: any = {};
      params.WOSEQUENCE = this.worksOrderData.wosequence;
      params.iList = this.mySelection;
      params.strUserId = this.currentUser.userId;

      this.worksOrdersService.DeleteAssociation(params)
        .subscribe(
          data => {
            if (data.isSuccess) {
              let deletionResult = data.data[0];
              if (deletionResult.pRETURNSTATUS == "S") {
                this.alertService.success("Association Deleted successfully.")
                this.GetWEBWorksOrdersAssociations();
              } else {
                this.alertService.error(deletionResult.pRETURNMESSAGE);
              }
            }
          });
    }
  }


  updateAssociations(item = null) {
    this.reason = '';
    if (item != null) {
      this.selectedAssociationSingle = item;
      this.mySelection = [item.wosequence];
      this.reason = item.woassociationreason
    }

    this.HeaderTitle = 'Update Association';
    this.ReasonAssociationWindow = true;
    this.UpdateAssociationWindow = true;
    $('.woAssociationoverlay').addClass('ovrlay');
  }


  addAssociations(item = null) {
    this.reason = '';
    if (item != null) {
      this.selectedAssociationSingle = item;
      this.mySelection = [item.wosequence];
    }
    this.HeaderTitle = 'Add Association';
    this.ReasonAssociationWindow = true;
    this.AddAssociationWindow = true;
    $('.woAssociationoverlay').addClass('ovrlay');

  }

  AddAssociationSubmit() {
    let params: any = {};
    let callApi: any;

    params.WOSEQUENCE = this.worksOrderData.wosequence;
    params.iList = this.mySelection;
    params.Reason = this.reason;
    params.strUserId = this.currentUser.userId;

    callApi = this.worksOrdersService.AddAssociation(params);

    this.subs.add(
      callApi.subscribe(
        data => {
          if (data.isSuccess) {
            let responseResult = data.data[0];
            if (responseResult.pRETURNSTATUS == "S") {
              this.alertService.success("Association Added successfully.")
              this.ReasonAssociationWindow = true;
              this.AddAssociationWindow = true;
              this.closeAddUpdateAssociationWindow();
              this.GetWEBWorksOrdersAssociations();
            } else {
              this.alertService.error(responseResult.pRETURNMESSAGE);
            }
          }

        }
      )
    )



  }


  UpdateAssociationSubmit() {

    let params: any = {};
    let callApi: any;

    this.HeaderTitle = 'Add Association';
    params.WOSEQUENCE = this.worksOrderData.wosequence;
    params.iList = this.mySelection;
    params.Reason = this.reason
    params.strUserId = this.currentUser.userId;

    callApi = this.worksOrdersService.EditAssociation(params);

    this.subs.add(
      callApi.subscribe(
        data => {
          if (data.isSuccess) {
            let responseResult = data.data[0];
            if (responseResult.pRETURNSTATUS == "S") {
              this.alertService.success("Association Updated successfully.")
              this.ReasonAssociationWindow = true;
              this.UpdateAssociationWindow = true;
              this.closeAddUpdateAssociationWindow();
              this.GetWEBWorksOrdersAssociations();
            } else {
              this.alertService.error(responseResult.pRETURNMESSAGE);
            }
          }

        }
      )
    )



  }

  closeAddUpdateAssociationWindow() {
    this.ReasonAssociationWindow = false;
    this.AddAssociationWindow = false;
    this.UpdateAssociationWindow = false;
    $('.woAssociationoverlay').removeClass('ovrlay');
  }

  closeWoAssociationsManageWindow() {
    this.WoAssociationsManageWindow = false;
    this.WoAssociationsManageWindowEvent.emit(this.WoAssociationsManageWindow);
  }


  GetWEBWorksOrdersAssociations() {
    const params = {
      "wosequence": this.worksOrderData.wosequence
    };
    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    this.subs.add(
      this.worksOrdersService.GetWEBWorksOrdersAssociations(qs).subscribe(
        data => {
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
          } else {
            this.alertService.error(data.message);
          }

          this.loading = false
          this.chRef.detectChanges();

        },
        err => this.alertService.error(err)
      )
    )

  }


  WOCreateXportOutputReport(xPortId, reportName) {
    const { wosequence } = this.worksOrderData
    let params = {
      "intXportId": xPortId,
      "lstParamNameValue": ["Works Order Number", wosequence],
      "lngMaxRows": 40000
    };
    if (xPortId == 587 || xPortId == 588) {
      params.lstParamNameValue = ["Master Works Order", wosequence];
    }

    this.worksOrderReportService.WOCreateXportOutput(params).subscribe(
      (data) => {
        const { columns, rows } = data[0];
        const tempCol = columns.map(x => x.columnName);
        const tempRow = rows.map(x => x.values);
        let result: any;
        let label: any;

        if (tempRow.length > 0) {
          result = tempRow.map(x => x.reduce(function (result, field, index) {
            var fieldKey = tempCol[index].replace(new RegExp(" ", 'g'), "");
            result[fieldKey] = field;
            return result;
          }, {}));

          label = tempCol.reduce(function (result, field) {
            var fieldKey = field.replace(new RegExp(" ", 'g'), "");
            result[fieldKey] = field;
            return result;
          }, {});

          let fileName = reportName + " " + wosequence;
          this.helperService.exportAsExcelFile(result, fileName, label);
        } else {
          this.alertService.error("No Record Found.");
        }
        this.chRef.detectChanges();
      },
      error => this.alertService.error(error)
    )
    
  }


  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
  }



}
