import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HnsPortalService, AlertService } from 'src/app/_services';

@Component({
  selector: 'app-hns-add-template-action',
  templateUrl: './hns-add-template-action.component.html',
  styleUrls: ['./hns-add-template-action.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsAddTemplateActionComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  subs = new SubSink();
  @Input() openActionPopup: boolean = false;
  @Input() actionMode: string = "";
  @Input() selectedNode: any;
  @Input() selectedTemplateAction: any;
  @Output() closeActionPopup = new EventEmitter<boolean>();
  @Output() isSuccessFullSubmit = new EventEmitter<boolean>();
  templateActionForm: FormGroup;
  submitted: boolean = false;
  formErrors: any;
  validationMessage = {
    'action': {
      'required': 'Question action is required.',
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
    this.templateActionForm = this.fb.group({
      action: ['', [Validators.required]],
    });

    this.labelText = "Add Question Action";
    if (this.actionMode == "edit") {
      this.labelText = "Edit Question Action";
      this.templateActionForm.patchValue({
        action: this.selectedTemplateAction.hasactiontext
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
    this.logValidationErrors(this.templateActionForm);

    if (this.templateActionForm.invalid) {
      return;
    }

    let formRawVal = this.templateActionForm.getRawValue();
    let formObj: any = {};
    let actionQuery: any;

    formObj.hasactiontext = formRawVal.action;
    if (this.actionMode == "new") {
      formObj.hascode = this.selectedNode.hascode;
      formObj.hasversion = this.selectedNode.hasversion;
      formObj.hasgroupid = this.selectedNode.hasgroupid;
      formObj.hasheadingId = this.selectedNode.hasheadingid;
      formObj.hasquestionid = this.selectedNode.hasquestionid;
      actionQuery = this.hnsService.saveTemplateAction(formObj);
    } else if (this.actionMode == "edit") {
      formObj.hascode = this.selectedTemplateAction.hascode;
      formObj.hasversion = this.selectedTemplateAction.hasversion;
      formObj.hasgroupid = this.selectedTemplateAction.hasgroupid;
      formObj.hasheadingId = this.selectedTemplateAction.hasheadingid;
      formObj.hasactionseq = this.selectedTemplateAction.hasactionseq;
      formObj.hasquestionid = this.selectedTemplateAction.hasquestionid;
      actionQuery = this.hnsService.updateTemplateAction(formObj);
    }

    actionQuery.subscribe(
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
      'action': '',
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
    this.openActionPopup = false;
    this.closeActionPopup.emit(this.openActionPopup);
  }
}
