import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

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
  variationFeesData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  selectedSingleFees: any;
  openChangeFee = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings()
  }

  ngOnInit(): void {
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

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  getVariationFees() {

    const { wosequence, assid, wopsequence, woisequence } = this.selectedSingleVariationAssetInp;

    this.subs.add(
      this.workOrderProgrammeService.getWEBWorksOrdersAssetChecklistAndVariation(wosequence, wopsequence, woisequence,assid).subscribe(
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
    const { wosequence, wopsequence, assid, woisequence, wostagesurcde, wochecksurcde } = item;

    this.workOrderProgrammeService.getWEBWorksOrdersAssetDetailAndVariation(wosequence, wopsequence, assid).subscribe(
      data => {
      
        if (data.data.length > 0) {
          const variaton = data.data[0];
          const { wlcode, wlataid, wlplanyear } = variaton;

          let params = {
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

          this.workOrderProgrammeService.wORemoveInstructionAssetDetail(params).subscribe(
            data => {
              if (data.isSuccess) {
                this.alertService.success(`Work Item removed successfully.`);
                this.getVariationFees();
              } else this.alertService.error(data.message);
            }, err => this.alertService.error(err)
          )

        } else {
          this.alertService.error("Something went wrong.")
        }
      }
    )



  }



}
