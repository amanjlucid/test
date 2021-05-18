import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-list',
  templateUrl: './variation-list.component.html',
  styleUrls: ['./variation-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationListComponent implements OnInit {
  @Input() openVariationList: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() selectedAsset: any = [];
  @Output() closeVariationListEvent = new EventEmitter<boolean>();

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

  filterToggle = false;
  worksOrderData: any;
  phaseData: any;
  assetDetails: any;
  woAsset: any;
  selectedSingleVariation: any;
  openVariationWorkList: boolean = false;
  openNewVariation: boolean = false;
  formMode = 'new'
  openedFor = 'details'
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  confirmationType = '';

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,

  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    // console.log(this.selectedAsset);
    if (this.openedFrom == 'assetchecklist') {
      this.getVariationPageDataWithGrid();
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single'
    };
  }


  closeVariationList() {
    this.openVariationList = false;
    this.closeVariationListEvent.emit(false);
  }

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-variation-header').slideToggle();
    this.chRef.detectChanges();
  }


  getVariationPageDataWithGrid() {
    const { wosequence, assid, wopsequence } = this.selectedAsset;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
        this.workOrderProgrammeService.getAssetAddressByAsset(assid),
        this.workOrderProgrammeService.getWEBWorksOrdersVariationList(wosequence, wopsequence, assid),
        this.workOrderProgrammeService.specificWorkOrderAssets(wosequence, assid, wopsequence),
      ]).subscribe(
        data => {
          console.log(data)

          this.worksOrderData = data[0].data;
          this.phaseData = data[1].data;
          this.assetDetails = data[2].data[0];
          const variationData = data[3];
          this.woAsset = data[4].data[0];


          if (variationData.isSuccess) {
            this.variationData = variationData.data;
            this.gridView = process(this.variationData, this.state);
          } else this.alertService.error(variationData.message);

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
    this.selectedSingleVariation = dataItem;
  }

  openVariationDetails(item) {
    if (item != undefined) {
      if (item.woiissuestatus == "New") {
        this.openedFor = 'edit';
      } else {
        this.openedFor = 'details';
      }
    }

    this.selectedSingleVariation = item;
    this.openVariationWorkList = true;
    $('.variationListOverlay').addClass('ovrlay');
  }

  closeVariationDetails(eve) {
    this.openVariationWorkList = eve;
    $('.variationListOverlay').removeClass('ovrlay');
  }

  newVariation() {
    this.formMode = 'new';
    this.openNewVariation = true;
    $('.variationListOverlay').addClass('ovrlay');
    setTimeout(() => {
      this.chRef.detectChanges();
    }, 100);
  }

  closeNewVariation(eve) {
    this.openNewVariation = eve;
    $('.variationListOverlay').removeClass('ovrlay');
  }

  getVariationReason(reason) {
    if (reason != "") {
      if (this.openedFrom == "assetchecklist" && this.formMode == "new") {
        this.openedFor = 'edit';
        this.openVariationDetails(undefined);
      }

    }
  }

  editVariation(item) {
    this.formMode = 'edit';
    this.selectedSingleVariation = item;
    this.openNewVariation = true;
    $('.variationListOverlay').addClass('ovrlay');
  }

  disableVariationBtns(btnType, item) {
    if (btnType == 'Edit') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Customer') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Contractor' || btnType == 'Issue') {
      return item.woiissuestatus == 'Customer Review' || item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Issue') {
      return item.woiissuestatus == 'New' ? false : true;
    } else if (btnType == 'Accept') {
      return item.woiissuestatus == 'Issued' ? false : true;
    }

  }


  sendVariation(to = "customer", item) {
    console.log(item);
    return
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
      this.alertService.error("No Access");
      return;
    }

    this.confirmationType = 'Issue'
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
          console.log(data);
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
              this.getVariationPageDataWithGrid();
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
          if (res.pRETURNSTATUS == 'E') return;

          if (this.confirmationType == "Issue") this.issueVariation(item, checkstatus)
          if (this.confirmationType == "Accept") this.accetpVariationAsset(item, checkstatus)
        }
      })
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  accetpVariationAsset(item, checkOrProcess = "C") {

    if (this.disableVariationBtns('Accept', item)) {
      this.alertService.error("No Access");
      return;
    }

    this.confirmationType = 'Accept'
    const { wosequence, wopsequence, woisequence, assid } = item;
    const params: any = {};
    params.WOSEQUENCE = wosequence;
    params.WOPSEQUENCE = wopsequence;
    params.WOISEQUENCE = woisequence;
    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;
    params.strASSID = [assid];

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
              this.getVariationPageDataWithGrid();
            }


          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )


  }


}
