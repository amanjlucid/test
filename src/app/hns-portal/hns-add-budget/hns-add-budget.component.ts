import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-add-budget',
  templateUrl: './hns-add-budget.component.html',
  styleUrls: ['./hns-add-budget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddBudgetComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  @Input() selectedDefinition: any;
  @Input() selectedBudget: any;
  @Input() openAddBudget: any;
  @Input() formMode: string;
  @Output() closeAddbudget = new EventEmitter<boolean>();
  @Output() successFullSubmit = new EventEmitter<boolean>();
  submitted: boolean = false;
  currentUser: any;
  subs = new SubSink();
  title: string = '';
  formGrp: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'budget': {
      'required': 'Budget Code is required.',
      'maxlength': 'Maximum length of Budget Code is 10.',
    },
    'description': {
      'required': 'Budget Description is required.',
      'maxlength': 'Maximum length of Budget Description is 50.',
    }
  };
  hnsPermission: any = [];

  constructor(
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.formMode == 'add') {
      this.title = "New Budget";
    } else if (this.formMode == "edit") {
      this.title = "Change Budget";
    } else if (this.formMode == "view") {
      this.title = "View Budget";
    }

    this.formGrp = this.fb.group({
      budget: ['', [Validators.required, Validators.maxLength(10)]],
      description: ['', [Validators.required, Validators.maxLength(50)]],

    });

    if (this.formMode != "add") {
      this.formGrp.patchValue({
        budget: this.selectedBudget.hasbudgetcode,
        description: this.selectedBudget.hasbudgetdesc,
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

  formErrorObject() {
    this.formErrors = {
      'budget': '',
      'description': '',

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
      formObj.hasbudgetdescription = formRawVal.description;

      let queryAddEdit;
      if (this.formMode == "add") {
        formObj.hasbudgetcode = formRawVal.budget.toUpperCase();
        formObj.createdby = this.currentUser.userId;
        queryAddEdit = this.hnsService.addBudget(formObj);
        queryAddEdit.subscribe(
          data => {
            if (data.isSuccess) {
              if (createAnother == null) {
                this.closeBudgetMethod()
              } else {
                this.formGrp.reset();
                setTimeout(() => {
                  this.firstInpElm.nativeElement.focus();
                }, 100);
              }
              this.successFullSubmit.emit(true);
            } else {
              this.alertService.error(data.message);
            }
          }
        )
      } else if (this.formMode == "edit") {
        formObj.hasbudgetcode = this.selectedBudget.hasbudgetcode;
        queryAddEdit = this.hnsService.updateBudget(formObj);
        this.hnsService.validateBudget(this.selectedBudget.hascode, this.selectedBudget.hasversion, this.selectedBudget.hasbudgetcode).subscribe(
          res => {
            if (res.isSuccess) {
              if (res.data == 0) {
                this.alertService.error("This budget code is already in use.")
              } else if (res.data == 1) {
                queryAddEdit.subscribe(
                  data => {
                    if (data.isSuccess) {
                      if (createAnother == null) {
                        this.closeBudgetMethod()
                      } else {
                        this.formGrp.reset();
                        setTimeout(() => {
                          this.firstInpElm.nativeElement.focus();
                        }, 100);
                      }
                      this.successFullSubmit.emit(true);
                    } else {
                      this.alertService.error(data.message);
                    }
                  }
                )
              }
            } else {
              this.alertService.error(res.messsage)
            }
          }
        )
      }

    }
  }

  closeBudgetMethod() {
    this.openAddBudget = false;
    this.closeAddbudget.emit(this.openAddBudget);
  }


}
