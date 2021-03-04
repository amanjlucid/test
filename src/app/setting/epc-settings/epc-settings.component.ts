import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { SimpleDateValidator, OrderDateValidator } from 'src/app/_helpers';
import { SettingsService, AlertService, HelperService } from 'src/app/_services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-epc-settings',
  templateUrl: './epc-settings.component.html',
  styleUrls: ['./epc-settings.component.css']
})
export class EpcSettingsComponent implements OnInit {
  subs = new SubSink(); // to unsubscribe services
  currentUser: any;
  settingsForm: FormGroup;

  submitted = false;
  validationMessage = {
    'epcLocation': {
      'required': 'EPC Certificate Location.',
    },
    'live': {
      'required': 'Live Environment is required.',
    },

  };

  formErrors: any;
  errors: Array<string> = [];
  epcSettingData: any;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private settingService: SettingsService,
    private helper: HelperService,
    private _sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.settingsForm = this.fb.group({
      epcLocation: ['', [Validators.required]],
      live: [false, [Validators.required]],
    }
    );

    this.getSettings();

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
      'epcLocation': '',
      'live': '',
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
    
    let formRawVal = this.settingsForm.getRawValue();
    
    const formData = new FormData();
    //formData.append('postedFile', this.imgToUpload[0], this.imgToUpload[0].name);

    formData.append('EPCLocation', formRawVal.epcLocation);
    formData.append('Live', formRawVal.live);



    this.subs.add(
      this.settingService.updateEPCSettings(formData).subscribe(
        data => {
          if (data.isSuccess) {
            this.getSettings();
            this.alertService.success("EPC Settings saved successfully.")
          } else {
            this.alertService.error("Something went wrong.")
          }
          this.submitted = false;
        }
      )
    )
  }

  setTruFalse(val) {
    if (val == "Y" || val == 1) {
      return true;
    } else {
      return false;
    }
  }

  getSettings() {
    this.subs.add(
      this.settingService.getEPCSettings().subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            const res = data.data;
            this.epcSettingData = data.data;
            this.settingsForm.patchValue({
              epcLocation: res.epcLocation,
              live: res.live,
            })
          }
        }
      )
    )
  }


}
