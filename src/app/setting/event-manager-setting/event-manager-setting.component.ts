import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { SettingsService, AlertService } from 'src/app/_services';

@Component({
  selector: 'app-event-manager-setting',
  templateUrl: './event-manager-setting.component.html',
  styleUrls: ['./event-manager-setting.component.css']
})
export class EventManagerSettingComponent implements OnInit {
  subs = new SubSink(); // to unsubscribe services
  currentUser: any;
  taskSettingForm: FormGroup;
  submitted = false;
  validationMessage = {
    'eventManagerUrl': {
      'required': 'Event Manager Url is required.',
    },
    'taskAutoComplete': {
      'required': 'Task AutoComplete is required.',

    },
    'retentionPeriod': {
      'required': 'Retentions Period is required.',
      'min': 'Retentions Period minimum value can be 0',
      'max': 'Retentions Period maximum value can be 9999'
    },
    'deleteCompleteTask': {
      'required': 'Delete Complete Task is required.',
    },
    'infoTaskAutoComplete': {
      'required': 'Info Task AutoComplete is required.',
    },
    'completionPeriod': {
      'required': 'Completion Period is required.',
      'min': 'Completion Period minimum value can be 0',
      'max': 'Completion Period maximum value can be 9999'
    }

  };
  formErrors: any;
  defaultFormData: any;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private settingService: SettingsService,
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.taskSettingForm = this.fb.group({
      eventManagerUrl: ['', [Validators.required]],
      taskAutoComplete: [''],
      retentionPeriod: [''],
      deleteCompleteTask: [''],
      infoTaskAutoComplete: [''],
      completionPeriod: [''],
    });

    const retentionPeriodControl = this.taskSettingForm.get('retentionPeriod');
    this.taskSettingForm.get('deleteCompleteTask').valueChanges
      .subscribe(val => {
        if (val) {
          retentionPeriodControl.enable()
          retentionPeriodControl.setValue(this.defaultFormData.taskCompleteRetention)
          retentionPeriodControl.setValidators([Validators.required, Validators.min(0), Validators.max(9999)]);
        } else {
          retentionPeriodControl.setValue(0)
          retentionPeriodControl.clearValidators();
          retentionPeriodControl.disable()
        }
        retentionPeriodControl.updateValueAndValidity();
      });

    const completionPeriodControl = this.taskSettingForm.get('completionPeriod');
    this.taskSettingForm.get('infoTaskAutoComplete').valueChanges
      .subscribe(val => {
        if (val) {
          completionPeriodControl.setValue(this.defaultFormData.eventIPER)
          completionPeriodControl.enable()
          completionPeriodControl.setValidators([Validators.required, Validators.min(0), Validators.max(9999)]);
        } else {
          completionPeriodControl.setValue(0)
          completionPeriodControl.clearValidators();
          completionPeriodControl.disable()
        }
        completionPeriodControl.updateValueAndValidity();
      });


    // get default form value on load
    this.getTaskSettingData();
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
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

  formErrorObject() {
    this.formErrors = {
      'eventManagerUrl': '',
      'taskAutoComplete': '',
      'deleteCompleteTask': '',
      'infoTaskAutoComplete': '',
      'completionPeriod': '',
      'retentionPeriod': ''
    }

  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.taskSettingForm);

    // console.log(this.taskSettingForm)
    if (this.taskSettingForm.invalid || this.taskSettingForm.status == "DISABLED") {
      return;
    }

    let formRawVal = this.taskSettingForm.getRawValue();
    let params = {
      EventManagerURL: formRawVal.eventManagerUrl,
      EventAutoComplete: formRawVal.taskAutoComplete ? "Y" : "N",
      TaskCompleteRetention: formRawVal.retentionPeriod,
      EventIPER: formRawVal.completionPeriod,
      EventInfoTaskAutoComplete: formRawVal.infoTaskAutoComplete ? 1 : 0,
      EventDelete: formRawVal.deleteCompleteTask ? 1 : 0,

    }

    this.subs.add(
      this.settingService.eventPortalSettingDefaultValueUpdate(params).subscribe(
        data => {
          if(data.isSuccess){
            this.alertService.success("Tasks setting updated successfully.");
            this.getTaskSettingData();  
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

  getTaskSettingData() {
    this.subs.add(
      this.settingService.eventPortalGetSystemDefaultConfigurationValues().subscribe(
        data => {
          if (data.isSuccess) {
            this.defaultFormData = data.data;
            this.taskSettingForm.patchValue({
              eventManagerUrl: this.defaultFormData.eventManagerURL,
              taskAutoComplete: this.defaultFormData.eventAutoComplete == "Y" ? true : false,
              deleteCompleteTask: this.defaultFormData.eventDelete,
              retentionPeriod: this.defaultFormData.taskCompleteRetention,
              infoTaskAutoComplete: this.defaultFormData.eventInfoTaskAutoComplete,
              completionPeriod: this.defaultFormData.eventIPER,

            })
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


}
