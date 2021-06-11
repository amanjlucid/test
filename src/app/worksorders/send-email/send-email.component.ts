import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy, OnChanges, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SubSink } from 'subsink';
import { AlertService, ReportingGroupService, SharedService, WorksorderManagementService, WorksOrdersService } from '../../_services';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class SendEmailComponent implements OnInit {
  @Input() SendEmailInsReportWindow = false;
  @Input() selectedObj: any;
  @Input() opendFrom: 'completion' | 'instruction';
  @Output() closeEmailReportEvent = new EventEmitter<boolean>();
  subs = new SubSink();
  emailReportForm: FormGroup;
  submitted = false;
  formErrors: any;
  selectedUsersToMail: any = [];
  public dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  validationMessage = {
    'subject': {
      'required': 'An Email Subject is required.'
    },
    'emailText': {
      'required': 'Email text is required.'
    }
  };
  userList: any;
  userNameCommaSeprted = '';
  userListToMail: any;
  loading = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private worksOrdersService: WorksOrdersService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private reportingGrpService: ReportingGroupService,
    private workOrderProgrammeService: WorksorderManagementService,
  ) { }

  ngOnInit(): void {
    this.emailReportForm = this.fb.group({
      subject: ['', [Validators.required]],
      emailText: ['', Validators.required],
      userlist: [''],
    });

    this.getUserList();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeEmailWithReportWindow() {
    this.SendEmailInsReportWindow = false;
    this.closeEmailReportEvent.emit(false);
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

  public setParamsForUserName() {
    this.userNameCommaSeprted = this.createString(this.selectedUsersToMail, 'item_id');
  }

  createString(arr, key) {
    return arr.map(function (obj) {
      return obj[key];
    }).join(',');
  }

  getUserList() {
    this.reportingGrpService.userListToMail().subscribe(
      data => {
        this.userListToMail = data.data;
      }
    );
  }

  formErrorObject() {
    this.formErrors = {
      'subject': '',
      'emailText': ''
    }
  }


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

  get emailReportCon() { return this.emailReportForm.controls; }


  onEmailReportSubmit() {

    this.loading = true;
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.emailReportForm);

    // console.log(this.emailReportForm)
    if (this.emailReportForm.invalid) {
      return;
    }

    if (this.selectedUsersToMail.length == 0) {
      this.alertService.error('Please select atleast one user to send mail');
      return
    }

    let params: any;
    let apiCall: any;

    if (this.opendFrom == "completion") {
      params = {
        // "USERID": this.currentUser.userId,
        "WOSEQUENCE": this.selectedObj.wosequence,
        "WOCOSEQUENCE ": this.selectedObj.wocosequence,
        "Body": this.emailReportCon.emailText.value,
        "Subject": this.emailReportCon.subject.value,
        "USERID": this.userNameCommaSeprted,
        "ModuleName": 'Completion Report'
      }

      apiCall = this.workOrderProgrammeService.processCompletionReport(params)
    }

    else if (this.opendFrom == "instruction") {
      params = {
        "USERID": this.currentUser.userId,
        "WOSEQUENCE": this.selectedObj.wosequence,
        "WOISEQUENCE": this.selectedObj.woisequence,
        "Body": this.emailReportCon.emailText.value,
        "Subject": this.emailReportCon.subject.value,
        "UserName": this.userNameCommaSeprted
      }

      apiCall = this.worksOrdersService.EmailContractInstructionReport(params)
    }


    this.subs.add(
      apiCall.subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.alertService.success('Report Sent Successfully');
            this.closeEmailWithReportWindow();

          } else this.alertService.error(data.message);

          this.chRef.detectChanges();
        }, error => {
          this.alertService.error(error);
        }
      )
    )


  }

}
