import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, ConfirmationDialogService, HelperService, WopmConfigurationService} from 'src/app/_services';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';

@Component({
  selector: 'app-wo-checklist-fee',
  templateUrl: './wo-checklist-fee.component.html',
  styleUrls: ['./wo-checklist-fee.component.css']
})
export class WoChecklistFeeComponent implements OnInit {
  @Input() ShowEditCheckListFeeWindow: boolean = false;
  @Input() EditCheckListFeeItem: any = [];
  @Output() closeEditFeeWindowEvent = new EventEmitter<boolean>();
  @Output() EditCheckListFeeItemOut = new EventEmitter<any>();

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  windowTitle = 'Edit Checklist Fee';
  reason: string  = '';
  feeValue: number = 0;
  subs = new SubSink();
  reasonError: string  = '';
  feeError: string  = '';
  checklistFeeForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private helperService: HelperService,
    private confirmationDialogService: ConfirmationDialogService,
    private wopmConfigurationService: WopmConfigurationService,

  ) {

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {

    let value = '£' + this.helperService.moneyFormat(this.EditCheckListFeeItem.FeeValue)
    this.checklistFeeForm = this.fb.group({
      reason: [this.EditCheckListFeeItem.strReason, [Validators.required]],
      feeValue: [value, [Validators.required]],
    })

    this.windowTitle = 'Edit Checklist Fee: ' + this.EditCheckListFeeItem.Title;
    this.chRef.detectChanges();
  }

  closeEditFeeWindow(){
    this.closeEditFeeWindowEvent.emit(false);
  }

  onSubmit(){

    this.reasonError = '';
    this.feeError = '';
    this.submitted = true;

    if(this.Validate()){
      this.EditCheckListFeeItem.strReason = this.checklistFeeForm.controls.reason.value;
      this.EditCheckListFeeItem.FeeValue =  this.helperService.convertMoneyToFlatFormat(this.checklistFeeForm.controls.feeValue.value);
      this.EditCheckListFeeItem.Submitted = true;
      this.closeEditFeeWindowEvent.emit(true);
      this.EditCheckListFeeItemOut.emit(this.EditCheckListFeeItem);
    }

  }

  Validate()
  {
     if(this.checklistFeeForm.controls.reason.value  == "")
    {
      this.reasonError = "You must enter a valid reason";
      return false;
    }
    if(this.checklistFeeForm.controls.feeValue.value < 0)
    {
      this.feeError = "You must enter a valid fee value";
      return false;
    }
    return true;
  }


}
