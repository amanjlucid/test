import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'app-variation-fees',
  templateUrl: './variation-fees.component.html',
  styleUrls: ['./variation-fees.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationFeesComponent implements OnInit {
  @Input() openFees: boolean = false;
  @Input() selectedVariationInp: any;
  @Input() selectedSingleVariationAssetInp: any;
  @Input() openedFrom = 'assetchecklist';
  @Input() openedFor = 'details';
  @Output() closeFeesEvent = new EventEmitter<boolean>();
  title = 'Variation Fees';
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  variationFeesData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  selectedSingleFees: any;
  openChangeFee = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private helperService : HelperService
  ) {
    this.setSelectableSettings()
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
      this.title = `Variation Fees: ${this.selectedSingleVariationAssetInp?.woiissuereason} (${this.selectedSingleVariationAssetInp?.wopsequence})`;
    }

    this.getVariationFees();

  }

  closeFees() {
    this.openFees = false;
    this.closeFeesEvent.emit(false);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  validateForProcess(dataItem, process){

    let res = true
    const params = {
      WOSEQUENCE: dataItem.wosequence,
      WOISEQUENCE: dataItem.woisequence,
      Process: process,
      UserID: this.currentUser.userId,
    }

    this.subs.add(
      this.workOrderProgrammeService.worksOrdersCheckVariationValidForProcess(params).subscribe(
        data => {
          if (data.isSuccess) {
            if(process == 'ChangeFee'){
              this.openChangeFeeMethod(dataItem)
            } else if (process == 'RemoveFee'){
              this.removeFeeVariation(dataItem)
            } else if (process == ''){
              this.alertService.error('Process Not Validated')
            }
          } else {
            this.alertService.error(data.message)
          }
        }, err => this.alertService.error(err)
      )
    )


  }


  rowCallback(context: RowClassArgs) {
    const { woacpendingfee, woiadcomment } = context.dataItem;
    if (woacpendingfee != 0 && woiadcomment != "") {
      return { notNew: true }
    } else {
      return { notNew: false }
    }

  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  getVariationFees() {

    const { wosequence, assid, wopsequence, woisequence } = this.selectedSingleVariationAssetInp;

    this.subs.add(
      this.workOrderProgrammeService.getWEBWorksOrdersAssetChecklistAndVariation(wosequence, wopsequence, woisequence, assid).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.variationFeesData = data.data;
            this.gridView = process(this.variationFeesData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)

      )
    )

  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationFeesData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationFeesData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationFeesData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationFeesData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleFees = dataItem;
  }


  openChangeFeeMethod(item) {
    this.selectedSingleFees = item;
    $('.variationFeeOvrlay').addClass('ovrlay');
    this.openChangeFee = true;
    this.chRef.detectChanges();
  }

  closeVariationFeeMethod(eve) {
    this.openChangeFee = eve;
    $('.variationFeeOvrlay').removeClass('ovrlay');
    this.getVariationFees();
  }

  disableGridRowMenu(btnname, item) {
    return false;
  }

  removeFeeVariation(item) {
    const { wosequence, wopsequence, assid, wostagesurcde, wochecksurcde } = item;
    const { woisequence } = this.selectedSingleVariationAssetInp;
    let params = {
      WOSEQUENCE: wosequence,
      WOISEQUENCE: woisequence,
      ASSID: assid,
      WOPSEQUENCE: wopsequence,
      WLCODE: 0,
      WLATAID: 0,
      WLPLANYEAR: 0,
      WOSTAGESURCDE: wostagesurcde,
      WOCHECKSURCDE: wochecksurcde,
      UserID: this.currentUser.userId,
    }

    // debugger;
    // return;
    this.workOrderProgrammeService.wORemoveInstructionAssetDetail(params).subscribe(
      data => {
        if (data.isSuccess) {
          this.alertService.success(`Work Item removed successfully.`);
          this.getVariationFees();
        } else this.alertService.error(data.message);
      }, err => this.alertService.error(err)
    )


  }


  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.worksOrderUsrAccess, menuName)
  }


}
