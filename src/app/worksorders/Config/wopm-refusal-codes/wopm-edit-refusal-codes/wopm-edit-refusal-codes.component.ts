import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService } from '../../../../_services';
import { SubSink } from 'subsink';
import { WopmRefusalcodeModel } from '../../../../_models'

@Component({
  selector: 'app-wopm-edit-refusal-codes',
  templateUrl: './wopm-edit-refusal-codes.component.html',
  styleUrls: ['./wopm-edit-refusal-codes.component.css']
})
export class WopmEditRefusalCodesComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  @Input() editFormWindow: boolean = false
  @Input() editFormType: string;
  @Input() refusal: WopmRefusalcodeModel
  @Output() closeRefusalCodeFormWindow = new EventEmitter<boolean>();
  windowTitle: string;
  submitted = false;
  descriptionError: string = ""
  loading = false;
  refusalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {

    if(this.editFormType == "new"){
      this.windowTitle = "New Refusal Code"
    }else{

      this.windowTitle = "Edit Refusal Code " + this.refusal.refusalCode
    }

    this.refusalForm = this.fb.group({
      refusalCode: [''],
      refusalDesc: [''],
      refusalStatus: [true],
    })
    this.refusalForm.controls.refusalCode.setValue(this.refusal.refusalCode)
    this.refusalForm.controls.refusalDesc.setValue(this.refusal.refusalDesc)
    let active = this.refusal.refusalStatus == 'Active'? true: false
    this.refusalForm.controls.refusalStatus.setValue(active)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public openConfirmationDialog(status, message) {
    this.confirmationDialogService.confirm('Please confirm..', message)
      .then((confirmed) => (confirmed) ? this.completeUpdate(status) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
    $('.k-window').css({ 'z-index': 1000 });
  }

  closeEditFormWindow()
  {
    this.editFormWindow = false;
    this.closeRefusalCodeFormWindow.emit(true)

  }

  onSubmit() {
    this.submitted = true;
    if (this.Validate())
    {
      this.refusal.refusalDesc = this.refusalForm.controls.refusalDesc.value
      this.refusal.refusalStatus= this.refusalForm.controls.refusalStatus.value ==  true? "Acive": "Inactive"
      this.refusal.checkProcess = "C"
      this.refusal.newRecord = (this.editFormType == "new")
     // this.loading = true;
      this.wopmConfigurationService.updateRefusalCode(this.refusal)
        .subscribe(
          data => {
            if (data.isSuccess) {
              this.openConfirmationDialog(data.data, data.message)
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
  }

  completeUpdate(status) {
    if(status=='S'){
      this.refusal.checkProcess = 'P';
      this.wopmConfigurationService.updateRefusalCode(this.refusal)
      .subscribe(
        data => {
          if (data.isSuccess) {
              this.alertService.success(data.message)
                this.closeEditFormWindow();
              } else {
                this.alertService.error(data.message);
              }
        });
    }
  }

  Validate()
  {
     let s = '';
    if(this.refusalForm.controls.refusalDesc.value  == "")
    {
      this.descriptionError = "Please enter a Refusal Description";
      return false;
    }
    else
    {
      this.descriptionError = "";
      return true;
    }
  }
}
