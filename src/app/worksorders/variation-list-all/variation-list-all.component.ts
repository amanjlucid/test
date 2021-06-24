import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, SharedService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-list-all',
  templateUrl: './variation-list-all.component.html',
  styleUrls: ['./variation-list-all.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationListAllComponent implements OnInit {
  @Input() openVariationListAll: boolean = false;
  @Input() openedFrom = 'worksorder';
  @Input() singleWorksOrder: any = [];
  @Output() closeVariationAllListEvent = new EventEmitter<boolean>();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  title = 'Variations';
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

  openVariationAsset = false;
  opneBlankVariation = false;

  filterToggle = false;
  selectedSingleInstructionVariation: any;
  openVariationDetail: boolean = false;
  openedFor = 'details'

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private worksOrderService: WorksOrdersService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private helperService : HelperService
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

    // this.getUserWOSecurityData();
    this.getAllVariations();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  refreshComponent(event) {
    if (event) this.getAllVariations();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  closeVariationListAll() {
    this.openVariationListAll = false;
    this.closeVariationAllListEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-variationall-header').slideToggle();
    this.chRef.detectChanges();
  }

  getUserWOSecurityData() {
    const { wprsequence, wosequence } = this.singleWorksOrder;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getVW_WOUserSecurity(this.currentUser.userId, wosequence, wprsequence),
        // this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
      ]).subscribe(
        data => {
          console.log(data);
          // let sec = data[0].data.map(x => `${x.spffunction} - ${x.spjrftype}`)
          // console.log(sec);
        }
      )
    )
  }

  getAllVariations() {
    const { wprsequence, wosequence } = this.singleWorksOrder;
    this.subs.add(
      this.worksOrderService.getWEBWorksOrdersInstructionsForUser(wprsequence, wosequence, this.currentUser.userId, false).subscribe(
        data => {
          if (data.isSuccess) {
            this.variationData = data.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.selectedSingleInstructionVariation = undefined;
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)
      )
    )
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

  cellClickHandler({ dataItem }) {
    this.selectedSingleInstructionVariation = dataItem;
  }

  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
    // if (this.userType == undefined) return true;
    // if (this.userType?.wourroletype == "Dual Role") {
    //   return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    // }
    // return this.worksOrderUsrAccess.indexOf(menuName) != -1
  }


  disableVariationBtns(btnType, item) {

    if (btnType == 'Assets') {
      return false;
    }

    if (btnType == 'Details') {
      if (item.isEmptyVariation == "N") {
        return false;
      }
    }

    else if (btnType == 'Customer') {
      if (item.woiissuestatus == 'Contractor Review' && item.responsibility == "ALL" && item.isEmptyVariation == "N") {
        return false;
      }
    }

    else if (btnType == 'Contractor') {
      if (item.woiissuestatus == 'Customer Review' && item.responsibility == "ALL" && item.isEmptyVariation == "N") {
        return false;
      }
    }

    else if (btnType == 'Issue') {
      if ((item.woiissuestatus == 'New' || item.woiissuestatus == 'Customer Review') && item.isEmptyVariation == "N") {
        return false;
      }
    }

    else if (btnType == 'Delete') {
      if (item.isEmptyVariation == "Y") {
        return false;
      }
    }


    return true;
  }


  openVariationlist(item) {
    this.selectedSingleInstructionVariation = item;
    $('.variationListAllOverlay').addClass('ovrlay');
    this.openVariationAsset = true;
  }

  closeAssetVariation(eve) {
    this.openVariationAsset = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
    this.getAllVariations();
  }

  newBlankVariation() {
    $('.variationListAllOverlay').addClass('ovrlay');
    this.opneBlankVariation = true;
  }

  closeBlankVariation(eve) {
    this.opneBlankVariation = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
    this.getAllVariations();
  }

  // openVariationDetailMethod(item) {
  //   this.selectedSingleInstructionVariation = item;
  //   $('.variationListAllOverlay').addClass('ovrlay');
  //   this.openVariationDetail = true;
  // }

  // closeVariationDetails(eve) {
  //   this.openVariationDetail = eve;
  //   $('.variationListAllOverlay').removeClass('ovrlay');
  //   this.getAllVariations();
  // }



  sendVariation(to = "Customer", item) {
    if (this.disableVariationBtns(to, item)) {
      return
    }

    const { wosequence, woisequence, woname, woiissuereason } = item;

    let apiCall: any;
    let msg = '';
    if (to == 'Customer') {
      apiCall = this.workOrderProgrammeService.sendVariationToCustomerForReview(wosequence, woisequence, woname, woiissuereason, this.currentUser.userName)
      msg = 'Variation sent to customer.'
    } else if (to == 'Contractor') {
      apiCall = this.workOrderProgrammeService.emailVariationToContractorForReview(wosequence, woisequence, woname, woiissuereason, this.currentUser.userName)
      msg = 'Variation sent to contractor.'
    } else {
      return
    }


    this.subs.add(
      apiCall.subscribe(
        data => {
          // console.log(data)
          if (data.isSuccess) {
            this.alertService.success(msg);
            this.getAllVariations();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }



  issueVariation(item, checkOrProcess = "C") {
    if (this.disableVariationBtns('Issue', item)) {
      // this.alertService.error("Error");
      return;
    }

    const { wosequence, woisequence, wopsequence } = item;
    const params: any = {};
    params.WOSEQUENCE = wosequence;
    params.WOPSEQUENCE = wopsequence;
    params.WOISEQUENCE = woisequence;
    params.strUserId = this.currentUser.userId;
    params.strUserName = this.currentUser.userName;
    params.strCheckOrProcess = checkOrProcess;

    this.subs.add(
      this.workOrderProgrammeService.worksOrderIssueVariation(params).subscribe(
        data => {
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
              this.getAllVariations();
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
          this.issueVariation(item, checkstatus)
        }
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }




  deleteVariationConfirm(item) {
    if (this.disableVariationBtns('Delete', item)) {
      // this.alertService.error("Error");
      return;
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteVariation(item) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));

  }


  deleteVariation(item) {
    const { wosequence, woisequence } = item;
    this.subs.add(
      this.workOrderProgrammeService.deleteBlankVariation(wosequence, woisequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`Variaton ${woisequence} deleted successfully`)
            this.getAllVariations();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }


  editbulkVariation() {
    this.openedFor = "EBR";//edit bulk variation
    $('.variationListAllOverlay').addClass('ovrlay');
    this.openVariationDetail = true;
  }

  closeEditBulkVariation(eve) {
    this.openVariationDetail = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
    this.getAllVariations();

  }


  disableBulkVaritionBtn() {
    if (this.selectedSingleInstructionVariation != undefined) {
      if (this.selectedSingleInstructionVariation.woiissuestatus == "Accepted" || this.selectedSingleInstructionVariation.woiissuestatus == "Issued") {
        return true;
      } else {
        if (this.selectedSingleInstructionVariation.isBulkVariation == 'Y') {
          return false
        }
      }
    }

    return true;
  }




}
