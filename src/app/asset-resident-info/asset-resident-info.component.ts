import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService, HelperService } from '../_services';
import { AssetResidentInfo } from '../_models'
declare var $: any;
import { Router, ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-resident-info',
  templateUrl: './asset-resident-info.component.html',
  styleUrls: ['./asset-resident-info.component.css']
})
export class AssetResidentInfoComponent implements OnInit {
  @Input() displayResidentDetails: boolean;
  @Input() assetID: string;
  @Input() calledFrom: string;
  @Output() closeResidentDetailsWindow = new EventEmitter<boolean>();

  subs = new SubSink();
  resInfoForm: FormGroup;
  assetAddress: string;
  assetResidentInfoModel: AssetResidentInfo
  loading = false;
  submitted = false;
  currentUser;
  formErrors: any;
  readonlyForm = true;
  riskExists = false;
  displayRiskDetails = false


  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private router: Router,
    private alertService: AlertService
  ) { }


  ngOnInit() {
    this.loading = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.resInfoForm = this.fb.group({
      assetID : [''],
      address : [''],
      propertyStatus : [''],
      rtbStatus :[''],
      residentName : [''],
      telPhone1 : [''],
      telPhone2 : [''],
      mobile : [''],
      email : [''],
      prefContact : [''],
      tenStartDate : [''],
      riskCode : [''],
      conInstructions : [''],
      accessInstructions : [''],
      updatedBy : [''],
      updatedOn : [''],

    })

    this.loadResidentDetails()
  }

  loadResidentDetails(){

    this.wopmConfigurationService.getAssetResidentDetails(this.assetID)
    .subscribe(
      data => {
        if (data.isSuccess) {
          this.assetResidentInfoModel = data.data
          this.populateTemplate(this.assetResidentInfoModel);
          this.loading = false;
          this.displayResidentDetails = true;
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  populateTemplate(resInfo: AssetResidentInfo = null) {
    this.riskExists = resInfo.assetRisk;
    this.assetAddress = resInfo.address;
    return this.resInfoForm.patchValue({
            assetID : resInfo.assetID,
            address : resInfo.address, 
            propertyStatus : resInfo.propertyStatus , 
            rtbStatus :resInfo.rtbStatus ,
            residentName : resInfo.residentName , 
            telPhone1 : resInfo.telPhone1 , 
            telPhone2 : resInfo.telPhone2 ,
            mobile : resInfo.mobile , 
            email : resInfo.email , 
            prefContact : resInfo.prefContact , 
            tenStartDate : resInfo.tenStartDate , 
            riskCode : resInfo.riskCode , 
            conInstructions : resInfo.conInstructions , 
            accessInstructions : resInfo.accessInstructions , 
            updatedBy : resInfo.updatedBy , 
            updatedOn : resInfo.updatedOn , 
     })

  }

  logValidationErrors(group: FormGroup): void {

   // if(this.f.jobRoleType.value == undefined || this.f.jobRoleType.value == "")
   // {
   //   this.formErrors.jobRoleType = 'Please select a role type.';
  //  }

   }

  formErrorObject() {
    this.formErrors = {
      'jobRoleType': '',
      assetID : '',
      address : '',
      propertyStatus : '',
      rtbStatus :'',
      residentName : '',
      telPhone1 : '',
      telPhone2 : '',
      mobile : '',
      email : '',
      prefContact : '',
      tenStartDate : '',
      riskCode : '',
      conInstructions : '',
      accessInstructions : '',
    }
  }

  get f() { return this.resInfoForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject();
    this.logValidationErrors(this.resInfoForm);
    let formRawVal = this.resInfoForm.getRawValue();
    /*
    this.wopmConfigurationService.updateJobRole(this.assetResidentInfoModel)
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

      */
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
    this.resInfoForm.reset();
  }

  closeResidentDetailsWin() {
     this.displayResidentDetails = false;
     this.closeResidentDetailsWindow.emit(true)

  }

  openRiskInfo(){
    $('.disabledBackground').addClass('ovrlay');
    this.displayRiskDetails = true;
  }

  closeRiskDetailsWindow($event){
    $('.disabledBackground').removeClass('ovrlay');
    this.displayRiskDetails = false;
  }


}
