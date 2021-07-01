import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { WorksOrderSettings } from  '../_models';
import { SettingsService, AlertService, HelperService } from 'src/app/_services';
import { onlyImageType } from '../_helpers';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-works-order-settings',
  templateUrl: './works-order-settings.component.html',
  styleUrls: ['./works-order-settings.component.css']
})
export class WorksOrderSettingsComponent implements OnInit {

  subs = new SubSink(); // to unsubscribe services
  currentUser: any;
  settingsForm: FormGroup;

  submitted = false;
  validationMessage = {
    'bypasswork':  {'required': 'this data field is required,'},
    'docsupload':  {'required': 'this data field is required,'},
    'defectmin':  {'required': 'The defect min is required,'},
    'defectmax':  {'required': 'The defect max is required,'},
    'issuefrom':  {'required': 'this data is required,'},
    'issuevarfromnew':  {'required': 'this data field is required,'},
    'mailmergefolder':  {'required': 'Merge folder location is required,'},
    'mailmergetemplate':  {'required': 'Merge Template location is required,'},
    'milestones':  {'required': 'this data is required,'},
    'multicomplete':  {'required': 'this data is required,'},
    'multiissue':  {'required': 'this data is required,'},
    'multivariation':  {'required': 'this data is required,'},
    'useworkcompdate':  {'required': 'this data is required,'},
    'womissuecontractor':  {'required': 'this data is required,'},
    'wodocslocn':  {'required': 'Works Order Documents Location is required,'},
    'workcextr':  {'required': 'this data is required,'},
  };

  formErrors: any;
  imgToUpload: any;
  fileExt: string = "JPG, GIF, PNG, PDF, JPEG";
  maxFiles: number = 5;
  maxSize: number = 5; // 5MB
  uploadStatus = false;
  errors: Array<string> = [];
  SettingData: any;
  showReportImages = false;
  uploadFooterImageLocation: any
  additionalValidation = false;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private settingService: SettingsService,
    private helper: HelperService,
    private _sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    //update notification on top
    this.helper.updateNotificationOnTop();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.settingsForm = this.fb.group({
      bypasswork: ['', [Validators.required]],
      defectmax: [99999],
      defectmin: [0],
      docsupload: ['', [Validators.required]],
      issuefrom: ['', [Validators.required]],
      issuevarfromnew: ['', [Validators.required]],
      mailmergefolder: ['', [Validators.required]],
      mailmergetemplate: ['', [Validators.required]],
      milestones: ['', [Validators.required]],
      multicomplete: ['', [Validators.required]],
      multiissue: ['', [Validators.required]],
      multivariation: ['', [Validators.required]],
      useworkcompdate: ['', [Validators.required]],
      womissuecontractor: ['', [Validators.required]],
      wodocslocn: ['', [Validators.required]],
      workcextr: ['', [Validators.required]],
      worepfoot: [''],

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

    this.additionalValidation = false;
    if (group.controls.defectmax.value <= group.controls.defectmin.value){
      this.formErrors['defectmax'] += 'The Maximum Defect Score must be greater than the Minimum.'
      this.additionalValidation = true;
    }
    if (group.controls.defectmax.value == undefined){
      this.formErrors['defectmax'] += 'The Maximum Defect Score is required.'
      this.additionalValidation = true;
    }
    if (group.controls.defectmin.value == undefined){
      this.formErrors['defectmin'] += 'The Minimum Defect Score is required.'
      this.additionalValidation = true;
    }

  }


  formErrorObject() {
    this.formErrors = {
      'bypasswork': '',
      'defectmax': '',
      'defectmin': '',
      'docsupload': '',
      'issuefrom': '',
      'issuevarfromnew': '',
      'mailmergefolder': '',
      'mailmergetemplate': '',
      'milestones': '',
      'multicomplete': '',
      'multiissue': '',
      'multivariation': '',
      'useworkcompdate': '',
      'womissuecontractor': '',
      'wodocslocn': '',
      'workcextr': '',

    }
  }

  get f() { return this.settingsForm.controls; }

  private isValidFiles(files) {
    // Check Number of files
    if (files.length > this.maxFiles) {
      this.errors.push("Error: At a time you can upload only " + this.maxFiles + " files");
      return;
    }
    this.isValidFileExtension(files);
    return this.errors.length === 0;
  }

  private isValidFileExtension(files) {
    // Make array of file extensions
    var extensions = (this.fileExt.split(','))
      .map(function (x) { return x.toLocaleUpperCase().trim() });
    for (var i = 0; i < files.length; i++) {
      // Get file extension
      var ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
      // Check the extension exists
      var exists = extensions.includes(ext);
      if (!exists) {
        this.errors.push("Error (Extension): " + files[i].name);
      }
      // Check file size
      this.isValidFileSize(files[i]);
    }
  }

  private isValidFileSize(file) {
    var fileSizeinMB = file.size / (1024 * 1000);
    var size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
    if (size > this.maxSize)
      this.errors.push("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
  }


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.settingsForm);
    if (this.settingsForm.invalid || this.additionalValidation) {
      return;
    }

    let worksOrderSettings = new WorksOrderSettings();
    worksOrderSettings.bypasswork = (this.f.bypasswork.value) ? 'Y' : 'N';
    worksOrderSettings.docsupload = (this.f.docsupload.value) ? 'Y' : 'N';
    worksOrderSettings.issuevarfromnew = (this.f.issuevarfromnew.value) ? 'Y' : 'N';
    worksOrderSettings.milestones = (this.f.milestones.value) ? 'Y' : 'N';
    worksOrderSettings.multicomplete = (this.f.multicomplete.value) ? 'Y' : 'N';
    worksOrderSettings.multiissue = (this.f.multiissue.value) ? 'Y' : 'N';
    worksOrderSettings.multivariation = (this.f.multivariation.value) ? 'Y' : 'N';
    worksOrderSettings.useworkcompdate = (this.f.useworkcompdate.value) ? 'Y' : 'N';
    worksOrderSettings.womissuecontractor = (this.f.womissuecontractor.value) ? 'Y' : 'N';
    worksOrderSettings.workcextr = (this.f.workcextr.value) ? 'ENABLED' : 'DISABLED';
    worksOrderSettings.mailmergefolder = (this.f.mailmergefolder.value);
    worksOrderSettings.mailmergetemplate = (this.f.mailmergetemplate.value);
    worksOrderSettings.wodocslocn = (this.f.wodocslocn.value);
    worksOrderSettings.defectmax = (this.f.defectmax.value);
    worksOrderSettings.defectmin = (this.f.defectmin.value);
    worksOrderSettings.issuefrom = (this.f.issuefrom.value);
    worksOrderSettings.userID = this.currentUser.userId;
    this.subs.add(
      this.settingService.updateWorksOrderSettings(worksOrderSettings).subscribe(
        data => {
          if (data.isSuccess) {
            this.getSettings();
            this.alertService.success("Works Orders Settings saved successfully")
          } else {
            this.alertService.error("Works Orders Settings was not saved!")
          }
          this.submitted = false;
        }
      )
    )

  }

  setTruFalse(val) {
    if (val == "Y" || val == 1 || val == "ENABLED") {
      return true;
    } else {
      return false;
    }
  }


  getSettings() {
    this.subs.add(
      this.settingService.getWorksOrdersSettings().subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            const res = data.data;
            this.SettingData = data.data;
            this.settingsForm.patchValue({
              bypasswork: this.setTruFalse(res.bypasswork),
              defectmax: res.defectmax,
              defectmin: res.defectmin,
              docsupload: this.setTruFalse(res.docsupload),
              issuefrom: res.issuefrom,
              issuevarfromnew: this.setTruFalse(res.issuevarfromnew),
              mailmergefolder: res.mailmergefolder,
              mailmergetemplate: res.mailmergetemplate,
              milestones: this.setTruFalse(res.milestones),
              multicomplete: this.setTruFalse(res.multicomplete),
              multiissue: this.setTruFalse(res.multiissue),
              multivariation: this.setTruFalse(res.multivariation),
              useworkcompdate: this.setTruFalse(res.useworkcompdate),
              womissuecontractor: this.setTruFalse(res.womissuecontractor),
              wodocslocn:  res.wodocslocn,
              workcextr: this.setTruFalse(res.workcextr),
              worepfoot: res.worepfoot,
            })
          }
        }
      )
    )
  }

  getImg(img) {
    //console.log(img)
    return this._sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + img);

  }


  openUploadImagePopup() {
    this.uploadFooterImageLocation = this.settingsForm.getRawValue().imagelocal;
    this.showReportImages = true;
    $('.SettingOverlay').addClass('ovrlay');
  }

  closeReportImages($event) {
    this.showReportImages = $event;
    $('.SettingOverlay').removeClass('ovrlay');
  }

  uploadedSuccessfull(eve) {
    if (eve) {
      this.getSettings();
    }
  }

}
