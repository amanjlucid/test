import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HnsPortalService, AlertService } from 'src/app/_services';


@Component({
  selector: 'app-hns-add-template-issue',
  templateUrl: './hns-add-template-issue.component.html',
  styleUrls: ['./hns-add-template-issue.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddTemplateIssueComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  subs = new SubSink();
  @Input() openPopup: boolean = false;
  @Input() issueMode: string = "";
  @Input() selectedNode: any;
  @Input() selectedTemplateIssue: any;
  @Output() closePopup = new EventEmitter<boolean>();
  @Output() isSuccessFullSubmit = new EventEmitter<boolean>();
  templateIssueForm: FormGroup;
  submitted: boolean = false;
  formErrors: any;
  validationMessage = {
    'issue': {
      'required': 'Question issue is required.',
    }
  }
  labelText: string = "";

  constructor(
    private fb: FormBuilder,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    //console.log(this.selectedNode);
    this.templateIssueForm = this.fb.group({
      issue: ['', [Validators.required]],
    });

    this.labelText = "Add Question Issue";
    if (this.issueMode == "edit") {
      this.labelText = "Edit Question Issue";
      this.templateIssueForm.patchValue({
        issue: this.selectedTemplateIssue.hasissuetext
      })
    }
    setTimeout(() => {
      this.firstInpElm.nativeElement.focus();
    }, 200);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.templateIssueForm);

    if (this.templateIssueForm.invalid) {
      return;
    }

    let formRawVal = this.templateIssueForm.getRawValue();
    let formObj: any = {};
    let issueQuery: any;

    formObj.hasissuetext = formRawVal.issue;
    if (this.issueMode == "new") {
      formObj.hascode = this.selectedNode.hascode;
      formObj.hasversion = this.selectedNode.hasversion;
      formObj.hasgroupid = this.selectedNode.hasgroupid;
      formObj.hasheadingId = this.selectedNode.hasheadingid;
      formObj.hasquestionid = this.selectedNode.hasquestionid;
      issueQuery = this.hnsService.saveTemplateIssue(formObj);
    } else if (this.issueMode == "edit") {
      formObj.hascode = this.selectedTemplateIssue.hascode;
      formObj.hasversion = this.selectedTemplateIssue.hasversion;
      formObj.hasgroupid = this.selectedTemplateIssue.hasgroupid;
      formObj.hasheadingId = this.selectedTemplateIssue.hasheadingid;
      formObj.hasissueseq = this.selectedTemplateIssue.hasissueseq;
      formObj.hasquestionid = this.selectedTemplateIssue.hasquestionid;
      issueQuery = this.hnsService.updateTemplateIssue(formObj);
    }

    issueQuery.subscribe(
      data => {
        if (data.isSuccess) {
          this.closePopupMethod();
          this.isSuccessFullSubmit.emit(true);
        } else {
          this.alertService.error(data.message)
        }
      }
    )


  }

  formErrorObject() {
    this.formErrors = {
      'issue': '',
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

  closePopupMethod() {
    this.openPopup = false;
    this.closePopup.emit(this.openPopup);
  }



}
