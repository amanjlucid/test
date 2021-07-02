import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService} from 'src/app/_services';
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
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
  workorderAssetFullDetail: any;
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

  //asset Defect
  openAssetDefect = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private helperService: HelperService
  ) {
    this.setSelectableSettings();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    if (this.openedFrom == "workdetail" || this.openedFrom == "workorder") {
      this.title = 'Defects';
    }

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
        this.workOrderProgrammeService.specificWorkOrderAssets(wosequence, assid, wopsequence),
      ];
    }

    else if (this.openedFrom == "workdetail" || this.openedFrom == "workorder") {
      const { wprsequence, wosequence } = this.singleWorkOrderInp;
      pageReq = [
        this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
      ];
    }

    this.subs.add(
      forkJoin(pageReq).subscribe(
        (data: any) => {
          const programmeData = data[0];
          const worksOrderData = data[1];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;

          if (this.openedFrom == "assetchecklist") {
            const phaseData = data[2];
            const workorderAsset = data[3];
            const workorderAssetFullDetail = data[4];
            if (phaseData.isSuccess) this.phaseData = phaseData.data;
            if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];
            if (workorderAssetFullDetail) this.workorderAssetFullDetail = workorderAssetFullDetail.data[0];
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
    } else if (this.openedFrom == "workdetail" || this.openedFrom == "workorder") {
      const { wprsequence, wosequence } = this.singleWorkOrderInp;
      woDefectsApiCall = this.workOrderProgrammeService.getWEBWorksOrdersDefectsForProgrammeAndUserSingleWO(wprsequence, wosequence, this.currentUser.userId);
    } else {
      this.alertService.error("No Access");
      return;
    }

    this.subs.add(
      woDefectsApiCall.subscribe(
        data => {
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
            this.selectedSingleDefect = undefined;
            this.mySelection = [];
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

  cellClickHandler({ dataItem }) {
    this.selectedSingleDefect = dataItem;
  }

  openDefectForm(mode: string, item = null) {
    this.selectedSingleDefect = item;
    this.defectFormMode = mode;

    let woassstatus;
    if (this.openedFrom == "assetchecklist") {
      if (this.workorderAssetFullDetail == undefined) return;
      woassstatus = this.workorderAssetFullDetail.woassstatus;
    } else {
      //from workorder list 
      woassstatus = item.woassstatus;
    }

    if (woassstatus != "Handover" && woassstatus != "Final Completion") return;
    $('.defectListoverlay').addClass('ovrlay');
    this.openDefectform = true;

  }

  closeDefectForm(event) {
    this.openDefectform = event;
    $('.defectListoverlay').removeClass('ovrlay');
    this.requiredPageData();
  }


  confirm(item, confirmType = "signOff") {
    $('.k-window').css({ 'z-index': 1000 });
    if (confirmType == "signOff") {
      this.confirmationDialogService.confirm('Please confirm..', 'Signoff selected defects ?')
        .then((confirmed) => (confirmed) ? this.signOff(item) : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      if (item.wodstatus != 'New') return;

      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.deleteDefect(item) : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    }

  }


  signOff(item) {
    const { assid, wprsequence, wosequence, wopsequence, wodsequence } = item;
    const params = {
      wprsequence: wprsequence,
      wosequence: wosequence,
      assId: assid,
      wopsequence: wopsequence,
      wodsequence: wodsequence,
      userId: this.currentUser.userId,
    }

    this.subs.add(
      this.workOrderProgrammeService.signOffDefect(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Defect Signed off successfully");
            this.requiredPageData();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }

  deleteDefect(item) {
    const { assid, wprsequence, wosequence, wopsequence, wodsequence } = item;
    const params = {
      wprsequence: wprsequence,
      wosequence: wosequence,
      assId: assid,
      wopsequence: wopsequence,
      wodsequence: wodsequence,
    }

    this.subs.add(
      this.workOrderProgrammeService.deleteWorksOrderDefect(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Defect deleted successfully");
            this.requiredPageData();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )
  }


  woMenuBtnSecurityAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
  }


  openAssetDefectsMethod(item) {
    this.selectedSingleDefect = item;
    $('.defectListoverlayAsset').addClass('ovrlay');
    this.openAssetDefect = true;
  }

  closeDefectList(eve) {
    this.openAssetDefect = eve;
    $('.defectListoverlayAsset').removeClass('ovrlay');
    this.requiredPageData();
  }

}
