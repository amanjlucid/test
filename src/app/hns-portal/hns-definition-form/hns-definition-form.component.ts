import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, HelperService } from 'src/app/_services';



@Component({
  selector: 'app-hns-definition-form',
  templateUrl: './hns-definition-form.component.html',
  styleUrls: ['./hns-definition-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsDefinitionFormComponent implements OnInit, OnDestroy {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  @Input() definitionFormOpen: boolean = false;
  @Input() selectedDefinition: any;
  @Input() definitionFormMode: string = "new";
  @Output() closeFormEvent = new EventEmitter<boolean>();
  @Output() successfulSubmit = new EventEmitter<boolean>();
  subs = new SubSink();
  title: string = "";
  surveyTypeOpen: boolean = false;
  definitionForm: FormGroup;
  submitted: boolean = false;
  formErrors: any;
  validationMessage = {
    'code': {
      'required': 'Code is required.',
      'maxlength': 'Maximum length of H & S Definition Code is 10.',
    },
    'version': {
      'required': 'Version is required.',
    },
    'name': {
      'required': 'Name is required.',
    },
    'surveyType1': {
      'required': 'Survey Type1 is required.',
    },
    'surveyType2': {
      'required': 'Survey Type2 is required.',
    }
  };
  selectedSurveyType: any;
  isReadOnly: boolean = true;
  currentUser: any;
  successMsg: string = "";

  constructor(
    private fb: FormBuilder,
    private hnsPortalService: HnsPortalService,
    private alertService: AlertService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.definitionForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      version: [1, [Validators.required]],
      inUse: [''],
      name: ['', [Validators.required]],
      status: ['A'],
      surveyType1: ['', [Validators.required]],
      surveyType2: [''],
      scoringMethod: ['0'],
      createdBy: [''],
      modifiedBy: [''],
      createdDate: [''],
      modifiedDate: [''],

    });

    if (this.definitionFormMode == "new") {
      this.title = "New Health and Safety Definition";
      this.successMsg = "created";
    } else if (this.definitionFormMode == "copy") {
      this.title = "Copy Health and Safety Definition";
      this.successMsg = "copied";
      this.subs.add(
        this.hnsPortalService.getDefinitionVersion(this.selectedDefinition.hascode).subscribe(
          data => {
            if (data.isSuccess) {
              this.definitionForm.patchValue({
                version: data.data
              })
            } else {
              this.alertService.error(data.message);
            }
          }
        )
      )
    } else if (this.definitionFormMode == "edit") {
      this.successMsg = "updated";
      this.title = "Edit Health and Safety Definition";
    } else if (this.definitionFormMode == "view") {
      this.successMsg = "updated";
      this.title = "View Health and Safety Definition";
      this.definitionForm.get('scoringMethod').disable();
    }
    this.definitionForm.get('inUse').disable();


    if (this.definitionFormMode != "new") {
      this.definitionForm.patchValue({
        code: this.selectedDefinition.hascode,
        version: this.definitionFormMode == "copy" ? 0 : this.selectedDefinition.hasversion,
        inUse: this.definitionFormMode == "copy" ? false : this.selectedDefinition.hasinuse == "Y" ? true : false,
        name: this.selectedDefinition.hasname,
        status: this.selectedDefinition.hasstatus,
        surveyType1: this.selectedDefinition.srtcode,
        scoringMethod: this.selectedDefinition.hasscoring,
        createdBy: this.selectedDefinition.createdby,
        modifiedBy: this.selectedDefinition.modifiedby,
        createdDate: this.helper.formatDateWithoutTime(this.selectedDefinition.createddate),
        modifiedDate: this.helper.formatDateWithoutTime(this.selectedDefinition.modifieddate),
      })
    }


    if (this.definitionFormMode == "new") {
      setTimeout(() => {
        this.firstInpElm.nativeElement.focus();
      }, 100);
    } else if (this.definitionFormMode == "edit") {
      setTimeout(()=>{ 
        this.secondInpElm.nativeElement.focus();
      },100);
    }



  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeForm() {
    this.definitionFormOpen = false;
    this.closeFormEvent.emit(this.definitionFormOpen);
  }

  formErrorObject() {
    this.formErrors = {
      'code': '',
      'version': '',
      'name': '',
      'surveyType1': '',
    }
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


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.definitionForm);

    if (this.definitionForm.invalid) {
      return;
    }

    let formRawVal = this.definitionForm.getRawValue();
    let formObj: any = {};
    formObj.CreatedBy = this.currentUser.userId;
    formObj.Code = formRawVal.code.toUpperCase();
    formObj.Version = formRawVal.version;
    formObj.Name = formRawVal.name;
    formObj.InUse = formRawVal.inUse ? "Y" : "N";
    formObj.Status = formRawVal.status;
    formObj.ModifiedBy = this.currentUser.userId;;
    formObj.SurveyType = formRawVal.surveyType1;
    formObj.ScoringMethod = formRawVal.scoringMethod;

    if (this.definitionFormMode == "copy") {
      formObj.CopiedHasCode = this.selectedDefinition.hascode;
      formObj.CopiedHasVersion = this.selectedDefinition.hasversion;
      formObj.UserId = this.currentUser.userId;
    }

    this.subs.add(
      this.hnsPortalService.saveDefinition(formObj, this.definitionFormMode).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`New Health and Safety Definition ${this.successMsg} successfully.`);
            this.successfulSubmit.emit(true);
            this.closeForm();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


  openServiceType() {
    $('.defiFormOverlay').addClass('ovrlay');
    this.surveyTypeOpen = true;
  }

  closeSurveyType($event) {
    this.surveyTypeOpen = $event;
    $('.defiFormOverlay').removeClass('ovrlay')
  }

  setSurveyType($event) {
    this.selectedSurveyType = $event;
    this.definitionForm.patchValue({
      surveyType1: this.selectedSurveyType.srtcode,
      surveyType2: this.selectedSurveyType.srtname,
    })
  }

}
