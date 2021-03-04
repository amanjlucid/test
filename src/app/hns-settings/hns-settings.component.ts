import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { SimpleDateValidator, OrderDateValidator } from 'src/app/_helpers';
import { SettingsService, AlertService, HelperService } from 'src/app/_services';
import { onlyImageType } from '../_helpers';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hns-settings',
  templateUrl: './hns-settings.component.html',
  styleUrls: ['./hns-settings.component.css']
})
export class HnsSettingsComponent implements OnInit {

  subs = new SubSink(); // to unsubscribe services
  currentUser: any;
  settingsForm: FormGroup;

  submitted = false;
  validationMessage = {
    'hsdoclocn': {
      'required': 'Assessment Document Upload Location is required.',
    },
    'image': {
      'required': 'Image is required.',
      'invalidExt': 'File extension is not valid'
    },
    'imagelocal': {
      'required': 'Assessment Image Upload Location is required.',
    },
    'hsdownrsvd': {
      'required': 'Download Resolved Issues To Survey Manager is required.',
    },
    'hsphotodnl': {
      'required': 'Download Photos To Survey Manager is required.',
    },
    'hideqcode': {
      'required': 'Hide Question Codes on Reports.',
    },
    'hasdelete': {
      'required': 'Allow Assessment Deletion.',
    }

  };

  formErrors: any;
  imgToUpload: any;
  fileExt: string = "JPG, GIF, PNG, PDF";
  maxFiles: number = 5;
  maxSize: number = 5; // 5MB
  uploadStatus = false;
  errors: Array<string> = [];
  hnsSettingData: any;
  showReportImages = false;
  uploadFooterImageLocation: any

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
      hsdoclocn: ['', [Validators.required]],
      image: ['', [onlyImageType()]],
      imagelocal: ['', [Validators.required]],
      hsdownrsvd: [false, [Validators.required]],
      hsphotodnl: [true, [Validators.required]],
      hideqcode: [false, [Validators.required]],
      hasdelete: [false, [Validators.required]],
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
      'hsdoclocn': '',
      'imagelocal': '',
      'image': '',
      'hsdownrsvd': '',
      'hsphotodnl': '',
      'hideqcode': '',
      'hasdelete': '',
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

  // onFileChange(event) {
  //   if (event.target.files && event.target.files.length) {
  //     // if (!this.isValidFiles(event.target.files)) {
  //     //   this.uploadStatus = false;
  //     //   return;
  //     // }
  //     this.imgToUpload = event.target.files;
  //     //console.log(this.imgToUpload);
  //   }

  // }

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

    formData.append('AssessmentDocUploadLocation', formRawVal.hsdoclocn);
    formData.append('AssessmentImgUploadLocation', formRawVal.imagelocal);
    formData.append('DownloadResolvedIssue', (formRawVal.hsdownrsvd) ? "Y" : "N");
    formData.append('DownloadPhotos', (formRawVal.hsphotodnl) ? "Y" : "N");
    formData.append('HideQuestionCodeOnReport', (formRawVal.hideqcode) ? "Y" : "N");
    formData.append('AllowAssessmentDeletion', "0");
    formData.append('PropertyReportLogoLocation', formRawVal.imagelocal);


    this.subs.add(
      this.settingService.updateHnsSettings(formData).subscribe(
        data => {
          if (data.isSuccess) {
            this.getSettings();
            this.alertService.success("Health and Safety Settings save successfully.")
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

  openCalendar(obj) {
    obj.toggle();
  }

  getSettings() {
    this.subs.add(
      this.settingService.getHnsSettings().subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            const res = data.data;
            this.hnsSettingData = data.data;
            this.settingsForm.patchValue({
              hsdoclocn: res.assessmentDocUploadLocation,
              imagelocal: res.assessmentImgUploadLocation,
              hsdownrsvd: this.setTruFalse(res.downloadResolvedIssue),
              hsphotodnl: this.setTruFalse(res.downloadPhotos),
              hideqcode: this.setTruFalse(res.hideQuestionCodeOnReport),
              hasdelete: this.setTruFalse(res.allowAssessmentDeletion),
            })
            this.uploadFooterImageLocation = res.assessmentImgUploadLocation;
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
    $('.hnsSettingOverlay').addClass('ovrlay');
  }

  closeReportImages($event) {
    this.showReportImages = $event;
    $('.hnsSettingOverlay').removeClass('ovrlay');
  }

  uploadedSuccessfull(eve) {
    if (eve) {
      this.getSettings();
    }
  }

}
