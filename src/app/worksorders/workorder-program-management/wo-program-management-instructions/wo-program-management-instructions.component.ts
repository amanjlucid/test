import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef ,ElementRef, ViewChild} from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ReportingGroupService ,  HelperService, LoaderService, ConfirmationDialogService, WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
    selector: 'app-wo-program-management-instructions',
    templateUrl: './wo-program-management-instructions.component.html',
    styleUrls: ['./wo-program-management-instructions.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
      sort: [{ field: 'woname', dir: 'asc' }],
      group: [{
        field: 'woname',
      }],
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
    title = 'Programme Management - Works Order Level';
    selectedItem: any;
    GridData: any;
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;
    loadData = false;
    woPmInstructionAssetsWindow = false;
    selectedInstructionRow :any;
    ViewInsReportWindow = false;
    userList :any ;
    SendEmailInsReportWindow = false;
    userNameCommaSeprted = '';
    userListToMail: any;
    emailReportForm: FormGroup;
    selectedUsersToMail: any = [];
    submitted =  false;
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
    constructor(
        private worksOrdersService: WorksOrdersService,
          private reportingGrpService: ReportingGroupService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private sharedService: SharedService,
        private confirmationDialogService: ConfirmationDialogService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {

      this.emailReportForm = this.fb.group({
        subject: ['', [Validators.required]],
        emailText: ['', Validators.required],
        userlist: [''],
      }
      );

        this.GetWEBWorksOrdersInstructionsForUser();
        this.getUserList();

    }


    formErrorObject() {
      this.formErrors = {
        'subject': '',
        'emailText': ''
      }
    }

    get emailReportCon() { return this.emailReportForm.controls; }

    validationMessage = {
      'subject': {
        'required': 'An Email Subject is required.'
      },
      'emailText': {
        'required': 'Email text is required.'
      }
    };
    logValidationErrors(group: FormGroup): void {
      Object.keys(group.controls).forEach((key: string) => {
        const abstractControl = group.get(key);
        if (abstractControl instanceof FormGroup) {
          this.logValidationErrors(abstractControl);
        } else {
          if (abstractControl && !abstractControl.valid) {
            const messages = this.validationMessage[key];
            for (const errorKey in abstractControl.errors) {
              if (errorKey) {
                this.formErrors[key] += messages[errorKey] + ' ';
              }
            }
          }
        }
      })
    }

    public onItemSelect(item: any) {
      this.selectedUsersToMail.push(item);
      this.setParamsForUserName();
    }

    public onSelectAll(items: any) {
      this.selectedUsersToMail = items;
      this.setParamsForUserName();
    }

    public onItemDeSelect(item: any) {
      this.selectedUsersToMail = this.selectedUsersToMail.filter(x => x.item_id != item.item_id);
      this.setParamsForUserName();

    }

    public onItemDeSelectAll(items: any) {
      this.selectedUsersToMail = items;
      this.userNameCommaSeprted = '';

    }

    public setParamsForUserName(){
         this.userNameCommaSeprted = this.createString(this.selectedUsersToMail, 'item_id');
    }

    openEmailInstructionReport(item)
     {
         this.SendEmailInsReportWindow = true;
         this.selectedInstructionRow =  item;
     }


     closeEmailWithReportWindow() {
         this.SendEmailInsReportWindow = false;
         this.emailReportForm.reset();
         this.selectedUsersToMail = [];
         $('.reportBgblur').removeClass('overlay');
         $('.reportingDiv').removeClass('pointerEvent');
    }


    onEmailReportSubmit() {

      this.loading = true;
      this.submitted = true;
      this.formErrorObject(); // empty form error
      this.logValidationErrors(this.emailReportForm);

      if (this.emailReportForm.invalid) {
        return;
      }

      if(this.selectedUsersToMail.length == 0){
        this.alertService.error('Please select atleast one user to send mail');
        return
      }

//console.log('selectedUsersToMail  '+ JSON.stringify(this.selectedUsersToMail));
//console.log('subject for Email  '+ JSON.stringify(this.emailReportCon.subject.value));
//console.log('emailText for Email  '+ JSON.stringify(this.emailReportCon.emailText.value));

        let params = {

              "USERID":this.currentUser.userId,
              "WOSEQUENCE":this.selectedWorksOrder.wosequence,
              "WOISEQUENCE":this.selectedInstructionRow.woisequence,
              "Body":this.emailReportCon.emailText.value,
              "Subject":this.emailReportCon.subject.value,
              "UserName":this.userNameCommaSeprted
         }

          this.EmailContractInstructionReport(params);
    }



     createString(arr, key) {
      return arr.map(function (obj) {
        return obj[key];
      }).join(',');
    }


    EmailContractInstructionReport(params) {

      this.worksOrdersService.EmailContractInstructionReport(params).subscribe(
          (data) => {
                   //console.log("EmailContractInstructionReport response "+ JSON.stringify(data))
                   this.loading = false;
                if (data.isSuccess) {
                  this.closeEmailWithReportWindow();

                  this.alertService.success('Email Send Successfully'); 
                  this.chRef.detectChanges();
                } else {
                  this.alertService.error(data.message);
                }
          },
          error => {
              this.alertService.error(error);
          }
      )

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

//console.log('GetWEBWorksOrdersInstructionsForUser api data '+ JSON.stringify(data));

                  if (data.isSuccess) {

                    this.instructionData = data.data;
                    let gd = process(this.instructionData, this.state);
                    this.gridView = gd;
                    let tempData: any = gd;
                    this.loadData = true;

                    let groupingKey: any[] = [];
                    this.instructionData.forEach(element => {
                      if (!groupingKey.includes(element.woname)) {
                        groupingKey.push(element.woname);
                      }
                    });

                    let afterGrouping = groupingKey.map((v, k) => {
                      let cell = tempData.data.filter((val, key) => {
                        if (val.value == v) {
                          return val;
                        }
                      })
                      return cell[0];
                    })
                    this.gridView.data = afterGrouping;

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


   openShowinstructionAssets(item)
    {

     this.woPmInstructionAssetsWindow = true;
     this.selectedInstructionRow =  item;
     $('.wopminstructionoverlay').addClass('ovrlay');
    }
    closeWoPmInstructionAssetsWindow() {
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
  onClickDownloadPdf(base64_string , filename){
    let base64String = base64_string;
    this.downloadPdf(base64String,filename);
  }

    openViewInstructionReport(item)
     {

        this.loading = true;
        this.ViewInsReportWindow = true;
//console.log('openViewInstructionReport item '+ JSON.stringify(item));
        this.selectedInstructionRow =  item;

       let params = {
         WOSEQUENCE: item.wosequence,
         WOISEQUENCE: item.woisequence,
         USERID: this.currentUser.userId
       }


       const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



       this.subs.add(
           this.worksOrdersService.ContractInstructionReport(qs).subscribe(
           data => {


                this.loading = false;

             if (data.isSuccess) {

               let filename = item.wosequence + '_' +item.woisequence + '_Report';
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
}
