import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HnsPortalService, AlertService, ConfirmationDialogService, SharedService } from 'src/app/_services';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-hns-edit-scoring-rules',
  templateUrl: './hns-edit-scoring-rules.component.html',
  styleUrls: ['./hns-edit-scoring-rules.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsEditScoringRulesComponent implements OnInit {
  @Input() selectedDefinition: any;
  @Input() selectedNode: any;
  @Input() scoringRulesOpen: boolean = false;
  @Input() nodeMap: any
  @Output() closeScoringRules = new EventEmitter<boolean>();
  scoringRuleForm: FormGroup;
  subs = new SubSink();
  currentUser: any;
  submitted: boolean = false;
  showDeleteBtn: boolean = false;
  showMinMaxField: boolean = true;
  formErrors: any = {};
  scoringRuleText: string = "Yes / No Scoring Rules...";
  hasscoretype = "AnswerValue"
  questionScoring: any;
  percentageQuesScoring: any;
  instanceCountQuesScoring: any
  hnsPermission:any = [];

  constructor(
    private fb: FormBuilder,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    forkJoin([this.hnsService.questionScoring(this.selectedNode), this.hnsService.percentageChangeQuestionScoring(this.selectedNode), this.hnsService.instanceCountQuestionScoring(this.selectedNode)]).subscribe(
      results => {
        this.questionScoring = results[0].data[0];
        this.percentageQuesScoring = results[1].data;
        this.instanceCountQuesScoring = results[2].data;

        if (results[0].data.length > 0) {
          this.showDeleteBtn = true
        } else {
          this.showDeleteBtn = false;
        }
        this.chRef.detectChanges();

        this.scoringRuleForm.patchValue({
          ansType: this.questionScoring != undefined ? this.questionScoring.hasscoretype : this.hasscoretype,
          yesVal: this.questionScoring != undefined ? this.questionScoring.hasscoreyes : 0,
          noVal: this.questionScoring != undefined ? this.questionScoring.hasscoreno : 0,
          naVal: this.questionScoring != undefined ? this.questionScoring.hasscorena : 0,
          minVal: this.questionScoring != undefined ? this.questionScoring.hasscorenummin : 0,
          maxVal: this.questionScoring != undefined ? this.questionScoring.hasscorenummax : 0,
        })
      });

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.selectedNode.hasquestiontype == 'NA') {
      this.scoringRuleText = "Yes / No / NA Scoring Rules...";
    } else if (this.selectedNode.hasquestiontype == 'Info') {
      this.scoringRuleText = "Info Scoring Rules...";
    } else {
      this.scoringRuleText = "Yes / No Scoring Rules...";
    }

    this.scoringRuleForm = this.fb.group({
      ansType: [this.hasscoretype, [Validators.required]],
      yesVal: [0],
      noVal: [0],
      naVal: [0],
      minVal: [0],
      maxVal: [0],
    });

    this.subs.add(
      this.scoringRuleForm.get('ansType').valueChanges.subscribe(
        val => {
          if (val == "InstanceCount") {
            this.showMinMaxField = false;
          } else if (val == "NumericValue") {
            this.showMinMaxField = true;
          }
        }
      )
    )

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )

    // if (this.selectedNode.hasactionifno == "Y" || this.selectedNode.hasactionifyes == "Y" || this.selectedNode.hascommentifna == "Y" || this.selectedNode.hascommentifno == "Y" || this.selectedNode.hascommentifyes == "Y" || this.selectedNode.hasphotoifno == "Y" || this.selectedNode.hasphotoifyes == "Y") {
    //   this.showDeleteBtn = true;
    // } else {
    //   this.showDeleteBtn = false;
    // }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  //AAAANDR3 //CMP_PLAY
  closeScoringRulesMethod() {
    this.scoringRulesOpen = false;
    this.closeScoringRules.emit(this.scoringRulesOpen);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  onSubmit() {
    this.submitted = true;
    let formRawVal = this.scoringRuleForm.getRawValue();

    if (formRawVal.ansType == "AnswerValue") {
      if (formRawVal.yesVal == 0 && formRawVal.noVal == 0) {
        this.alertService.error("Answer value cannot all be 0.");
        return
      }
    }

    if (formRawVal.ansType == "NumericValue") {
      if (formRawVal.minVal == 0 && formRawVal.maxVal == 0) {
        this.alertService.error("Numeric Minimum and Maximum cannot both be 0.");
        return
      }
    }

    let formObj: any = {};
    formObj.hascode = this.selectedNode.hascode;
    formObj.hasversion = this.selectedNode.hasversion;
    formObj.hasgroupid = this.selectedNode.hasgroupid;
    formObj.hasheadingid = this.selectedNode.hasheadingid;
    formObj.hasquestionid = this.selectedNode.hasquestionid;
    formObj.hasscoretype = formRawVal.ansType;
    formObj.hasscoreyes = formRawVal.yesVal;
    formObj.hasscoreno = formRawVal.noVal;
    formObj.hasscorena = formRawVal.naVal;
    formObj.hasscorenummin = formRawVal.minVal;
    formObj.hasscorenummax = formRawVal.maxVal;
    formObj.hasscoremin = 0;
    formObj.hasscoreamax = 0;
    formObj.modifiedby = this.currentUser.userId;

    let scorService: any;
    let updateMessage = ''
    if (this.showDeleteBtn) {
      updateMessage = 'updated'
      scorService = this.hnsService.updateScoringRules(formObj);
    } else {
      updateMessage = 'added'
      scorService = this.hnsService.insertScoringRules(formObj);
    }

    this.subs.add(
      scorService.subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Scoring Rule successfully " + updateMessage)
            this.closeScoringRulesMethod();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

  }

  public openConfirmationDialog() {
    if (this.selectedNode != undefined) {
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.delete() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
      $('.k-window').css({ 'z-index': 1000 });
    }
  }

  delete() {
    this.subs.add(
      this.hnsService.deleteScoringRules(this.selectedNode).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Scoring Rule successfully deleted")
            this.closeScoringRulesMethod();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }



}
