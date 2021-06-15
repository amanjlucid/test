import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef   } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService, HelperService } from '../../../_services';
import { WopmContractcost } from '../../../_models'
import { firstDateIsLower, IsGreaterDateValidator, isNumberCheck, ShouldGreaterThanYesterday, shouldNotZero, SimpleDateValidator, yearFormatValidator } from 'src/app/_helpers';

declare var $: any;
import { SubSink } from 'subsink';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-management-edit-costs',
  templateUrl: './management-edit-costs.component.html',
  styleUrls: ['./management-edit-costs.component.css']
})
export class ManagementEditCostsComponent implements OnInit {

  subs = new SubSink();
  contractCostForm: FormGroup;
  @Input() editFormWindow: boolean = false
  @Input() selectedContractCost: WopmContractcost
  @Input() selectedWorksOrder: any
  @Input() editFormType: any
  @Output() closeEditFormWindow = new EventEmitter<boolean>();
  wopmContractcost: WopmContractcost
  loading = false;
  submitted = false;
  public windowTitle: string;
  phases: any[];
  paymentDates: any[];
  showOrgName = false;
  woseq: number;
  currentUser;
  formErrors: any;
  formInvalid: boolean = false;
  public noPaymentDates: boolean = false;

  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.contractCostForm = this.fb.group({
      phaseSeq: [0],
      contractCost: ['', [Validators.required, shouldNotZero()]],
      paymentDate: ['', Validators.required],
      costStatus: [''],
      requestType: ['', Validators.required],
      organisationName: [''],
      costReason: ['', Validators.required],
      feeSeq:[0],
     })

     let WOName = this.selectedWorksOrder.name != undefined? this.selectedWorksOrder.name:this.selectedWorksOrder.woname;
     this.woseq = this.selectedWorksOrder.wosequence;
     if (this.editFormType == "new") {
       this.windowTitle = 'New Cost: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;
     } else if (this.editFormType == "edit") {
       this.windowTitle = 'Edit Cost: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;
       if (this.selectedContractCost.requestType == 'External'){
          this.showOrgName = true;
       }
     }

     this.LoadPrerequisites();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  changeType(event){
    if(event == 'External'){
      this.showOrgName = true;
    }
  }

  populateTemplate(conCost: WopmContractcost = null) {

    this.contractCostForm.patchValue({
      phaseSeq: conCost.phaseSeq ,
      contractCost: conCost.contractCost,
      paymentDate:  conCost.paymentDate,
      costStatus: conCost.status,
      requestType: conCost.requestType,
      organisationName: conCost.organisationName,
      costReason: conCost.reason,
      feeSeq: conCost.contractFeeSeq

    })
    this.chRef.detectChanges();
  }

  LoadPrerequisites(){

    this.phases =[];
    this.paymentDates = [];
    this.wopmConfigurationService.getEditCostsPanelData(this.selectedWorksOrder.wosequence)
      .subscribe(
        data => {
          if (data.isSuccess){
           this.phases = data.data.phases;
           this.paymentDates = data.data.paymentDates;
           this.populateTemplate(this.selectedContractCost);
           if(data.data.paymentDates.length == 0){
            this.noPaymentDates = true;
           }
           } else {
            this.alertService.error(data.message);
          }

        })

  }

  logValidationErrors(group: FormGroup): void {

    if(this.f.contractCost.value == undefined || this.f.contractCost.value == 0)
    {
      this.formErrors.contractCost = 'Please enter the Contract Cost.';
    }
    if(this.f.requestType.value == undefined || this.f.requestType.value == "")
    {
      this.formErrors.requestType = 'Please select the Request Type.';
    }
    if(this.f.costReason.value == undefined || this.f.costReason.value == "")
    {
      this.formErrors.costReason = 'Please enter the Cost Reason.';
    }
    if(this.f.paymentDate.value == undefined || this.f.paymentDate.value == "")
    {
      this.formErrors.paymentDate = 'Please enter the Payment Date.';
    }
    if(this.f.requestType.value == 'External' && (this.f.organisationName.value == undefined ||this.f.organisationName.value == ""))
    {
      this.formErrors.organisationName = 'Please enter the Organisation Name.';
      //have to add this because its not a required value in all situations
      this.formInvalid = true;
    }
   }

  formErrorObject() {
    this.formErrors = {
      'contractCost': '',
      'requestType': '',
      'costReason': '',
      'paymentDate': '',
      'organisationName': '',

    }
  }

  get f() { return this.contractCostForm.controls; }

  onSubmit() {
    this.formInvalid = false
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.contractCostForm);
    if (this.contractCostForm.invalid || this.formInvalid) {
      return;
    }

    let formRawVal = this.contractCostForm.getRawValue();
   // extra validation around values here

    this.wopmContractcost = new WopmContractcost();
    if (this.editFormType == "new") {
      this.wopmContractcost.newRecord = true;
    } else {
      this.wopmContractcost.newRecord = false;
    }
    this.wopmContractcost.worksOrderSeq = this.selectedWorksOrder.wosequence
    this.wopmContractcost.phaseSeq = formRawVal.phaseSeq;
    this.wopmContractcost.contractFeeSeq = formRawVal.feeSeq;
    this.wopmContractcost.contractCost = this.helperService.convertMoneyToFlatFormat(formRawVal.contractCost);
    this.wopmContractcost.status = formRawVal.costStatus;
    this.wopmContractcost.requestType = formRawVal.requestType;
    this.wopmContractcost.paymentDate = formRawVal.paymentDate;
    this.wopmContractcost.organisationName = formRawVal.organisationName;
    this.wopmContractcost.reason = formRawVal.costReason;
    this.wopmContractcost.userID = this.currentUser.userId;
    this.wopmContractcost.checkProcess = 'C';
    this.wopmConfigurationService.updateContractCosts(this.wopmContractcost)
    .subscribe(
      data => {
        if (data.isSuccess) {
          if (data.data == 'S'){
            this.alertService.success(data.message);
            this.closeEditFormWin()
          }else{
            this.openConfirmationDialog(data.message);
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

    dateFormat(value) {
      if (value == undefined || typeof value == 'undefined' || typeof value == 'string') {
          return new Date('1753-01-01').toJSON()
      }
      const dateStr = `${value.year}-${this.helperService.zeorBeforeSingleDigit(value.month)}-${this.helperService.zeorBeforeSingleDigit(value.day)}`;
      return new Date(dateStr).toJSON()
  }

    public openConfirmationDialog(message) {
      this.confirmationDialogService.confirm('Please confirm..', message)
        .then((confirmed) => (confirmed) ? this.completeUpdate() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
      $('.k-window').css({ 'z-index': 1000 });
    }

    completeUpdate() {
      //nothing to do now
    }

  closeEditFormWin() {
    this.editFormWindow = false;
    this.closeEditFormWindow.emit(this.editFormWindow)
  }

}
