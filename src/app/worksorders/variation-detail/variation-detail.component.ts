import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent, RowClassArgs } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-detail',
  templateUrl: './variation-detail.component.html',
  styleUrls: ['./variation-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationDetailComponent implements OnInit {
  @Input() openVariationDetail: boolean = false;
  @Input() openedFrom = 'worksorder';
  @Input() openedFor = 'details';
  @Input() singleVariationAsset: any = [];
  @Input() singleVariation: any = []; // for edit bulk variation
  @Output() closeVariationDetailEvent = new EventEmitter<boolean>();
  title = 'Works Order Variation Detail';
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
  variationDetailData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  filterToggle = false;
  worksOrderData: any;
  phaseData: any;
  deleteWorkReasonOpen = false;
  reason = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  selectedAssetDetail: any;
  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];
  
  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    
    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderUsrAccess = data[0];
          this.worksOrderAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )
    
    if (this.openedFor == "details") {
      this.getVariationPageDataWithGrid();
    }

    if (this.openedFor == "EBR") {
      this.getVariationAssetDetails();
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

  closeVariationDetail() {
    this.openVariationDetail = false;
    this.closeVariationDetailEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-variationalldetail-header').slideToggle();
    this.chRef.detectChanges();
  }

  getVariationAssetDetails() {
    const { wosequence, wopsequence, woisequence } = this.singleVariation;
    this.subs.add(
      this.workOrderProgrammeService.getWEBWorksOrdersPhaseDetailAndVariation(wosequence, wopsequence, woisequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.variationDetailData = data.data;
            this.gridView = process(this.variationDetailData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }

  getVariationPageDataWithGrid() {
    const { wosequence, wopsequence, woisequence, assid } = this.singleVariationAsset;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getWOInstructionSpecificAssetsDetails(wosequence, woisequence, assid),

      ]).subscribe(
        data => {
          // console.log(data);
          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;

          const variationData = data[2];

          if (variationData.isSuccess) {
            this.variationDetailData = variationData.data;
            this.gridView = process(this.variationDetailData, this.state);
          } else this.alertService.error(variationData.message);

          this.loading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationDetailData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationDetailData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationDetailData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationDetailData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedSingleVarWorkList = dataItem;
  }

  woMenuAccess(menuName) {
    if (this.userType == undefined) return true;

    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    }

    return this.worksOrderUsrAccess.indexOf(menuName) != -1

  }

  openDeleteWorkReasonWindow(item) {
    this.selectedAssetDetail = item;
    $('.variationAssetDetailOverlay').addClass('ovrlay');
    this.reason = '';
    this.deleteWorkReasonOpen = true;
    this.chRef.detectChanges();
  }

  closeDeleteWorkReasonWindo() {
    this.deleteWorkReasonOpen = false;
    $('.variationAssetDetailOverlay').removeClass('ovrlay')
  }

  setReason() {
    this.chRef.detectChanges();
    if (!this.reason || this.reason == '') {
      this.alertService.error("Please select refusal reason");
      return
    }

    this.deleteWork()
  }

  deleteWork() {
    if (this.singleVariation == undefined) {
      this.alertService.error('Variation not found');
      return;
    }

    const { wosequence, wopsequence, assid, wlcode, wlataid, wlplanyear, woadrechargeyn, atadescription } = this.selectedAssetDetail;
    const { woisequence } = this.singleVariation;

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
            this.alertService.success(`Work Item ${atadescription} deleted successfully.`);
            this.closeDeleteWorkReasonWindo();
            this.getVariationAssetDetails();
          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )


  }



  removeItemVariationConfirm(item) {
    this.selectedAssetDetail = item;
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `Remove Variation on ${item.atadescription}?`)
      .then((confirmed) => (confirmed) ? this.removeItemVariation(item) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  removeItemVariation(item) {
    const { wosequence, wopsequence, assid, wlcode, wlataid, wlplanyear, wostagesurcde, wochecksurcde } = item;
    const { woisequence } = this.singleVariation;

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
            this.getVariationAssetDetails();
          } else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )

  }


  rowCallback(context: RowClassArgs) {
    const { variationAction } = context.dataItem;
    if (variationAction.trim() != "") {
      return { notNew: true }
    } else {
      return { notNew: false }
    }

  }



}
