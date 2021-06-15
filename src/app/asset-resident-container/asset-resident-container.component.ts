import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService, HelperService } from '../_services';
import { AssetResidentInfo } from '../_models'
declare var $: any;
import { Router, ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';


@Component({
  selector: 'app-asset-resident-container',
  templateUrl: './asset-resident-container.component.html',
  styleUrls: ['./asset-resident-container.component.css']
})
export class AssetResidentContainerComponent implements OnInit {

  subs = new SubSink();
  assetID: string;
  currentUser;
  formErrors: any;
  displayResidentDetails = false;
  residentInfo
  calledFrom: string;

  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {

    this.residentInfo = JSON.parse(sessionStorage.getItem('ResidentInfo'));
    this.assetID = this.residentInfo.assid;
    this.calledFrom = this.residentInfo.calledFrom;
    sessionStorage.removeItem('ResidentInfoAssid');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(this.assetID != undefined && this.assetID != '')
    {
      $('.disabledBackground').addClass('ovrlay');
      this.displayResidentDetails = true;
    }

  }


  closeResidentInfoDetailsWindow() {
    $('.disabledBackground').removeClass('ovrlay');
    this.displayResidentDetails = false;
    if(this.calledFrom == 'worksOrderDetail'){
      this.router.navigate(['/worksorders/details/']);
    }
    if(this.calledFrom == 'worksOrderAssetChecklist'){
     sessionStorage.setItem('ResidentInfo', JSON.stringify(this.assetID));
     this.router.navigate(['/worksorders/details/']);
   }

 }


}
