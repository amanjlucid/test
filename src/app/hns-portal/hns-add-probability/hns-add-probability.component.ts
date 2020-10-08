import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, HelperService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-add-probability',
  templateUrl: './hns-add-probability.component.html',
  styleUrls: ['./hns-add-probability.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddProbabilityComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  @Input() selectedDefinition: any;
  @Input() selectedProbability: any;
  @Input() probabilityData: any;
  @Input() opneAddProbability: any;
  @Input() formMode: string;
  @Output() closeAddProbability = new EventEmitter<boolean>();
  @Output() successFullSubmit = new EventEmitter<boolean>();
  @Input() range: any;
  submitted: boolean = false;
  currentUser: any;
  subs = new SubSink();
  title: string = '';
  formGrp: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'hasprobabilitycode': {
      'required': 'Probability Code is required.',
      'maxlength': 'Maximum length of Probability Code is 20.',
    },
    'hasprobabilitydesc': {
      'required': 'Probability Description is required.',
    },
    'hasprobabilityscore': {
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
      this.title = "New Probability";
    } else if (this.formMode == "edit") {
      this.title = "Change Probability";
    } else if (this.formMode == "view") {
      this.title = "View Probability";
    }

    this.formGrp = this.fb.group({
      hasprobabilitycode: ['', [Validators.required, Validators.maxLength(20)]],
      hasprobabilitydesc: [''],
      hasprobabilityscore: ['', [Validators.maxLength(4)]],
    });

    if (this.formMode == "add") {
      if (this.probabilityData.length > 0) {
        const max = this.probabilityData.length + 1; //this.probabilityData.reduce((max, p) => p.hasprobabilityscore > max ? p.hasprobabilityscore : max, this.probabilityData[0].hasprobabilityscore);
        this.formGrp.patchValue({
          hasprobabilityscore: max,
        })
      } else {
        this.formGrp.patchValue({
          hasprobabilityscore: 1,
        })
      }
    }

    if (this.formMode != "add") {
      this.formGrp.patchValue({
        hasprobabilitycode: this.selectedProbability.hasprobabilitycode,
        hasprobabilitydesc: this.selectedProbability.hasprobabilitydesc,
        hasprobabilityscore: this.selectedProbability.hasprobabilityscore,
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
      'hasprobabilitycode': '',
      'hasprobabilitydesc': '',
      'hasprobabilityscore': '',
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
      formObj.hasprobabilitycode = formRawVal.hasprobabilitycode.toUpperCase();
      formObj.hasprobabilitydesc = formRawVal.hasprobabilitydesc;
      formObj.hasprobabilityscore = formRawVal.hasprobabilityscore;
      formObj.modifiedby = this.currentUser.userId;

      let queryAddEdit: any;
      if (this.formMode == "add") {
        formObj.createdby = this.currentUser.userId;
        queryAddEdit = this.hnsService.addProbability(formObj);
      } else if (this.formMode == "edit") {
        queryAddEdit = this.hnsService.updateProbability(formObj);
      }

      queryAddEdit.subscribe(
        data => {
          if (data.isSuccess) {
            if (createAnother == null) {
              this.closeProbability()
            } else {
              this.formGrp.reset();
              this.formGrp.patchValue({
                hasprobabilityscore: formObj.hasprobabilityscore + 1
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

  closeProbability() {
    this.opneAddProbability = false;
    this.closeAddProbability.emit(this.opneAddProbability);
  }

}
