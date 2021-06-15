import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService, HelperService } from '../../../../_services';
import { WopmJobroleModel } from '../../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-wopm-edit-jobroles',
  templateUrl: './wopm-edit-jobroles.component.html',
  styleUrls: ['./wopm-edit-jobroles.component.css']
})
export class WopmEditJobrolesComponent implements OnInit {

  subs = new SubSink();
  jobRoleForm: FormGroup;
  @Input() editFormWindow: boolean = false
  @Input() selectedJobRole: WopmJobroleModel
  @Input() jobroleFormType: any
  @Input() roleTypes: any[];
  @Input() securityGroups: any[];
  @Output() closeEditFormWindow = new EventEmitter<boolean>();
  originalJobRole: string;
  wopmJobroleModel: WopmJobroleModel
  contractorList: any;
  loading = false;
  submitted = false;
  public windowTitle: string;
  public pageHeight: number = 580
  //saveMsg: string;
  currentUser;
  formErrors: any;
  public disableRoleType: boolean = false;
  public dialogUpdateJobRole:boolean = false;

  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private alertService: AlertService
  ) { }


  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.jobRoleForm = this.fb.group({
      jobRoleType: ['', Validators.required],
      jobRole: ['', Validators.required],
      securityGroup: ['', Validators.required],
      defaultJobRole: false,
      variationLimit: 0,
      issueLimit: 0,
      requestPaymentLimit: 0,
      authPaymentLimit: 0,
      requestFeeLimit: 0,
      authFeeLimit: 0,
    })

    if (this.jobroleFormType == "new") {
      this.disableRoleType = false;
      this.windowTitle = "New Job Role";
    } else if (this.jobroleFormType == "edit") {
      this.disableRoleType = true;
      this.windowTitle = "Edit Job Role";
      this.originalJobRole = this.selectedJobRole.jobRole;
    }

    if(this.securityGroups.length > 0)
    {
      let tempGroups = this.securityGroups;
    }

    this.dummyLoad();
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  populateTemplate(jobrole: WopmJobroleModel = null) {

    return this.jobRoleForm.patchValue({
      jobRoleType: jobrole.jobRoleType ,
      jobRole: jobrole.jobRole,
      securityGroup:  jobrole.securityGroupID,
      defaultJobRole: (this.jobroleFormType == "new") ? false : jobrole.defaultJobRole == "Y" ? true : false,
      variationLimit: jobrole.variationLimit,
      issueLimit: jobrole.issueLimit,
      requestPaymentLimit: jobrole.requestPaymentLimit,
      authPaymentLimit: jobrole.authPaymentLimit,
      requestFeeLimit: jobrole.requestFeeLimit,
      authFeeLimit: jobrole.authFeeLimit,
    })

  }

  dummyLoad(){

    //not sure why we have to do this but it seems that the masked values don't display on the initial
    //load unless the form values are patched after a server returns from a callback.

    this.wopmConfigurationService.getWorksOrderJobRolesPanelItems()
    .subscribe(
      data => {
        this.populateTemplate(this.selectedJobRole);
      });
  }

  logValidationErrors(group: FormGroup): void {

    if(this.f.jobRoleType.value == undefined || this.f.jobRoleType.value == "")
    {
      this.formErrors.jobRoleType = 'Please select a role type.';
    }
    if(this.f.jobRole.value == undefined || this.f.jobRole.value == "")
    {
      this.formErrors.jobRole = 'Please enter a job role.';
    }
    if(this.f.securityGroup.value == undefined || this.f.securityGroup.value == "")
    {
      this.formErrors.securityGroup = 'Please select a security group.';
    }
   }

  formErrorObject() {
    this.formErrors = {
      'jobRoleType': '',
      'jobRole': '',
      'securityGroup': ''
    }
  }

  get f() { return this.jobRoleForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.jobRoleForm);

    if (this.jobRoleForm.invalid) {
      this.pageHeight = 620;
      return;
    }else{
      this.pageHeight = 580;
    }

    let formRawVal = this.jobRoleForm.getRawValue();
   // extra validation around values here

    this.wopmJobroleModel = new WopmJobroleModel();
    if (this.jobroleFormType == "new") {
      this.wopmJobroleModel.jobRole = formRawVal.jobRole;
      this.wopmJobroleModel.newRecord = true;
      this.wopmJobroleModel.newJobRole  = formRawVal.jobRole;
    } else {
      this.wopmJobroleModel.jobRole = this.originalJobRole;
      this.wopmJobroleModel.newRecord = false;
      this.wopmJobroleModel.newJobRole = formRawVal.jobRole;
    }
    this.wopmJobroleModel.jobRoleType = formRawVal.jobRoleType;
    this.wopmJobroleModel.defaultJobRole = formRawVal.defaultJobRole == true? 'Y': 'N';
    this.wopmJobroleModel.variationLimit = this.helperService.convertMoneyToFlatFormat(formRawVal.variationLimit);
    this.wopmJobroleModel.issueLimit = this.helperService.convertMoneyToFlatFormat(formRawVal.issueLimit);
    this.wopmJobroleModel.requestPaymentLimit = this.helperService.convertMoneyToFlatFormat(formRawVal.requestPaymentLimit);
    this.wopmJobroleModel.authPaymentLimit = this.helperService.convertMoneyToFlatFormat(formRawVal.authPaymentLimit);
    this.wopmJobroleModel.requestFeeLimit = this.helperService.convertMoneyToFlatFormat(formRawVal.requestFeeLimit);
    this.wopmJobroleModel.authFeeLimit = this.helperService.convertMoneyToFlatFormat(formRawVal.authFeeLimit);
    this.wopmJobroleModel.securityGroupID = formRawVal.securityGroup;
    this.wopmJobroleModel.userID = this.currentUser.userId;
    this.wopmJobroleModel.checkProcess = 'C';
    this.wopmConfigurationService.updateJobRole(this.wopmJobroleModel)
    .subscribe(
      data => {
        if (data.isSuccess) {
          if(data.data == 'S'){
            this.alertService.success(data.message)
            this.closeEditFormWin();
          }else
          {
            this.openConfirmationDialog(data.data, data.message)
          }
        } else {
          this.loading = false;
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      });
    }

    public openConfirmationDialog(status, message) {
      this.confirmationDialogService.confirm('Please confirm..', message)
        .then((confirmed) => (confirmed) ? this.completeUpdate(status) : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
      $('.k-window').css({ 'z-index': 1000 });
    }

    completeUpdate(status) {
      //do nothing now
    }


  refreshForm() {
    // let user:User;
    // this.templateFormType = "new";
    // this.populateTemplate(user);
    this.jobRoleForm.reset();
  }

  closeEditFormWin() {
    this.editFormWindow = false;
    this.closeEditFormWindow.emit(this.editFormWindow)
  }


}
