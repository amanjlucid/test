import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService, AlertService, HelperService, SurveyPortalService, ConfirmationDialogService } from 'src/app/_services';
import { SurveyProjectSettingsModel } from '../../_models';
@Component({
  selector: 'app-survey-project-settings',
  templateUrl: './survey-project-settings.component.html',
  styleUrls: ['./survey-project-settings.component.css']
})
export class SurveyProjectSettingsComponent implements OnInit {

  subs = new SubSink(); // to unsubscribe services
  currentUser: any;
  settingsForm: FormGroup;
  selectedProject;
  surveyProjectLabel: string;
  submitted = false;
  recordDeleted = false;
  errors: Array<string> = [];
  projectSettingData: any;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private surveyService: SurveyPortalService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedProject = JSON.parse(sessionStorage.getItem('SurvProj'));
    sessionStorage.setItem('SurveyAccess', 'SurveyAccess');
    this.surveyProjectLabel = this.selectedProject.SupCode + ' - ' + this.selectedProject.SupName;
    this.settingsForm = this.fb.group({
      batchRecycling: [false],
      automaticImport: [false],
      searchAllStock: [false],
      changeLookupMode: [false],
      lookupMode: ['PROJECT'],
      projectArchiving: [false],
      projectArchivePeriod: [0],
      autoBatch: [false],
      autoBatchArchive: [false],
    });

    this.getSettings();

  }


  /*  We dont require validation on this form as defaults are set:

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
  }*/

  formErrorObject() {

  }

  get f() { return this.settingsForm.controls; }

 batchRecyclingChanged()
  {
     if(!this.settingsForm.controls.batchRecycling.value)
     {
      this.settingsForm.controls.automaticImport.setValue(false);
     }
  }

onSubmit() {
  if (!this.recordDeleted)
  {
    this.submitted = true;
    let formRawVal = this.settingsForm.getRawValue();
    let surveyProjectSettingsModel = new SurveyProjectSettingsModel();
    surveyProjectSettingsModel.SupCode = this.selectedProject.SupCode;
    surveyProjectSettingsModel.Active = 'Y';
    surveyProjectSettingsModel.AutoBatchArchiveYN = 'N';
    surveyProjectSettingsModel.AutoBatchYN = 'N';
    surveyProjectSettingsModel.AutomaticImportYN = (formRawVal.batchRecycling) ? (formRawVal.automaticImport) ? "Y" : "N" : "N";
    surveyProjectSettingsModel.BatchRecyclingYN = (formRawVal.batchRecycling) ? "Y" : "N";
    surveyProjectSettingsModel.ChangeLookupModeYN = (formRawVal.changeLookupMode) ? "Y" : "N";
    surveyProjectSettingsModel.DeleteRecord = '' ;
    surveyProjectSettingsModel.LookupMode = formRawVal.lookupMode;
    surveyProjectSettingsModel.ProjectArchivePeriod = (formRawVal.projectArchivePeriod > 0 && formRawVal.projectArchiving) ? formRawVal.projectArchivePeriod: 0;
    surveyProjectSettingsModel.ProjectArchivingYN = (formRawVal.projectArchiving) ? "Y" : "N";
    surveyProjectSettingsModel.SearchAllStockYN = (formRawVal.searchAllStock) ? "Y" : "N";

    this.subs.add(
      this.surveyService.UpdateProjectSettings(surveyProjectSettingsModel).subscribe(
        data => {
          if (data.isSuccess) {
            this.getSettings();
            this.alertService.success("Survey Settings saved successfully.")
          } else {
            this.alertService.error("Something went wrong.")
          }
          this.submitted = false;
        }
      )
    )
    }
  }

  deleteRecord(){
    this.recordDeleted = true;
    let surveyProjectSettingsModel = new SurveyProjectSettingsModel();
    surveyProjectSettingsModel.SupCode = this.selectedProject.SupCode;
    surveyProjectSettingsModel.Active = '';
    surveyProjectSettingsModel.AutoBatchArchiveYN = '';
    surveyProjectSettingsModel.AutoBatchYN = '';
    surveyProjectSettingsModel.AutomaticImportYN = '';
    surveyProjectSettingsModel.BatchRecyclingYN = '';
    surveyProjectSettingsModel.ChangeLookupModeYN = '';
    surveyProjectSettingsModel.DeleteRecord = 'Y' ;
    surveyProjectSettingsModel.LookupMode = '';
    surveyProjectSettingsModel.ProjectArchivePeriod = 0;
    surveyProjectSettingsModel.ProjectArchivingYN = '';
    surveyProjectSettingsModel.SearchAllStockYN = '';

    this.subs.add(
      this.surveyService.UpdateProjectSettings(surveyProjectSettingsModel).subscribe(
        data => {
          if (data.isSuccess) {
            this.getSettings();
            this.alertService.success("Survey Settings deleted.")
            //this.closeWindow();
          } else {
            this.alertService.error("Something went wrong.")
          }
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
      this.surveyService.GetSurveyProjectSettings(this.selectedProject.SupCode).subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            const res = data.data;
            if(!this.recordDeleted){
              this.projectSettingData = data.data;
              this.settingsForm.patchValue({
                batchRecycling: this.setTruFalse(res.batchRecyclingYN),
                automaticImport: this.setTruFalse(res.automaticImportYN),
                searchAllStock: this.setTruFalse(res.searchAllStockYN),
                changeLookupMode: this.setTruFalse(res.changeLookupModeYN),
                lookupMode: res.lookupMode,
                projectArchiving: this.setTruFalse(res.projectArchivingYN),
                projectArchivePeriod: res.projectArchivePeriod,
                autoBatch: this.setTruFalse(res.autoBatchYN),
                autoBatchArchive: this.setTruFalse(res.autoBatchArchiveYN),
              })
            }
            else
            {
              this.settingsForm.patchValue({
                batchRecycling: this.setTruFalse('N'),
                automaticImport: this.setTruFalse('N'),
                searchAllStock: this.setTruFalse('N'),
                changeLookupMode: this.setTruFalse('N'),
                lookupMode: 'PROJECT',
                projectArchiving: this.setTruFalse('N'),
                projectArchivePeriod: 0,
                autoBatch: this.setTruFalse('N'),
                autoBatchArchive: this.setTruFalse('N'),
              })
              this.recordDeleted = false;
            }
          }
        }
      )
    )
  }

  uploadedSuccessfull(eve) {
    if (eve) {
      this.getSettings();
    }
  }

  public closeWindow() {
    this.router.navigate(['/surveying/projects']);
  }

  public openConfirmationDialog() {
      this.recordDeleted = true;
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete these settings?')
        .then((confirmed) => (confirmed) ? this.deleteRecord() : this.recordDeleted = false)
        .catch(() => this.recordDeleted = false);

        //this.recordDeleted = false;


  }


}
