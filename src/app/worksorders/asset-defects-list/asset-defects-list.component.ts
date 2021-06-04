import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { combineLatest, forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-asset-defects-list',
  templateUrl: './asset-defects-list.component.html',
  styleUrls: ['./asset-defects-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})


export class AssetDefectsListComponent implements OnInit {
  @Input() openDefectsList: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() singleWorkOrderAssetInp: any = [];
  @Input() singleWorkOrderInp: any = [];
  @Output() closeDefectsListEvent = new EventEmitter<boolean>();

  title = 'Show Defects for Asset';
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

  filterToggle = false;
  programmeData: any;
  worksOrderData: any;
  phaseData: any;
  workorderAsset: any;
  selectableSettings: SelectableSettings;
  gridView: DataResult;
  gridLoading = true
  pageSize = 25;
  gridData: any;
  mySelection: any[] = [];

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];
  defectFormMode = 'new';
  openDefectform = false;
  selectedSingleDefect: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private worksOrderService: WorksOrdersService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) {
    this.setSelectableSettings();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    console.log({ openedFrom: this.openedFrom, singleWorkOrderInp: this.singleWorkOrderInp, singleWorkOrderAssetInp: this.singleWorkOrderAssetInp, })
    // console.log(this.singleWorkOrderAssetInp)
    // console.log(this.singleWorkOrderInp);

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

    this.requiredPageData();
  }

  closeDefectlist() {
    this.openDefectsList = false;
    this.closeDefectsListEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-defectlist-header').slideToggle();
    this.chRef.detectChanges();
  }

  requiredPageData() {
    let pageReq = [];

    if (this.openedFrom == "assetchecklist") {
      const { wprsequence, wosequence, wopsequence, assid } = this.singleWorkOrderAssetInp;
      pageReq = [
        this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getAssetAddressByAsset(assid),
      ];
    }

    else if (this.openedFrom == "workdetail") {
      const { wprsequence, wosequence } = this.singleWorkOrderInp;
      pageReq = [
        this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
      ];
    }

    this.subs.add(
      forkJoin(pageReq).subscribe(
        (data: any) => {
          console.log(data);
          const programmeData = data[0];
          const worksOrderData = data[1];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;

          if (this.openedFrom == "assetchecklist") {
            const phaseData = data[2];
            const workorderAsset = data[3];
            if (phaseData.isSuccess) this.phaseData = phaseData.data;
            if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];

          }

          this.getDefectList();

        }
      )
    )
  }


  getDefectList() {
    let woDefectsApiCall: Observable<any>;

    if (this.openedFrom == "assetchecklist") {
      const { wosequence, wopsequence, assid } = this.singleWorkOrderAssetInp;
      woDefectsApiCall = this.workOrderProgrammeService.workOrderDefectForAssets(wosequence, assid, wopsequence);
    } else if (this.openedFrom == "workdetail") {

    } else {
      this.alertService.error("No Access");
      return;
    }

    this.subs.add(
      woDefectsApiCall.subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
          } else this.alertService.error(data.message)
          
          this.gridLoading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)

      )
    )
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.gridData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.gridData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.gridData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleDefect = dataItem;
  }

  woMenuAccess(menuName: string) {
    if (this.userType == undefined) return true;

    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    }

    return this.worksOrderUsrAccess.indexOf(menuName) != -1

  }


  openDefectForm(mode: string, item = null) {
    $('.defectListoverlay').addClass('ovrlay');
    this.defectFormMode = mode;
    this.selectedSingleDefect = item;
    this.openDefectform = true;
  }

  closeDefectForm(event) {
    this.openDefectform = event;
    $('.defectListoverlay').removeClass('ovrlay');
  }

}
