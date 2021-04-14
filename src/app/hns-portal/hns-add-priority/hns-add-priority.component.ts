import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, HelperService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-add-priority',
  templateUrl: './hns-add-priority.component.html',
  styleUrls: ['./hns-add-priority.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddPriorityComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  @Input() selectedDefinition: any;
  @Input() selectedPriority: any;
  @Input() priorityData: any;
  @Input() openAddPriority: any;
  @Input() formMode: string;
  @Output() closeAddPriority = new EventEmitter<boolean>();
  @Output() successFullSubmit = new EventEmitter<boolean>();
  @Input() range: any;
  submitted: boolean = false;
  currentUser: any;
  subs = new SubSink();
  title: string = '';
  formGrp: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'code': {
      'required': 'Priority Code is required.',
      'maxlength': 'Maximum length of Priority Code is 10.',
    },
    'description': {
      'required': 'Priority Description is required.',
    },
    'daysToResolve': {
      'maxlength': 'Days to Resolve must be four.',
    },
    'hasrisklower': {
      'required': 'Lower Score Limit is required.',
      'maxlength': 'Lower Score Limit must be four.',
    },
    'hasriskupper': {
      'required': 'Upper Score Limit is required.',
      'maxlength': 'Upper Score Limit must be four.',
    }
  };
  hnsPermission: any = [];
  
  constructor(
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(this.selectedPriority)
    // console.log(this.priorityData)
    // console.log(this.range)

    if (this.formMode == 'add') {
      this.title = "New Priority";
    } else if (this.formMode == "edit") {
      this.title = "Change Priority";
    } else if (this.formMode == "view") {
      this.title = "View Priority";
    }

    if (this.selectedDefinition.hasscoring == 2) {
      this.formGrp = this.fb.group({
        code: ['', [Validators.required, Validators.maxLength(10)]],
        description: ['', [Validators.required]],
        daysToResolve: ['', [Validators.maxLength(4)]],
        hasrisklower: ['', [Validators.required, Validators.maxLength(4)]],
        hasriskupper: ['', [Validators.required, Validators.maxLength(4)]],
      });
    } else {
      this.formGrp = this.fb.group({
        code: ['', [Validators.required, Validators.maxLength(10)]],
        description: ['', [Validators.required]],
        daysToResolve: ['', [Validators.maxLength(4)]],
      });
    }


    if (this.formMode != "add") {
      this.formGrp.patchValue({
        code: this.selectedPriority.haspriority,
        description: this.selectedPriority.hasprioritydescription,
        daysToResolve: this.selectedPriority.hasdaystoresolve,
        hasrisklower: this.selectedPriority.hasrisklower,
        hasriskupper: this.selectedPriority.hasriskupper,
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
      'code': '',
      'description': '',
      'daysToResolve': '',
      'hasrisklower': '',
      'hasriskupper': '',
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

      if (this.selectedDefinition.hasscoring == 2) {

        let message = this.validateScoreData(formRawVal);
        if(message != "")
          {
            this.alertService.error(message);
          return
        }

        let priorityData
        if (this.formMode == "add") {
          priorityData = this.priorityData;
        } else if (this.formMode == "edit") {
          priorityData = this.priorityData.filter(x => x != this.selectedPriority)
        }

      }

      formObj.hascode = this.selectedDefinition.hascode;
      formObj.hasversion = this.selectedDefinition.hasversion;
      formObj.haspriority = formRawVal.code.toUpperCase();;
      formObj.hasprioritydescription = formRawVal.description;
      formObj.hasdaystoresolve = formRawVal.daysToResolve;
      formObj.modifiedby = this.currentUser.userId;
      formObj.hasrisklower = parseInt(formRawVal.hasrisklower);
      formObj.hasriskupper = parseInt(formRawVal.hasriskupper);

      let queryAddEdit;
      if (this.formMode == "add") {
        formObj.createdby = this.currentUser.userId;
        formObj.haspriorityorder = 0;
        queryAddEdit = this.hnsService.addPriority(formObj);
      } else if (this.formMode == "edit") {
        formObj.haspriorityorder = this.selectedPriority.haspriorityorder;
        queryAddEdit = this.hnsService.updatePriority(formObj);
      }

      queryAddEdit.subscribe(
        data => {
          if (data.isSuccess) {
            if (createAnother == null) {
              this.closePriorityMethod()
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
  }

  validateScoreData(dataItem){

    let thisLower = parseInt(dataItem.hasrisklower);
    let thisUpper = parseInt(dataItem.hasriskupper);

    if(thisLower <= 0 || thisUpper <= 0)
    {
      return "Please enter a valid value for both the Lower and Upper Score limits";
    }

    if(thisLower > 0 || thisUpper > 0){
      if(thisUpper < thisLower){
        return "The Upper Score Limit cannot be lower than the Lower Score limit"
      }
    }
    //range: any = { min: 1, max: 1 };
    if(thisUpper > this.range.max || thisLower > this.range.max){
        return "The Score Limit values cannot be greater than the Maximum Score Value of " + this.range.max
    }

    let overlap  = false;

    for(let obj of this.priorityData)
    {
        if(dataItem.code != obj.haspriority)
        {
            if(thisLower >= obj.hasrisklower && thisLower <= obj.hasriskupper){
                overlap = true;
                break;
            }
            if(thisUpper >= obj.hasrisklower && thisUpper <= obj.hasriskupper){
                overlap = true;
                break;
            }
        }
      }

    if(overlap){
        return "The Lower and Upper Score Limits ovelap with those of another priority level, they must not ovelap within the definition"
    }

    return "";

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

  closePriorityMethod() {
    this.openAddPriority = false;
    this.closeAddPriority.emit(this.openAddPriority);
  }





}
