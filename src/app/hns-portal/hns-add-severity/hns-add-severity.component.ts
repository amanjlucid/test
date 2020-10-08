import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, HelperService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-add-severity',
  templateUrl: './hns-add-severity.component.html',
  styleUrls: ['./hns-add-severity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddSeverityComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  @Input() selectedDefinition: any;
  @Input() selectedSeverity: any;
  @Input() serverityData: any;
  @Input() opneAddSeverity: any;
  @Input() formMode: string;
  @Output() closeAddSeverity = new EventEmitter<boolean>();
  @Output() successFullSubmit = new EventEmitter<boolean>();
  @Input() range: any;
  submitted: boolean = false;
  currentUser: any;
  subs = new SubSink();
  title: string = '';
  formGrp: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'hasseveritycode': {
      'required': 'Severity Code is required.',
      'maxlength': 'Maximum length of Severity Code is 20.',
    },
    'hasseveritydesc': {
      'required': 'Severity Description is required.',
    },
    'hasseverityscore': {
      'maxlength': 'Days to Resolve must be four.',
    }
  };
  hnsPermission: any = [];
  
  constructor(
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.formMode == 'add') {
      this.title = "New Severity";
    } else if (this.formMode == "edit") {
      this.title = "Change Severiy";
    } else if (this.formMode == "view") {
      this.title = "View Severity";
    }

    this.formGrp = this.fb.group({
      hasseveritycode: ['', [Validators.required, Validators.maxLength(20)]],
      hasseveritydesc: [''],
      hasseverityscore: ['', [Validators.maxLength(4)]],
    });

    if (this.formMode == "add") {
      if (this.serverityData.length > 0) {
        const max = this.serverityData.length + 1;//this.serverityData.reduce((max, p) => p.hasseverityscore > max ? p.hasseverityscore : max, this.serverityData[0].hasseverityscore);
        this.formGrp.patchValue({
          hasseverityscore: max,
        })
      } else {
        this.formGrp.patchValue({
          hasseverityscore: 1,
        })
      }
    }

    if (this.formMode != "add") {
      this.formGrp.patchValue({
        hasseveritycode: this.selectedSeverity.hasseveritycode,
        hasseveritydesc: this.selectedSeverity.hasseveritydesc,
        hasseverityscore: this.selectedSeverity.hasseverityscore,
      })
    }

    if (this.formMode == "view") {
      this.formGrp.disable();
    } else if (this.formMode == "add") {
      setTimeout(() => {
        this.firstInpElm.nativeElement.focus();
      }, 200);
    } else if (this.formMode == "edit") {
      setTimeout(() => {
        this.secondInpElm.nativeElement.focus();
      }, 200);
    }

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formErrorObject() {
    this.formErrors = {
      'hasseveritycode': '',
      'hasseveritydesc': '',
      'hasseverityscore': '',
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


  onSubmit(createAnother = null) {
    if (this.formMode == "edit" || this.formMode == "add") {
      this.submitted = true;
      this.formErrorObject(); // empty form error 
      this.logValidationErrors(this.formGrp);

      if (this.formGrp.invalid) {
        return;
      }

      let formRawVal = this.formGrp.getRawValue();
      let formObj: any = {};

      formObj.hascode = this.selectedDefinition.hascode;
      formObj.hasversion = this.selectedDefinition.hasversion;
      formObj.hasseveritycode = formRawVal.hasseveritycode.toUpperCase();
      formObj.hasseveritydesc = formRawVal.hasseveritydesc;
      formObj.hasseverityscore = formRawVal.hasseverityscore;
      formObj.modifiedby = this.currentUser.userId;

      let queryAddEdit: any;
      if (this.formMode == "add") {
        formObj.createdby = this.currentUser.userId;
        queryAddEdit = this.hnsService.addSeverity(formObj);
      } else if (this.formMode == "edit") {
        queryAddEdit = this.hnsService.updateSeverity(formObj);
      }

      queryAddEdit.subscribe(
        data => {
          if (data.isSuccess) {
            if (createAnother == null) {
              this.closeSeverityMethod()
            } else {
              this.formGrp.reset();
              this.formGrp.patchValue({
                hasseverityscore: formObj.hasseverityscore + 1
              })
              setTimeout(() => {
                this.firstInpElm.nativeElement.focus();
              }, 200);
            }
            this.successFullSubmit.emit(true);
          } else {
            this.alertService.error(data.message);
          }
        }
      )

    }
  }


  numberOnly(event): boolean {
    let valLength = event.target.value.toString().length + 1;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    if (valLength > 4) {
      return false;
    }
    return true;
  }

  closeSeverityMethod() {
    this.opneAddSeverity = false;
    this.closeAddSeverity.emit(this.opneAddSeverity);
  }

}
