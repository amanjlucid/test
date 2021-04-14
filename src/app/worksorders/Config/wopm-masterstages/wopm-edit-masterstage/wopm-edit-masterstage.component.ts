import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService } from '../../../../_services';
import { CustomValidators } from '../../../../_helpers/custom.validator'
import { WopmMasterStageModel } from '../../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-wopm-edit-masterstage',
  templateUrl: './wopm-edit-masterstage.component.html',
  styleUrls: ['./wopm-edit-masterstage.component.css']
})

export class WopmEditMasterstageComponent implements OnInit {
  subs = new SubSink();
  stageForm: FormGroup;
  @Input() stageFormWindow: boolean = false
  @Input() selectedStage: WopmMasterStageModel
  @Input() stageFormType: any
  @Input() allStages: any[];
  @Output() closeStageFormWin = new EventEmitter<boolean>();
  originalName: string;
  contractorList: any;
  loading = false;
  submitted = false;
  public windowTitle: string;
  saveMsg: string;
  currentUser;
  readInput: boolean
  validationMessage = {
    'name': {
      'required': 'Name is required.',
      'maxlength': 'Name must be maximum 50 characters.'
    },
    'description': {
      'required': 'Description is required.',
      'maxlength': 'Description must be maximum 1024 characters.',
    },
    'status': {
      'required': 'Status is required.',
    }

  };
  formErrors: any;
  wostagesurcde: number = 0;


  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private alertService: AlertService
  ) { }


  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.stageForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(1024)]],
      status: ['', Validators.required]

    })

    if (this.stageFormType == "new") {
      this.readInput = false;
      this.saveMsg = "Master Stage created successfully."
      this.windowTitle = "Create Master Stage";
    } else if (this.stageFormType == "edit") {
      this.readInput = true
      this.windowTitle = "Edit Master Stage";
      this.saveMsg = "Master Stage updated successfully."
      this.originalName = this.selectedStage.name;
    }

    this.formControlValueChanged();
    this.populateStage(this.selectedStage);
  }

    
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formControlValueChanged() {
/*     const passwordControl = this.stageForm.get('password');
    const passwordDurationControl = this.stageForm.get('passwordDuration');
    const maxLoginAttemptControl = this.stageForm.get('maxLoginAttempt');
    this.stageForm.get('loginType').valueChanges.subscribe(
      (mode: string) => {
        if (mode === 'S') {
          passwordControl.setValidators([Validators.required, Validators.maxLength(10)]);
          passwordDurationControl.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(9999)]);
          maxLoginAttemptControl.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(9999)]);
        }
        else {
          passwordControl.clearValidators();
          passwordDurationControl.clearValidators();
          maxLoginAttemptControl.clearValidators();
        }
        passwordControl.updateValueAndValidity();
        passwordDurationControl.updateValueAndValidity();
        maxLoginAttemptControl.updateValueAndValidity();
      }); */

   }



  populateStage(stage: WopmMasterStageModel = null) {
    this.wostagesurcde = (this.stageFormType == "new") ? 0 : stage.id;
    return this.stageForm.patchValue({
      name: (this.stageFormType == "new") ? '' : stage.name,
      description: (this.stageFormType == "new") ? '' : stage.description,
      status: (this.stageFormType == "new") ? true : stage.status == "Active" ? true : false,
    })

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
              //console.log(this.formErrors[key]);
            }
          }
        }
      }
    })

  }

  formErrorObject() {
    this.formErrors = {
      'name': '',
      'description': '',
      'status': ''
    }
  }

  get f() { return this.stageForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.stageForm);

    if (this.stageForm.invalid) {
      return;
    }

    const stage = {
      ID: this.wostagesurcde,
      Name: this.f.name.value,
      Description: this.f.description.value,
      Status: (this.f.status.value) ? "A" : "I",
      LoggedInUserId: this.currentUser.userId,
      IsEdit: this.stageFormType == "new" ? false : true
    }

    this.loading = true;
    this.wopmConfigurationService.updateMasterStage(stage)
      .subscribe(
        data => {
          if (data.isSuccess) {
               this.alertService.success(this.saveMsg);
              this.loading = false;
              this.closeStageFormWindow();
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

  refreshForm() {
    // let user:User;
    // this.stageFormType = "new";
    // this.populateStage(user);
    this.stageForm.reset();
  }

  closeStageFormWindow() {
    this.stageFormWindow = false;
    this.closeStageFormWin.emit(this.stageFormWindow)
  }

  convertDate(d, f) {
    var momentDate = moment(d);
    if (!momentDate.isValid()) return d;
    return momentDate.format(f);
  }




}
