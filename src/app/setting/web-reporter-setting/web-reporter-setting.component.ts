import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { isNumberCheck } from 'src/app/_helpers';
import { SettingsService, AlertService, HelperService } from 'src/app/_services';

@Component({
  selector: 'app-web-reporter-setting',
  templateUrl: './web-reporter-setting.component.html',
  styleUrls: ['./web-reporter-setting.component.css']
})
export class WebReporterSettingComponent implements OnInit {
  subs = new SubSink(); // to unsubscribe services
  webRepoterSettingsForm: FormGroup;

  submitted = false;
  validationMessage = {
    'XportLocation': {
      'required': 'Xport Location is required.',
    },
    'XportDelete': {
      'required': 'Xport Delete is required.',
      'isNotNumber': 'Xport Delete should be an integer value.'
    },


  };

  formErrors: any;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private settingService: SettingsService,
    private helper: HelperService
  ) { }

  ngOnInit() {


    this.webRepoterSettingsForm = this.fb.group({
      XportLocation: ['', [Validators.required]],
      XportDelete: ['', [Validators.required, isNumberCheck()]],
    });

    this.helper.updateNotificationOnTop(); //update notification on top
    this.getSettings();
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
      'XportLocation': '',
      'XportDelete': '',
    }
  }

  get f() { return this.webRepoterSettingsForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.webRepoterSettingsForm);
    if (this.webRepoterSettingsForm.invalid) {
      return;
    }

    const formValues = {
      XportLocation: this.webRepoterSettingsForm.value.XportLocation,
      XportDelete: this.webRepoterSettingsForm.value.XportDelete,
    }

    this.subs.add(
      this.settingService.updateWebReporterSystemDefaultConfigurationValues(formValues).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Settings save successfully.")
          } else {
            this.alertService.error("Something went wrong.")
          }
          this.submitted = false;
        }
      )
    )

  }



  getSettings() {
    this.subs.add(
      this.settingService.getWebReporterSystemDefaultConfigurationValues().subscribe(
        data => {
          if (data.isSuccess) {
            const res = data.data;
            this.webRepoterSettingsForm.patchValue({
              XportLocation: res.xportLocation,
              XportDelete: res.xportDelete,
            })
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }


}
