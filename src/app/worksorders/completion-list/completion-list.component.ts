import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy, OnChanges, SimpleChanges, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, ReportingGroupService, SharedService, WorksorderManagementService } from '../../_services';
import { SubSink } from 'subsink';
import { combineLatest, forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-completion-list',
  templateUrl: './completion-list.component.html',
  styleUrls: ['./completion-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CompletionListComponent implements OnInit, OnDestroy {

  workOrderProgrammeData;
  subs = new SubSink(); // to unsubscribe services
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  };
  groups: GroupDescriptor[] = [];
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public allowUnsort = true;
  public multiple = false;
  public windowState = 'default';
  public windowTop = '15';
  disableBtn: boolean = true;
  selectedCompletionsList: any;
  @ViewChild(GridComponent) grid: GridComponent;

  @Input() completionWin: boolean = false;
  @Output() closeCompletionWin = new EventEmitter<boolean>();
  @Input() worksOrderData: any;
  // worksOrderData: any;
  title = '';
  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  // emailReportForm: FormGroup;
  // submitted = false;
  // formErrors: any;
  // selectedUsersToMail: any = [];
  // public dropdownSettings = {
  //   singleSelection: false,
  //   idField: 'item_id',
  //   textField: 'item_text',
  //   selectAllText: 'Select All',
  //   unSelectAllText: 'UnSelect All',
  //   itemsShowLimit: 3,
  //   allowSearchFilter: true
  // };
  // validationMessage = {
  //   'subject': {
  //     'required': 'An Email Subject is required.'
  //   },
  //   'emailText': {
  //     'required': 'Email text is required.'
  //   }
  // };
  // userList: any;
  SendEmailInsReportWindow = false;
  // userNameCommaSeprted = '';
  // userListToMail: any;
  // loading = false;


  constructor(
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private reportingGrpService: ReportingGroupService,
  ) { }

  // ngOnChanges(changes: { [propName: string]: SimpleChange }) {
  //   // console.log(changes);
  //   if (this.completionWin) {
  //     this.getWorkOrderGetWorksOrderCompletionsList();
  //   }
  // }

  ngOnInit() {

    let woname = this.worksOrderData.woname || this.worksOrderData.name
    this.title = `Completions: ${this.worksOrderData?.wosequence} - ${woname}`

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

    // this.emailReportForm = this.fb.group({
    //   subject: ['', [Validators.required]],
    //   emailText: ['', Validators.required],
    //   userlist: [''],
    // });

    // this.pageRequiredData();
    this.getWorkOrderGetWorksOrderCompletionsList();
    // this.getUserList();

  }

  ngOnDestroy() {
    //console.log("Destroy");
    // if (this.completionWin == true) {
    //   this.closeCompletionWindow();
    // }
    this.subs.unsubscribe();
  }


  // pageRequiredData() {
  //   this.subs.add(
  //     forkJoin([
  //       this.workOrderProgrammeService.getWorksOrderByWOsequence(this.workOrderId)
  //     ]).subscribe(
  //       data => {
  //         const worksOrderData = data[0];

  //         if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
  //         this.title = `Completions: ${this.worksOrderData?.wosequence} - ${this.worksOrderData?.woname}`
  //       }
  //     )
  //   )
  // }
  // this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE),

  public mySelectionKey(context: RowArgs) {
    return context.dataItem.wocosequence;
  }

  public closeCompletionWindow() {
    this.disableBtn = true;
    this.mySelection = [];
    this.completionWin = false;
    this.closeCompletionWin.emit(this.completionWin);
  }

  getWorkOrderGetWorksOrderCompletionsList() {
    this.subs.add(
      this.workOrderProgrammeService.GetWorkOrderGetWorksOrderCompletions(this.worksOrderData.wosequence, this.currentUser.userId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              this.workOrderProgrammeData = tempData;
              this.gridView = process(this.workOrderProgrammeData, this.state);
              this.chRef.detectChanges();
            }
          }
        )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.workOrderProgrammeData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.workOrderProgrammeData, this.state);

  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.workOrderProgrammeData, this.state);
  }

  getSelectedCell({ dataItem, type }) {
    // console.log(dataItem)
    if (type == "click" && dataItem != "") {
      this.disableBtn = false;
      this.selectedCompletionsList = dataItem;
      this.mySelection = [dataItem.wosequence, dataItem.wocosequence];
    }
  }

  viewWorkOrderCompletionsReport(wosequence, wocosequence, userId) {
    this.alertService.success("Generating Report Please Wait...")

    this.subs.add(
      this.workOrderProgrammeService.viewWorkOrderCompletionCertificate(wosequence, wocosequence, userId).subscribe(
        data => {
          if (data && data.isSuccess) {
            let tempData = data.data;
            let tempMessage = data.message;
            let filename = wosequence + '_' + wocosequence + '_Report';
            this.downloadPdf(tempData, filename);

            // this.alertService.success("Completion Report Downloaded.");
          } else {
            this.alertService.error(data.message);
          }

          this.chRef.detectChanges();
        }
      )
    )
  }

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
  }

  previewCompletionReport(item) {
    const { wosequence, wocosequence } = item;
    this.viewWorkOrderCompletionsReport(wosequence, wocosequence, this.currentUser.userId);
  }




  woMenuAccess(menuName) {
    if (this.userType == undefined) return true;

    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    }

    return this.worksOrderUsrAccess.indexOf(menuName) != -1

  }



  // public onItemSelect(item: any) {
  //   this.selectedUsersToMail.push(item);
  //   this.setParamsForUserName();
  // }

  // public onSelectAll(items: any) {
  //   this.selectedUsersToMail = items;
  //   this.setParamsForUserName();
  // }

  // public onItemDeSelect(item: any) {
  //   this.selectedUsersToMail = this.selectedUsersToMail.filter(x => x.item_id != item.item_id);
  //   this.setParamsForUserName();

  // }

  // public onItemDeSelectAll(items: any) {
  //   this.selectedUsersToMail = items;
  //   this.userNameCommaSeprted = '';

  // }

  // public setParamsForUserName() {
  //   this.userNameCommaSeprted = this.createString(this.selectedUsersToMail, 'item_id');
  // }

  // createString(arr, key) {
  //   return arr.map(function (obj) {
  //     return obj[key];
  //   }).join(',');
  // }


  openEmailInstructionReport(item) {
    $('.completionListOverlay').addClass('ovrlay');
    this.selectedCompletionsList = item;
    this.SendEmailInsReportWindow = true;

  }


  closeEmailWithReportWindow(eve) {
    this.SendEmailInsReportWindow = false;
    // this.emailReportForm.reset();
    // this.selectedUsersToMail = [];
    $('.completionListOverlay').removeClass('ovrlay');
    // $('.reportingDiv').removeClass('pointerEvent');
  }


  // getUserList() {
  //   this.reportingGrpService.userListToMail().subscribe(
  //     data => {
  //       this.userListToMail = data.data;
  //     }
  //   );
  // }


  // formErrorObject() {
  //   this.formErrors = {
  //     'subject': '',
  //     'emailText': ''
  //   }
  // }

  // logValidationErrors(group: FormGroup): void {
  //   Object.keys(group.controls).forEach((key: string) => {
  //     const abstractControl = group.get(key);
  //     if (abstractControl instanceof FormGroup) {
  //       this.logValidationErrors(abstractControl);
  //     } else {
  //       if (abstractControl && !abstractControl.valid) {
  //         const messages = this.validationMessage[key];
  //         for (const errorKey in abstractControl.errors) {
  //           if (errorKey) {
  //             this.formErrors[key] += messages[errorKey] + ' ';
  //           }
  //         }
  //       }
  //     }
  //   })
  // }

  // get emailReportCon() { return this.emailReportForm.controls; }

  // onEmailReportSubmit() {

  //   this.loading = true;
  //   this.submitted = true;
  //   this.formErrorObject(); // empty form error
  //   this.logValidationErrors(this.emailReportForm);

  //   console.log(this.emailReportForm)
  //   if (this.emailReportForm.invalid) {
  //     return;
  //   }

  //   if (this.selectedUsersToMail.length == 0) {
  //     this.alertService.error('Please select atleast one user to send mail');
  //     return
  //   }

  //   let params = {
  //     // "USERID": this.currentUser.userId,
  //     "WOSEQUENCE": this.selectedCompletionsList.wosequence,
  //     "WOCOSEQUENCE ": this.selectedCompletionsList.wocosequence,
  //     "Body": this.emailReportCon.emailText.value,
  //     "Subject": this.emailReportCon.subject.value,
  //     "USERID": this.userNameCommaSeprted,
  //     "ModuleName": 'Completion Report'
  //   }

  //   this.subs.add(
  //     this.workOrderProgrammeService.processCompletionReport(params).subscribe(
  //       data => {
  //         // console.log(data);
  //         if (data.isSuccess) {
  //           this.closeEmailWithReportWindow();
  //           this.alertService.success('Report Sent Successfully');
  //         } else this.alertService.error(data.message);

  //         this.chRef.detectChanges();
  //       }, error => {
  //         this.alertService.error(error);
  //       }
  //     )
  //   )

    
  // }


  // saveSendCompletionReport() {
  //   this.subs.add(
  //     this.workOrderProgrammeService.saveSendWorkOrderCompletionCertificate(this.selectedCompletionsList.wosequence, this.selectedCompletionsList.wocosequence, this.currentUser.userId).subscribe(
  //       data => {
  //         if (data && data.isSuccess) {
  //           let tempMessage = data.message;
  //           this.alertService.success("Completion Report Successfully Saved.");
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )
  // }

}
