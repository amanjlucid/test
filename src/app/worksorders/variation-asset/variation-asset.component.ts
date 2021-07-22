import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-asset',
  templateUrl: './variation-asset.component.html',
  styleUrls: ['./variation-asset.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationAssetComponent implements OnInit {
  @Input() openVariationAsset: boolean = false;
  @Input() openedFrom = 'worksorder';
  @Input() selectedVariationInp: any;
  @Input() selectedWOInp: any;
  @Output() closeVariationAssetEvent = new EventEmitter<boolean>();
  @Output() refreshParentComponent = new EventEmitter<boolean>();

  title = 'Variations Assets';
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

  variationData: any;
  gridView: DataResult;
  loading = true
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];

  filterToggle = false;
  worksOrderData: any;
  phaseData: any;
  programData: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  selectedSingleVariationAsset: any;
  openVariationWorkList: boolean = false;
  formMode = 'new'
  openedFor = 'details'
  openVariationDetail = false;

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) {
    this.setSelectableSettings();
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

    this.getVariationPageDataWithVariationAssetFromWO()
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

  closeVariationAsset() {
    this.openVariationAsset = false;
    this.closeVariationAssetEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-variationasset-header').slideToggle();
    this.chRef.detectChanges();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.variationData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.variationData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.variationData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.variationData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleVariationAsset = dataItem;
  }

  getVariationPageDataWithVariationAssetFromWO() {
    const { wosequence, wopsequence, woisequence } = this.selectedVariationInp;
    const { wprsequence } = this.selectedWOInp;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
        this.workOrderProgrammeService.getWOInstructionAssets(wosequence, woisequence),
      ]).subscribe(
        data => {
          // console.log(data)
          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;
          this.programData = data[2].data[0];

          // variation asset data and grid render
          const variationAssetdata = data[3];
          // console.log({ varasset: variationAssetdata.data });

          if (variationAssetdata.isSuccess) {
            this.variationData = variationAssetdata.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(variationAssetdata.message);

          this.loading = false;
          this.chRef.detectChanges();
        }
      )
    )
  }

  accetpVariationAsset(item, checkOrProcess = "C") {
    if (this.disableVariationBtns('Accept', item)) {
      this.alertService.error("Error");
      return;
    }

    const { wosequence, wopsequence, woisequence } = this.selectedVariationInp;
    const params: any = {};
    params.WOSEQUENCE = wosequence;
    params.WOPSEQUENCE = wopsequence;
    params.WOISEQUENCE = woisequence;
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;
    params.strASSID = [item.assid];

    this.subs.add(
      this.workOrderProgrammeService.worksOrderAcceptVariation(params).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            let resp: any;
            if (data.data[0] == undefined) {
              resp = data.data;
            } else {
              resp = data.data[0];
            }

            if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
              this.openConfirmationDialog(item, resp)
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.getVariationPageDataWithVariationAssetFromWO();
              // this.refreshParentComponent.emit(true)
            }


          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )


  }


  openConfirmationDialog(item, res) {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') return
          this.accetpVariationAsset(item, checkstatus)
        }
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }



  editVariation(item) {
    this.selectedSingleVariationAsset = item;
    $('.variationAssetListOverlay').addClass('ovrlay');
    this.openedFor = 'edit'
    this.openVariationWorkList = true;
  }

  closeVariationDetails(eve) {
    this.openVariationWorkList = eve;
    $('.variationAssetListOverlay').removeClass('ovrlay');
  }


  disableVariationBtns(btnType, item) {

    if (btnType == 'Edit') {
      if (this.selectedVariationInp.responsibility == "ALL" && (this.selectedVariationInp.woiissuestatus == "Contractor Review" || this.selectedVariationInp.woiissuestatus == "Customer Review" || this.selectedVariationInp.woiissuestatus == "New")) {
        return false
      }
      if (this.selectedVariationInp.responsibility == "CONTRACTOR" && this.selectedVariationInp.woiissuestatus == "Contractor Review") {
        return false
      }
      if (this.selectedVariationInp.responsibility == "CLIENT" && (this.selectedVariationInp.woiissuestatus == "Customer Review" || this.selectedVariationInp.woiissuestatus == "New")) {
        return false
      }

    } else if (btnType == 'Accept') {
      if (this.selectedVariationInp.woiissuestatus == "Issued" && this.selectedVariationInp.responsibility == "ALL" && item.woiaissuestatus != "Accepted") {
        return false;
      }
    }

    if (btnType == 'Details') {
      if (this.selectedVariationInp.isEmptyVariation == "N") {
        return false;
      }
    }

    return true;

  }

  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
    // if (this.userType == undefined) return true;
    // if (this.userType?.wourroletype == "Dual Role") {
    //   return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    // }
    // return this.worksOrderUsrAccess.indexOf(menuName) != -1
  }

  openVariationDetailMethod() {
    this.openedFor = 'details';
    $('.variationAssetListOverlay').addClass('ovrlay');
    this.openVariationDetail = true;
  }

  closeVarDetails(eve) {
    this.openVariationDetail = eve;
    $('.variationAssetListOverlay').removeClass('ovrlay');
    // this.getAllVariations();
  }

}
