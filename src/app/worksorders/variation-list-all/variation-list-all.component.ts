import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

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

  // worksOrderData: any;
  // phaseData: any;
  // assetDetails: any;
  // woAsset: any;

  // selectedSingleVariation: any;

  // openNewVariation: boolean = false;
  // formMode = 'new'


  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private worksOrderService: WorksOrdersService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    // console.log(this.singleWorksOrder);
    // this.getPageData();
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
      checkboxOnly: true,
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

  getPageData() {
    const { wprsequence, wosequence } = this.singleWorksOrder;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getVW_WOUserSecurity(this.currentUser.userId, wosequence, wprsequence)
      ]).subscribe(
        data => {
          console.log(data);
          let sec = data[0].data.map(x => `${x.spffunction} - ${x.spjrftype}`)
          console.log(sec);
        }
      )
    )
  }

  getAllVariations() {
    const { wprsequence, wosequence } = this.singleWorksOrder;
    this.subs.add(
      this.worksOrderService.getWEBWorksOrdersInstructionsForUser(wprsequence, wosequence, this.currentUser.userId, false).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.variationData = data.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
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

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSingleInstructionVariation = dataItem;
  }

  disableVariationBtns(btnType, item) {

    if (btnType == 'Assets' || btnType == 'Details') {
      return false;
    } else if (btnType == 'Customer') {
      return item.woiissuestatus == 'Contractor Review' ? false : true;
    } else if (btnType == 'Contractor') {
      return item.woiissuestatus == 'Customer Review' ? false : true;
    } else if (btnType == 'Issue') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Delete') {
      return item.woiissuestatus == 'New' ? false : true;
    }


    return false
  }


  openVariationlist(item) {
    this.selectedSingleInstructionVariation = item;
    $('.variationListAllOverlay').addClass('ovrlay');
    this.openVariationAsset = true;
  }

  closeVariation(eve) {
    this.openVariationAsset = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
  }

  newBlankVariation() {
    $('.variationListAllOverlay').addClass('ovrlay');
    this.opneBlankVariation = true;
  }

  closeBlankVariation(eve) {
    this.opneBlankVariation = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
  }

  openVariationDetailMethod(item) {
    this.selectedSingleInstructionVariation = item;
    $('.variationListAllOverlay').addClass('ovrlay');
    this.openVariationDetail = true;
  }

  closeVariationDetails(eve) {
    this.openVariationDetail = eve;
    $('.variationListAllOverlay').removeClass('ovrlay');
  }



  sendVariation(to = "customer", item) {

    const { wosequence, woisequence, woname, woiissuereason } = item;

    let apiCall: any;
    let msg = '';
    if (to == 'customer') {
      apiCall = this.workOrderProgrammeService.sendVariationToCustomerForReview(wosequence, woisequence, woname, woiissuereason, this.currentUser.userName)
      msg = 'Variation sent to customer.'
    } else if (to == 'contractor') {
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
            this.alertService.success(msg)
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }



  issueVariation(item, checkOrProcess = "C") {

    if (this.disableVariationBtns('Issue', item)) {
      this.alertService.error("Error");
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
      this.alertService.error("Error");
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


  bulkVariation() {
    const { wosequence, woisequence } = this.selectedSingleInstructionVariation;
    this.subs.add(
      this.workOrderProgrammeService.addBulkVariation(wosequence, woisequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`Bulk variation created successfully`)
            this.getAllVariations();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }


}
