import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HnsPortalService, HelperService, AlertService, SharedService, HnsResultsService } from 'src/app/_services';

@Component({
  selector: 'app-hns-definition-question',
  templateUrl: './hns-definition-question.component.html',
  styleUrls: ['./hns-definition-question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsDefinitionQuestionComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  title: string = "";
  subs = new SubSink();
  @Input() defGrpFormMode: string = "create";
  @Input() isQuestionOpen: boolean = false;
  @Output() isSuccessFullSubmit = new EventEmitter<boolean>();
  @Output() closeDefQuestion = new EventEmitter<boolean>();
  @Input() selectedDefinition: any;
  @Input() selectedNode: any;
  @Input() nodeMap: any
  @Input() disableActins: boolean = false;
  isReadOnly: boolean = true;
  currentUser: any;
  submitted: boolean = false;
  definitionQuesForm: FormGroup;
  formErrors: any = {};
  validationMessage = {
    'question': {
      'required': 'Question is required.',
    },
    'questionCode': {
      'required': 'Question Code is required.',
    },
    'promptYes': {
      'required': 'Prompt text Yes is required.',
    },
    'promptNo': {
      'required': 'Prompt text No is required.',
    },
    'promptNA': {
      'required': 'Prompt text NA is required.',
    },
    'status': {
      'required': 'Status is required.',
    },
    'charCode': {
      'required': 'Characteristic Code is required.',
    }
  };
  datatype: string = "C";
  quesType: string = "1";
  isOpenCharacteristic: boolean = false;
  windowHeight: any = "auto";
  scoringRule = "No Scoring Rules";
  hnsPermission: any = [];

  constructor(
    private fb: FormBuilder,
    private hnsService: HnsPortalService,
    private helper: HelperService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private sharedService: SharedService,
    private hnsResultService: HnsResultsService
  ) { }

  ngOnInit() {

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )


    //console.log({ selectedDf: this.selectedDefinition, selectedNode: this.selectedNode, nodeMap: this.nodeMap })
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.defGrpFormMode == "new") {
      this.title = "New Health and Safety Question";
    } else if (this.defGrpFormMode == "change") {
      this.title = "Change Health and Safety Question";
    } else if (this.defGrpFormMode == "view") {
      this.title = "View Health and Safety Question - (In Use - Read Only)";
    }

    this.getScoringRules(this.selectedNode);

    this.definitionQuesForm = this.fb.group({
      question: ['', [Validators.required, Validators.maxLength(20)]],
      questionCode: ['', [Validators.required]],
      questionType: [this.quesType, [Validators.required]],
      infoType: [this.datatype],
      actionYes: [''],
      actionNo: [''],
      commentYes: [''],
      commentNo: [''],
      commentNA: [''],
      photoYes: [''],
      photoNo: [''],
      promptYes: [''],
      promptNo: [''],
      promptNA: [''],
      charCode: [''],
      charName: [''],
      status: ['A', [Validators.required]],
      createdBy: [''],
      modifiedBy: [''],
      createdDate: [''],
      modifiedDate: [''],
    });

    // default fields disabled
    if (this.quesType != "2") {
      this.definitionQuesForm.get('commentNA').disable();
    }
    this.definitionQuesForm.get('promptYes').disable();
    this.definitionQuesForm.get('promptNo').disable();
    this.definitionQuesForm.get('promptNA').disable();

    if (this.defGrpFormMode == "change" || this.defGrpFormMode == "view") {
      if (this.selectedNode.hasquestiontype == "YesNo") {
        this.quesType = "1";
      } else if (this.selectedNode.hasquestiontype == "NA") {
        this.quesType = "2";
        this.definitionQuesForm.get('commentNA').enable();
      } else if (this.selectedNode.hasquestiontype == "Info") {
        this.quesType = "3";
      }

      
      this.definitionQuesForm.patchValue({
        question: this.selectedNode.hasquestiontext,
        questionCode: this.selectedNode.hasquestioncode,
        questionType: this.quesType,
        infoType: this.selectedNode.hasinfodatatype,
        actionYes: this.selectedNode.hasactionifyes == "Y" ? true : false,
        actionNo: this.selectedNode.hasactionifno == "Y" ? true : false,
        commentYes: this.selectedNode.hascommentifyes == "Y" ? true : false,
        commentNo: this.selectedNode.hascommentifno == "Y" ? true : false,
        commentNA: this.selectedNode.hascommentifna == "Y" ? true : false,
        photoYes: this.selectedNode.hasphotoifyes == "Y" ? true : false,
        photoNo: this.selectedNode.hasphotoifno == "Y" ? true : false,
        promptYes: this.selectedNode.hasyesprompt,
        promptNo: this.selectedNode.hasnoprompt,
        promptNA: this.selectedNode.hasnaprompt,
        charCode: this.selectedNode.chacode,
        charName: '',
        status: this.selectedNode.hasquestionstatus,
        createdBy: this.selectedNode.createdby,
        modifiedBy: this.selectedNode.modifiedby,
        createdDate: this.helper.formatDateWithoutTime(this.selectedNode.createddate),
        modifiedDate: this.helper.formatDateWithoutTime(this.selectedNode.modifieddate),
      })

      // ger characteristic data
      this.subs.add(
        this.hnsResultService.getCharacteristicData(this.selectedNode.hascode, this.selectedNode.hasversion, this.selectedNode.hasgroupid, this.selectedNode.hasheadingid, this.selectedNode.hasquestionid).subscribe(
          data => {
            if (data.isSuccess && data.data.length > 0) {
              this.definitionQuesForm.patchValue({
                charName: data.data[0].chaName
              })
            }
          }
        )
      )


      if (this.defGrpFormMode == "change") {
        if (this.selectedNode.hascommentifyes == "Y") {
          this.definitionQuesForm.get('promptYes').enable();
        }
        if (this.selectedNode.hascommentifno == "Y") {
          this.definitionQuesForm.get('promptNo').enable();
        }
        if (this.selectedNode.hascommentifna == "Y") {
          this.definitionQuesForm.get('promptNA').enable();
        }
      }



    }

    this.subs.add(
      this.definitionQuesForm.get('infoType').valueChanges.subscribe(val => this.datatype = val)
    )

    //const charCode = this.definitionQuesForm.get('charCode');
    this.subs.add(
      this.definitionQuesForm.get('questionType').valueChanges.subscribe(
        val => {
          this.quesType = val;
          if (this.quesType == "3") {
            this.definitionQuesForm.patchValue({
              actionYes: false,
              actionNo: false,
              commentYes: false,
              commentNo: false,
              commentNA: false,
              photoYes: false,
              photoNo: false,
              promptYes: '',
              promptNo: '',
              promptNA: '',
            });
            //charCode.setValidators([Validators.required]);
          } else {
            //charCode.clearValidators();
            this.clearCharacteristic();
            if (this.formErrors.hasOwnProperty('charCode')) {
              this.formErrors.charCode = "";
            }
          }
          if (this.quesType == "2") {
            this.definitionQuesForm.get('commentNA').enable();
          } else {
            this.definitionQuesForm.get('commentNA').disable();
          }
          //charCode.updateValueAndValidity();
        }
      )
    )


    const promptYes = this.definitionQuesForm.get('promptYes');
    this.subs.add(
      this.definitionQuesForm.get('commentYes').valueChanges.subscribe(
        val => {
          if (val) {
            this.definitionQuesForm.get('promptYes').enable();
            promptYes.setValidators([Validators.required]);
          } else {
            this.definitionQuesForm.get('promptYes').disable();
            promptYes.clearValidators();
            if (this.formErrors.hasOwnProperty('promptYes')) {
              this.formErrors.promptYes = "";
            }
          }
          promptYes.updateValueAndValidity();
        }
      )
    )

    const promptNo = this.definitionQuesForm.get('promptNo');
    this.subs.add(
      this.definitionQuesForm.get('commentNo').valueChanges.subscribe(
        val => {
          if (val) {
            this.definitionQuesForm.get('promptNo').enable();
            promptNo.setValidators([Validators.required]);
          } else {
            this.definitionQuesForm.get('promptNo').disable();
            promptNo.clearValidators();
            if (this.formErrors.hasOwnProperty('promptNo')) {
              this.formErrors.promptNo = "";
            }
          }
          promptNo.updateValueAndValidity();
        }
      )
    )

    const promptNA = this.definitionQuesForm.get('promptNA');
    this.subs.add(
      this.definitionQuesForm.get('commentNA').valueChanges.subscribe(
        val => {
          if (val) {
            this.definitionQuesForm.get('promptNA').enable();
            promptNA.setValidators([Validators.required]);
          } else {
            this.definitionQuesForm.get('promptNA').disable();
            promptNA.clearValidators();
            if (this.formErrors.hasOwnProperty('promptNA')) {
              this.formErrors.promptNA = "";
            }
          }
          promptNA.updateValueAndValidity();
        }
      )
    )

    if (this.disableActins) {
      if (this.nodeMap.grpRepeatable == "Y") {
        this.definitionQuesForm.patchValue({ charName: 'Repeatable Group' })
      }
      this.definitionQuesForm.disable();
    }

    if (this.defGrpFormMode === "new" || this.defGrpFormMode == "change") {
      setTimeout(() => {
        this.firstInpElm.nativeElement.focus();
      }, 200);
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formErrorObject() {
    this.formErrors = {
      'question': '',
      'questionCode': '',
      'status': '',
      'promptYes': '',
      'promptNo': '',
      'promptNA': '',
      'charCode': '',
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
    if (this.defGrpFormMode == "change" || this.defGrpFormMode == "new") {
      this.submitted = true;
      this.formErrorObject(); // empty form error 
      this.logValidationErrors(this.definitionQuesForm);

      if (this.definitionQuesForm.invalid) {
        return;
      }

      let formRawVal = this.definitionQuesForm.getRawValue();
      let formObj: any = {};
      //console.log(formRawVal)

      formObj.hascode = this.selectedNode.hascode;
      formObj.hasversion = this.selectedNode.hasversion;
      formObj.hasgroupid = this.selectedNode.hasgroupid;
      formObj.hasheadingid = this.selectedNode.hasheadingid;

      formObj.hasquestiontext = formRawVal.question;
      formObj.hasquestiontype = formRawVal.questionType == 1 ? "YesNo" : formRawVal.questionType == 2 ? "NA" : formRawVal.questionType == 3 ? "Info" : "";
      formObj.hascommentifyes = formRawVal.commentYes ? "Y" : "N";
      formObj.hascommentifno = formRawVal.commentNo ? "Y" : "N";
      formObj.hascommentifna = formRawVal.commentNA ? "Y" : "N";
      formObj.hasyesprompt = formRawVal.promptYes;
      formObj.hasnoprompt = formRawVal.promptNo;
      formObj.hasnaprompt = formRawVal.promptNA;
      formObj.hasactionifyes = formRawVal.actionYes ? "Y" : "N";
      formObj.hasactionifno = formRawVal.actionNo ? "Y" : "N";
      formObj.hasphotoifyes = formRawVal.photoYes ? "Y" : "N";
      formObj.hasphotoifno = formRawVal.photoNo ? "Y" : "N";
      formObj.hasquestionstatus = formRawVal.status;
      formObj.hasinfodatatype = formRawVal.infoType;
      formObj.chacode = formRawVal.charCode;
      formObj.hasquestioncode = formRawVal.questionCode;
      formObj.modifiedby = this.currentUser.userId;

      let questionQuery: any;
      if (this.defGrpFormMode == "new") {
        formObj.createdby = this.currentUser.userId;
        formObj.hasquestionid = 0;
        formObj.hasquestionseq = 0;
        formObj.hasrepeatableGroup = this.nodeMap.grpRepeatable;
        formObj.hasquestioncodeold = '';
        questionQuery = this.hnsService.saveQuestion(formObj);
      } else if (this.defGrpFormMode == "change") {
        formObj.createdby = this.selectedNode.createdby;
        formObj.createddate = this.selectedNode.createddate;
        formObj.hasquestionid = this.selectedNode.hasquestionid;
        formObj.hasquestionseq = this.selectedNode.hasquestionseq;
        questionQuery = this.hnsService.updateQuestion(formObj);

      }

      //console.log(this.selectedNode);
      const params = {
        hasquestioncode: formRawVal.questionCode,
        hasquestioncodeold: '',
        hascode: this.selectedNode.hascode,
        hasversion: this.selectedNode.hasversion,
        hasgroupid: this.selectedNode.hasgroupid,
        hasheadingid: this.selectedNode.hasheadingid,
        hasquestionid: this.selectedNode.hasquestionid,
        hasquestiontype: formObj.hasquestiontype,
        hasactionifyes: formObj.hasactionifyes,
        hasactionifno: formObj.hasactionifno,
        hasinfodatatype: formObj.hasinfodatatype,
        chacode: formRawVal.charCode,
        hasrepeatableGroup: this.nodeMap.grpRepeatable,

      }


      this.hnsService.validateQuesCode(params).subscribe(
        datav => {

          if (datav.isSuccess) {
            questionQuery.subscribe(
              data => {

                if (data.isSuccess) {
                  if (createAnother != null) {
                    this.definitionQuesForm.reset();
                    this.datatype = "C";
                    this.quesType = "1";
                    this.definitionQuesForm.patchValue({
                      questionType: this.quesType,
                      infoType: this.datatype,
                      promptYes: '',
                      promptNo: '',
                      promptNA: '',
                      status: "A"
                    })

                  } else {
                    this.closeDefQuesForm();
                  }
                  this.isSuccessFullSubmit.emit(true);
                } else {
                  this.alertService.error(data.message);
                }
              }
            )
          } else {
            this.alertService.error(datav.data)
          }
        }
      )


    }

  }

  getScoringRules(selectedNode) {
    this.subs.add(
      this.hnsService.getScoringRuleText(selectedNode).subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            this.scoringRule = data.data;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  closeDefQuesForm() {
    this.isQuestionOpen = false;
    this.closeDefQuestion.emit(this.isQuestionOpen);
  }

  openCharacteristic() {
    this.isOpenCharacteristic = true;
    $('.questionOverlay').addClass('ovrlay');
  }

  closeCharacteristic($event) {
    this.isOpenCharacteristic = $event;
    $('.questionOverlay').removeClass('ovrlay');
  }

  selectedCharOutput(selectedChar) {
    this.definitionQuesForm.patchValue({
      charCode: selectedChar.code,
      charName: selectedChar.name
    });
  }

  clearCharacteristic() {
    this.definitionQuesForm.patchValue({
      charCode: '',
      charName: ''
    });
  }



}
