import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, SettingsService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { PageChangeEvent } from '@progress/kendo-angular-dropdowns/dist/es2015/common/page-change-event';
import { PageChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-manage-emails',
  templateUrl: './manage-emails.component.html',
  styleUrls: ['./manage-emails.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageEmailsComponent implements OnInit {
  subs = new SubSink();
  @Output() closeManageEmailWin = new EventEmitter<boolean>();
  @Input() manageEmailsWIn: any = false;
  @Input() manageEmailfor: any
  title = "";
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    take: 25,
    filter: {
      logic: "or",
      filters: []
    }
  }
  pageSize = 25;
  allowUnsort = true;
  multiple = false;
  gridView: DataResult;
  loading = true
  // selectableSettings: SelectableSettings;
  selectedItem: any
  usreLists: any;
  submitted: boolean = false;
  userNotificationForm: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'name': {
      'required': 'Name is required.',
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Please enter a valid email address.',
      'pattern': 'Please enter a valid email address.'
    },
  };
  currentUser: any;
  createNewEntry = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private settingService: SettingsService,
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.manageEmailfor == "apex") {
      this.title = "Manage Email Address - Apex Users";
      this.userNotificationForm = this.fb.group({
        email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      });
    } else {
      this.title = "Manage Email Address - Non-Apex Users";
      this.userNotificationForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      });
    }

    this.userNotificationForm.disable(); //default disable the fields
    this.loadApexUsers();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.usreLists, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.usreLists, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedItem = dataItem;
    this.userNotificationForm.enable();
    //this.userNotificationForm.get('email').enable();

    if (this.manageEmailfor == "apex") {
      this.userNotificationForm.patchValue({
        email: this.selectedItem.email.trim()
      })
    } else {
      this.userNotificationForm.patchValue({
        name: this.selectedItem.userName,
        email: this.selectedItem.email.trim()
      })

      // this.userNotificationForm.get('name').disable();
      this.createNewEntry = false;
    }
  

  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.usreLists.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.usreLists.length
    };
    this.chRef.detectChanges();
  }


  closeWin() {
    this.manageEmailsWIn = false
    this.closeManageEmailWin.emit(this.manageEmailsWIn);
  }

  loadApexUsers() {
    this.subs.add(
      this.settingService.loadApexUsers().subscribe(
        data => {
          if (data.isSuccess) {
            if (this.manageEmailfor == "apex") {
              this.usreLists = data.data.filter(x => x.nonSec == false)
            } else {
              this.usreLists = data.data.filter(x => x.nonSec == true)
            }

            this.gridView = process(this.usreLists, this.state);
          }

          this.loading = false;
          this.chRef.detectChanges();
        }
      )
    )
  }



  formErrorObject() {
    this.formErrors = {
      'name': '',
      'email': '',
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

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.userNotificationForm);

    if (this.userNotificationForm.invalid || this.userNotificationForm.status == "DISABLED") {
      return;
    }

    let formRawVal = this.userNotificationForm.getRawValue();

    if (this.manageEmailfor == "apex") {
      this.updateApexUserEmail(formRawVal);
    } else {
      this.updateNonApexUserEmailAndName(formRawVal);
    }

  }

  updateApexUserEmail(formRawVal) {
    this.subs.add(
      this.settingService.updateApexUserEmail(this.selectedItem.userId, formRawVal.email.trim(), this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data == 'S') {
              this.alertService.success("Email updated successfully.");
              this.resetDisableAndLoadFormAndGrid()
            } else {
              this.alertService.error("Something went wrong");
            }
          } else {
            this.alertService.error(data.message)
          }
        },
        err => {
          this.alertService.error(err);
        }
      )
    )
  }


  updateNonApexUserEmailAndName(formRawVal) {
    let apiCall: any;
    let msg = '';

    if (this.createNewEntry == false) {
      msg = "Record updated successfully.";
      apiCall = this.settingService.ValidateUpdateNonSecurityUserEmail(formRawVal.name, formRawVal.email.trim(), this.currentUser.userId, this.selectedItem.userId)
    } else {
      msg = "Record created successfully."
      apiCall = this.settingService.ValidateAddNonSecurityUserEmail(formRawVal.name, formRawVal.email.trim(), this.currentUser.userId)
    }

    this.subs.add(
      apiCall.subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data == 'S') {
              this.alertService.success(msg);
              this.resetDisableAndLoadFormAndGrid()
            } else {
              this.alertService.error(data.message);
            }
          } else {
            this.alertService.error(data.message)
          }
        },
        err => {
          this.alertService.error(err);
        }
      )
    )


  }


  createNew() {
    this.selectedItem = undefined;
    this.createNewEntry = true;
    this.userNotificationForm.reset();
    this.userNotificationForm.enable();

  }


  openConfirmationDialog(obj) {
    if (!this.selectedItem) {
      return
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `This user will be deleted and removed from all Notification Groups, continue ?`)
      .then((confirmed) => (confirmed) ? this.delete(obj) : console.log(confirmed))
      .catch((err) => console.log(err));

  }

  delete(obj) {
    this.subs.add(
      this.settingService.validateDeleteNonSecurityUserEmail(obj.userId, this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data == "S") {
              this.alertService.success(data.message);
              this.resetDisableAndLoadFormAndGrid()
            } else {
              this.alertService.error(data.message);
            }
          } else {
            this.alertService.error(data.message);
          }
        },
        err => {
          this.alertService.error(err);
        }
      )
    )

  }


  resetDisableAndLoadFormAndGrid() {
    this.userNotificationForm.reset();
    this.userNotificationForm.disable();
    this.loadApexUsers();
    this.selectedItem = undefined
    this.createNewEntry = false;
  }


}
