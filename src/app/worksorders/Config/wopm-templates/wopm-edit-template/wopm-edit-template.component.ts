import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService } from '../../../../_services';
import { CustomValidators } from '../../../../_helpers/custom.validator'
import { WopmTemplateModel } from '../../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-wopm-edit-template',
  templateUrl: './wopm-edit-template.component.html',
  styleUrls: ['./wopm-edit-template.component.css']
})

export class WopmEditTemplateComponent implements OnInit {
  subs = new SubSink();
  templateForm: FormGroup;
  @Input() templateFormWindow: boolean = false
  @Input() selectedTemplate: WopmTemplateModel
  @Input() templateFormType: any
  @Input() allTemplates: any[];
  @Output() closetemplateFormWin = new EventEmitter<boolean>();
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
    'templateType': {
      'required': 'Template type is required.',
    },
    'status': {
      'required': 'Status is required.',
    }

  };
  formErrors: any;
  public disableTemplateType: boolean = true;
  wotSequence: number = 0;


  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private alertService: AlertService
  ) { }


  ngOnInit() {
    this.subs.add(
      this.wopmConfigurationService.getWOPMConfigSetting("MILESTONES").subscribe(
        data => {
         let configSetting  = data.data;
         this.disableTemplateType = (configSetting == "N");

        }
      )
    )
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.templateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(1024)]],
      templateType: ['', Validators.required],
      status: ['', Validators.required]

    })

    if (this.templateFormType == "new") {
      this.readInput = false;
      this.saveMsg = "Template created successfully"
      this.windowTitle = "Create Template";
    } else if (this.templateFormType == "edit") {
      this.readInput = true
      this.windowTitle = "Edit Template";
      this.saveMsg = "Template updated successfully"
      this.originalName = this.selectedTemplate.name;
    }

    this.formControlValueChanged();
    this.populateTemplate(this.selectedTemplate);
  }

    
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formControlValueChanged() {
/*     const passwordControl = this.templateForm.get('password');
    const passwordDurationControl = this.templateForm.get('passwordDuration');
    const maxLoginAttemptControl = this.templateForm.get('maxLoginAttempt');
    this.templateForm.get('loginType').valueChanges.subscribe(
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



  populateTemplate(template: WopmTemplateModel = null) {
    this.wotSequence = (this.templateFormType == "new") ? 0 : template.sequence;
    return this.templateForm.patchValue({
      name: (this.templateFormType == "new") ? '' : template.name,
      description: (this.templateFormType == "new") ? '' : template.description,
      templateType: (this.templateFormType == "new") ? 'Asset Template' : template.templateType,
      status: (this.templateFormType == "new") ? true : template.status == "Active" ? true : false,
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
      'templateType': '',
      'status': ''
    }
  }

  get f() { return this.templateForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.templateForm);

    if (this.templateForm.invalid) {
      return;
    }

    if (this.templateFormType == "new" || (this.templateFormType == "edit" && this.originalName != this.f.name.value)) {
      if (this.allTemplates.some(el => el.wotname === this.f.name.value))
      {
        this.loading = false;
        this.alertService.error("The name already exists.");
        return;
      }
    }

    const template = {
      Sequence: this.wotSequence,
      Name: this.f.name.value,
      Description: this.f.description.value,
      TemplateType: this.f.templateType.value,
      Status: (this.f.status.value) ? "A" : "I",
      LoggedInUserId: this.currentUser.userId,
      IsEdit: this.templateFormType == "new" ? false : true
    }

    this.loading = true;
    this.wopmConfigurationService.updateWOPMTemplate(template)
      .subscribe(
        data => {
          if (data.isSuccess) {
            let result = data.data;
            if (result.updated)
            {
              if (this.templateFormType == "edit" && !result.isValid)
              {
                this.saveMsg += " with warnings...   " + result.errorMessage;
              } else {
                this.saveMsg += "."
              }
              this.templateForm.reset();
              this.alertService.success(this.saveMsg);
              this.loading = false;
              this.closetemplateFormWindow();
            }
            else {
              this.loading = false;
              this.alertService.error(result.errorMessage);
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

  refreshForm() {
    // let user:User;
    // this.templateFormType = "new";
    // this.populateTemplate(user);
    this.templateForm.reset();
  }

  closetemplateFormWindow() {
    this.templateFormWindow = false;
    this.closetemplateFormWin.emit(this.templateFormWindow)
  }

  convertDate(d, f) {
    var momentDate = moment(d);
    if (!momentDate.isValid()) return d;
    return momentDate.format(f);
  }




}
