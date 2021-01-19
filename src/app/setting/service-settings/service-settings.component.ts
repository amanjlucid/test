import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { SimpleDateValidator, OrderDateValidator } from 'src/app/_helpers';
import { SettingsService, AlertService, HelperService } from 'src/app/_services';

@Component({
  selector: 'app-service-settings',
  templateUrl: './service-settings.component.html',
  styleUrls: ['./service-settings.component.css']
})
export class ServiceSettingsComponent implements OnInit {
  subs = new SubSink(); // to unsubscribe services
  currentUser: any;
  settingsForm: FormGroup;

  submitted = false;
  validationMessage = {
    'startDate': {
      'required': 'Start Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',

    },
    'endDate': {
      'required': 'End Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'isLower': 'End Date must be on or after the Start Date.',
    },
    'uploadLocation': {
      'required': 'Upload Location is required.',
    }

  };

  formErrors: any;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private settingService: SettingsService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    //update notification on top
    this.helper.updateNotificationOnTop();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.settingsForm = this.fb.group({
      startDate: ['', [Validators.required, SimpleDateValidator()]],
      endDate: ['', [Validators.required, SimpleDateValidator()]],
      uploadLocation: ['', Validators.required]
    }, {
      validator: [OrderDateValidator('endDate', 'startDate')],
    }
    );

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
      'startDate': '',
      'endDate': '',
      'uploadLocation': ''
    }
  }

  get f() { return this.settingsForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.settingsForm);
    if (this.settingsForm.invalid) {
      return;
    }

    const formValues = {
      StartDate: this.dateFormate(this.settingsForm.value.startDate),
      EndDate: this.dateFormate(this.settingsForm.value.endDate),
      FileLocation: this.settingsForm.value.uploadLocation,
      UserId: this.currentUser.userId
    }
    this.subs.add(
      this.settingService.updateSystemDefaultConfigurationValues(formValues).subscribe(
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

  openCalendar(obj) {
    obj.toggle();
  }

  getSettings() {
    this.subs.add(
      this.settingService.getSettings().subscribe(
        data => {
          if (data.isSuccess) {
            const res = data.data;
            this.settingsForm.patchValue({
              startDate: this.todayDate(res.startDate),
              endDate: this.todayDate(res.endDate),
              uploadLocation: res.fileLocation,
            })
          }
        }
      )
    )
  }

  dateFormate(value: any) {
    return `${this.helper.zeorBeforeSingleDigit(value.day)}-${this.helper.zeorBeforeSingleDigit(value.month)}-${value.year}`
  }

  todayDate(givenDate = null) {
    const date = givenDate == null ? new Date() : new Date(givenDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    return {
      "day": date.getDate(),
      "year": date.getFullYear(),
      "month": date.getMonth() + 1
    }
  }

}
