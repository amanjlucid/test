import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, SharedService, HelperService } from 'src/app/_services';

@Component({
  selector: 'app-hns-add-scoring-band',
  templateUrl: './hns-add-scoring-band.component.html',
  styleUrls: ['./hns-add-scoring-band.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddScoringBandComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  @Input() selectedDefinition: any;
  @Input() selectedBand: any;
  @Input() scoringbandList: any;
  @Input() range;
  @Input() updatedRange;
  @Input() openAddScoringBand: any;
  @Input() formMode: string;
  @Output() closeAddScoringBand = new EventEmitter<boolean>();
  @Output() successFullSubmit = new EventEmitter<boolean>();
  submitted: boolean = false;
  currentUser: any;
  subs = new SubSink();
  title: string = '';
  formGrp: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'hasscorebandname': {
      'required': 'Band Name is required.',
      'maxlength': 'Maximum length of Budget Code is 10.',
    },
    'hasscorebandlow': {
      'required': 'Band Lower Limit is required.',
    },
    'hasscorebandhigh': {
      'required': 'Band Upper Limit is required.',
    }
  };
  hnsPermission: any = [];
  
  constructor(
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(this.scoringbandList);
    // console.log(this.updatedRange);

    if (this.formMode == 'add') {
      this.title = "New Scoring Band";
    } else if (this.formMode == "edit") {
      this.title = "Change Scoring Band";
    } else if (this.formMode == "view") {
      this.title = "View Scoring Band";
    }

    this.formGrp = this.fb.group({
      hasscorebandname: ['', [Validators.required]],
      hasscorebandlow: [0, [Validators.required]],
      hasscorebandhigh: [0, [Validators.required]],

    });

    if (this.formMode == "add") {
      if (this.range.max != this.updatedRange.max) {
        this.formGrp.patchValue({
          hasscorebandlow: (this.updatedRange.max != 0) ? this.updatedRange.max + 1 : 0,
          hasscorebandhigh: this.range.max,
        })
      }
    }

    if (this.formMode != "add") {
      this.formGrp.patchValue({
        hasscorebandname: this.selectedBand.hasscorebandname,
        hasscorebandlow: this.selectedBand.hasscorebandlow,
        hasscorebandhigh: this.selectedBand.hasscorebandhigh,
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
        this.firstInpElm.nativeElement.focus();
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
      'hasscorebandname': '',
      'hasscorebandlow': '',
      'hasscorebandhigh': '',
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
      formObj.hasscorebandname = formRawVal.hasscorebandname;
      formObj.hasscorebandlow = parseInt(formRawVal.hasscorebandlow);
      formObj.hasscorebandhigh = parseInt(formRawVal.hasscorebandhigh);

      //selected band remove from list
      if (this.formMode == "edit") {
        this.scoringbandList = this.scoringbandList.filter(x => x != this.selectedBand);
      }

      if (this.formMode == "add" || this.formMode == "edit") {

        let message = this.validateScoreData(formRawVal);
        if(message != "")
          {
            this.alertService.error(message);
            return
          }
        }

      if (formObj.hasscorebandhigh > this.range.max) {
        formObj.hasscorebandhigh = this.range.max;
      }

      let scoringBands = Object.assign([], this.scoringbandList);
      scoringBands.push(formObj);
      scoringBands = scoringBands.map(x => {
        x.modifiedby = this.currentUser.userId;
        // x.hasscoringbandname = x.hasscorebandname;
        return x;
      });

      this.sharedService.changeScoringBands(scoringBands);
      this.closeaddScoringBandMethod();

    }
  }

  closeaddScoringBandMethod() {
    this.openAddScoringBand = false;
    this.closeAddScoringBand.emit(this.openAddScoringBand);
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



  validateScoreData(dataItem){

    let thisLower = parseInt(dataItem.hasscorebandlow);
    let thisUpper = parseInt(dataItem.hasscorebandhigh);

    if(thisLower < 0 || thisUpper < 0)
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
        return "The Score Band values cannot be greater than the Maximum Score Value of " + this.range.max
    }

    let overlap  = false;

    for(let obj of this.scoringbandList)
    {

          if(thisLower >= obj.hasscorebandlow && thisLower <= obj.hasscorebandhigh){
              overlap = true;
              break;
        }
          if(thisUpper >= obj.hasscorebandlow && thisUpper <= obj.hasscorebandhigh){
              overlap = true;
              break;
    }

  }

    if(overlap){
        return "The Lower and Upper Score Limits ovelap with those of another score band, they must not ovelap within the definition"
    }

    return "";

  }


}
