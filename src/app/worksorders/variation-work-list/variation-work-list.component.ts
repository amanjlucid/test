import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-work-list',
  templateUrl: './variation-work-list.component.html',
  styleUrls: ['./variation-work-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationWorkListComponent implements OnInit {
  @Input() openVariationWorkList: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() openedFor = 'details';
  @Input() selectedVariationInp: any = [];
  @Input() selectedSingleVariationAssetInp: any
  @Output() closeWorkListEvent = new EventEmitter<boolean>();
  title = '';
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  variationWorkListData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  selectedSingleVarWorkList: any;
  openFees = false;
  openadditionalWork = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  SetToRefusalWindow = false;
  refusalCodeList: any;
  reason: any;
  reasonWindowtitle = 'Select the Refusal Reason'
  reasonWindowFor = 'refusal';
  EditWorkPackageQtyCostWindow = false;

  // @Input() singleVariation: any; // need to remove

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private worksOrdersService: WorksOrdersService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    console.log({ openfor: this.openedFor, from: this.openedFrom, variation: this.selectedVariationInp, asset: this.selectedSingleVariationAssetInp })

    if (this.openedFor == "details" && this.openedFrom == "assetchecklist") {
      const { woiissuereason, woisequence } = this.selectedSingleVariationAssetInp
      this.title = `Variation: ${woiissuereason} (${woisequence})`;
      this.getVariationWorkList();
    } else if ((this.openedFor == "edit" || this.openedFor == "append")  && (this.openedFrom == "assetchecklist" || this.openedFrom == "worksorder")) {
      this.title = `Edit Work List Variation Items`;
      this.getVariationWorkList();
    }

  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }


  disableGridRowMenu(btnname, item) {
    return false;
    // if(btnname == 'Change Cost'){
    //   return item.woadstatus 
    // }
    //dataItem.woadstatus != 'New'
    //dataItem.variationAction == 'Remove Work Item'
  }

  getVariationWorkList() {

    const { wosequence, wopsequence, assid } = this.selectedSingleVariationAssetInp;
    

    this.subs.add(
      this.workOrderProgrammeService.getWEBWorksOrdersAssetDetailAndVariation(wosequence, wopsequence, assid).subscribe(
        data => {
          console.log(data);
          // console.table(data.data);
          if (data.isSuccess) {
            this.variationWorkListData = data.data;
            this.gridView = process(this.variationWorkListData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)

      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationWorkListData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationWorkListData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationWorkListData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationWorkListData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleVarWorkList = dataItem;
  }

  closeWorkList() {
    this.openVariationWorkList = false;
    this.closeWorkListEvent.emit(false);
  }

  openFeesMethod() {
    $('.variationWorkListOverlay').addClass('ovrlay')
    this.openFees = true;
  }

  closeOpenFees(eve) {
    this.openFees = eve;
    $('.variationWorkListOverlay').removeClass('ovrlay')
    this.getVariationWorkList();
  }

  openAdditionalWorkItem() {
    $('.variationWorkListOverlay').addClass('ovrlay')
    this.openadditionalWork = true
  }

  closeAdditionalWorkItem(eve) {
    this.openadditionalWork = eve;
    $('.variationWorkListOverlay').removeClass('ovrlay')
    this.getVariationWorkList();
  }


  rechargeToggle(item, recharge) {
    if (item.woadstatus != 'New') {
      this.alertService.error("No Access");
      return
    }

    const { wosequence, woisequence, wopsequence, assid, wlcode, wlataid, wlplanyear, wostagesurcde, wochecksurcde, woadrechargeyn } = item;

    const params = {
      WOSEQUENCE: wosequence,
      WOISEQUENCE: woisequence,
      ASSID: assid,
      WOPSEQUENCE: wopsequence,
      WLCODE: wlcode,
      ATAID: wlataid,
      PlanYear: wlplanyear,
      WOSTAGESURCDE: wostagesurcde,
      WOCHECKSURCDE: wochecksurcde,
      UserID: this.currentUser.userId,
      Recharge: woadrechargeyn == 'N' ? 'Y' : 'N',
    }


    this.subs.add(
      this.worksOrdersService.rechargeToggleVariation(params).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            let success_msg = "Recharge Successfully Set";
            if (!recharge) {
              success_msg = "Recharge Successfully Cleared";
            }
            this.alertService.success(success_msg);

            this.getVariationWorkList();

          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )

  }


  deleteWorkConfirm(item) {
    this.selectedSingleVarWorkList = item;
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `Remove Work Item ${item.atadescription}?`)
      .then((confirmed) => (confirmed) ? this.openDeleteWorkReasonWindow() : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  openDeleteWorkReasonWindow() {
    $('.variationWorkListOverlay').addClass('ovrlay');
    this.reasonWindowtitle = 'Edit Comment for Works Order Instruction Asset Detail'
    this.reasonWindowFor = 'deletework';
    this.SetToRefusalWindow = true;
    this.chRef.detectChanges();
  }


  deleteWork(item) {
    const { wosequence, woisequence, wopsequence, assid, wlcode, wlataid, wlplanyear, woadrechargeyn } = item;

    const params = {
      WOSEQUENCE: wosequence,
      WOISEQUENCE: woisequence,
      strASSID: assid,
      WOPSEQUENCE: wopsequence,
      WLCODE: wlcode,
      WLATAID: wlataid,
      WLPLANYEAR: wlplanyear,
      strWOIADCOMMENT: this.reason,
      strUser: this.currentUser.userId,
      Recharge: woadrechargeyn,
    }


    this.subs.add(
      this.workOrderProgrammeService.worksOrdersCreateVariationForRemoveWOAD(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`Work Item ${item.atadescription} deleted successfully.`);
            this.getVariationWorkList();
          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )


  }




  setReason() {
    this.chRef.detectChanges();

    if (!this.reason || this.reason == '') {
      this.alertService.error("Please select refusal reason");
      return
    }

    this.closeSetToRefusalWindow();

    if (this.reasonWindowFor == 'refusal') {
      this.SetToRefusalSave(this.selectedSingleVarWorkList, true)
    } else if (this.reasonWindowFor == 'deletework') {
      this.deleteWork(this.selectedSingleVarWorkList)
    }

  }

  openRefusalReason(item) {
    this.selectedSingleVarWorkList = item;
    $('.variationWorkListOverlay').addClass('ovrlay')
    this.reasonWindowtitle = 'Select the Refusal Reason'
    this.reasonWindowFor = 'refusal';
    this.SetToRefusalWindow = true;
    const param = "ClearRefusal=false";
    this.subs.add(
      this.worksOrdersService.WorkOrderRefusalCodes(param).subscribe(
        data => {
          if (data.isSuccess) this.refusalCodeList = data.data;
          else this.alertService.error(data.message);
          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }

  closeSetToRefusalWindow() {
    this.SetToRefusalWindow = false;
    $('.variationWorkListOverlay').removeClass('ovrlay')
  }

  clearRefusal(item) {
    this.selectedSingleVarWorkList = item;
    this.SetToRefusalSave(item, false)
  }


  SetToRefusalSave(item, refusal = true) {
    const { wosequence, woisequence, wopsequence, assid, wlcode, wlataid, wlplanyear, wostagesurcde, wochecksurcde } = item;

    const params = {
      WOSEQUENCE: wosequence,
      WOISEQUENCE: woisequence,
      ASSID: assid,
      WOPSEQUENCE: wopsequence,
      WLCODE: wlcode,
      ATAID: wlataid,
      PlanYear: wlplanyear,
      WOSTAGESURCDE: wostagesurcde,
      WOCHECKSURCDE: wochecksurcde,
      UserID: this.currentUser.userId,
      Refusal: refusal ? this.reason : '',
    }


    this.subs.add(
      this.worksOrdersService.refusalToggleVariation(params).subscribe(
        data => {
          if (data.isSuccess) {
            let success_msg = "Refusal Successfully Set";
            if (!refusal) success_msg = "Refusal Successfully Cleared";
            this.alertService.success(success_msg);
            this.getVariationWorkList();
          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )


  }


  openEditWorkPackageQtyCostWindow(item) {
    this.selectedSingleVarWorkList = item;
    $('.variationWorkListOverlay').addClass('ovrlay')
    this.EditWorkPackageQtyCostWindow = true;

  }

  closeEditWorkPackageQtyCostWindow() {
    this.EditWorkPackageQtyCostWindow = false;
    $('.variationWorkListOverlay').removeClass('ovrlay');
    this.getVariationWorkList();
  }

  removeItemVariationConfirm(item) {
    this.selectedSingleVarWorkList = item;
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `Remove Variation on ${item.atadescription}?`)
      .then((confirmed) => (confirmed) ? this.removeItemVariation(item) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  removeItemVariation(item) {
    const { wosequence, woisequence, wopsequence, assid, wlcode, wlataid, wlplanyear, wostagesurcde, wochecksurcde } = item;

    const params = {
      WOSEQUENCE: wosequence,
      WOISEQUENCE: woisequence,
      ASSID: assid,
      WOPSEQUENCE: wopsequence,
      WLCODE: wlcode,
      WLATAID: wlataid,
      WLPLANYEAR: wlplanyear,
      WOSTAGESURCDE: wostagesurcde,
      WOCHECKSURCDE: wochecksurcde,
      UserID: this.currentUser.userId,
    }

    this.subs.add(
      this.workOrderProgrammeService.wORemoveInstructionAssetDetail(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`Work Item ${item.atadescription} removed successfully.`);
            this.getVariationWorkList();
          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )

  }


  replaceService(item) {
    this.selectedSingleVarWorkList = item;
    const { wosequence, woisequence, wopsequence, assid, wlcode, wlataid, wlplanyear, wostagesurcde, wochecksurcde, woadrechargeyn } = item;
    let params = {
      WOSEQUENCE: wosequence,
      WOPSEQUENCE: wopsequence,
      WOISEQUENCE: woisequence,
      ASSID: assid,
      WLCODE: wlcode,
      WLATAID: wlataid,
      WLPLANYEAR: wlplanyear,
      WLATAID2: '',
      WLPLANYEAR2: '',
      WOSTAGE: wostagesurcde,
      WOCHECK: wochecksurcde,
      WORKCOST: '',
      COMMENT: '',
      QUANTITY: '',
      UOM: '',
      WPHCODE: '',
      RECHARGE: woadrechargeyn,
      strUserId: this.currentUser.userId,

    };

    this.subs.add(
      this.workOrderProgrammeService.createVariationForSIMReplacement(params).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {

          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )
  }



}
