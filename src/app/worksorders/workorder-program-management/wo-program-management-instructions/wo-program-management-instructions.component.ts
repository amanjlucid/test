import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ReportingGroupService, HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { GridComponent, PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
// import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-wo-program-management-instructions',
  templateUrl: './wo-program-management-instructions.component.html',
  styleUrls: ['./wo-program-management-instructions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WoProgramManagmentInstructionComponent implements OnInit {
  @Input() woProgramManagmentInstructionsWindow: boolean = false;
  @Output() WoProgramManagmentInstructionsWinEvent = new EventEmitter<boolean>();
  @Input() selectedRow: any;
  @Input() treelevel: any;
  @Input() worksOrderData: any;
  @Input() wodDetailType: string = 'all';
  @Input() selectedWorksOrder: any;
  @ViewChild('emailInsReport') emailInsReport: any;
  @ViewChild('pivotCheckBox') pivotCheckBox: ElementRef;

  subs = new SubSink();

  state: State = {
    skip: 0,
    take: 25,
    sort: [{ field: 'woname', dir: 'asc' }],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public allowUnsort = true;
  public multiple = false;
  public mySelection: any[] = [];

  emailInsReportForm = {
    subject: null,
    topText: null,
  }

  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  gridView: DataResult;
  gridLoading = true
  pageSize = 25;
  title = 'Instructions';
  selectedItem: any;
  GridData: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  loading = false;
  loadData = false;
  woPmInstructionAssetsWindow = false;
  selectedInstructionRow: any;
  ViewInsReportWindow = false;
  userList: any;
  SendEmailInsReportWindow = false;
  userNameCommaSeprted = '';
  userListToMail: any;
  // emailReportForm: FormGroup;
  selectedUsersToMail: any = [];
  submitted = false;
  formErrors: any;

  public dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  public instructionData;

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  constructor(
    private worksOrdersService: WorksOrdersService,
    private reportingGrpService: ReportingGroupService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService
  ) { }

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

    let woname = this.worksOrderData.woname || this.worksOrderData.name
    this.title = `Instructions: ${this.selectedWorksOrder?.wosequence} - ${woname}`

    this.GetWEBWorksOrdersInstructionsForUser();


  }


  openEmailInstructionReport(item) {
    this.SendEmailInsReportWindow = true;
    this.selectedInstructionRow = item;
    $('.reportBgblur').addClass('ovrlay');
  }


  closeEmailWithReportWindow(eve) {
    this.SendEmailInsReportWindow = false;

    $('.reportBgblur').removeClass('ovrlay');
    $('.reportingDiv').removeClass('pointerEvent');
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  GetWEBWorksOrdersInstructionsForUser() {
    const params = {
      "WPRSEQUENCE": this.selectedWorksOrder.wprsequence,
      "iWOSeq": this.selectedWorksOrder.wosequence,
      "strUserId": this.currentUser.userId,
      "Instructions": true,
    };

    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

    this.subs.add(
      this.worksOrdersService.GetWEBWorksOrdersInstructionsForUser(qs).subscribe(
        data => {
          //  console.log(data); 
          if (data.isSuccess) {
            let tempData = data.data;
            // tempData.map(s => {
            //   s.woirequestdate = new Date(s.woirequestdate);
            //   s.woiacceptdate = new Date(s.woiacceptdate);
            // });
            this.instructionData = tempData;
            this.gridView = process(this.instructionData, this.state);
            this.loading = false;

          } else {
            this.alertService.error(data.message);
            this.loading = false
          }

          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )





  }


  closeWoProgramManagmentInstructionsWin() {
    this.woProgramManagmentInstructionsWindow = false;
    this.WoProgramManagmentInstructionsWinEvent.emit(this.woProgramManagmentInstructionsWindow);
  }


  openShowinstructionAssets(item) {
    this.woPmInstructionAssetsWindow = true;
    this.selectedInstructionRow = item;
    $('.wopminstructionoverlay').addClass('ovrlay');
  }

  closeWoPmInstructionAssetsWindow(event) {
    if (event == true) {
      this.GetWEBWorksOrdersInstructionsForUser();
    }
    this.woPmInstructionAssetsWindow = false;
    $('.wopminstructionoverlay').addClass('ovrlay');
  }


  closeViewInsReportWindow() {
    this.ViewInsReportWindow = false;
  }

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();//console.log('openViewInstructionReport item '+ JSON.stringify(item));
    this.ViewInsReportWindow = false;
  }

  onClickDownloadPdf(base64_string, filename) {
    let base64String = base64_string;
    this.downloadPdf(base64String, filename);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.instructionData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.instructionData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.instructionData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.instructionData.length
    };
  }

  openViewInstructionReport(item) {
    this.selectedInstructionRow = item;
    let params = {
      WOSEQUENCE: item.wosequence,
      WOISEQUENCE: item.woisequence,
      USERID: this.currentUser.userId
    }


    const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

    this.alertService.success("Generating Report Please Wait...")

    this.subs.add(
      this.worksOrdersService.ContractInstructionReport(qs).subscribe(
        data => {
          if (data.isSuccess) {

            let filename = item.wosequence + '_' + item.woisequence + '_Report';
            this.onClickDownloadPdf(data.data, filename);

            this.chRef.detectChanges();
          } else {
            this.alertService.error(data.message);
          }

        },
        err => this.alertService.error(err)
      )
    )

  }


  getUserList() {
    this.reportingGrpService.userListToMail().subscribe(
      data => {
        this.userListToMail = data.data;
        // console.log('userListToMail api response '+  JSON.stringify(data.data));
      }
    );
  }

  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.userType, this.worksOrderAccess, this.worksOrderUsrAccess, menuName)
    // if (this.userType == undefined) return true;

    // if (this.userType?.wourroletype == "Dual Role") {
    //   return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    // }

    // return this.worksOrderUsrAccess.indexOf(menuName) != -1

  }

}
