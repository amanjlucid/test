import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HnsPortalService, AlertService, HelperService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-definition-heading',
  templateUrl: './hns-definition-heading.component.html',
  styleUrls: ['./hns-definition-heading.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsDefinitionHeadingComponent implements OnInit, OnDestroy {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  title: string = "";
  subs = new SubSink();
  @Input() defGrpFormMode: string = "create";
  @Input() isOpenDefHeading: boolean = false;
  @Output() closeDefHeading = new EventEmitter<boolean>();
  @Output() isSuccessFullSubmit = new EventEmitter<boolean>();
  @Input() selectedDefinition: any;
  @Input() selectedNode: any;
  @Input() nodeMap: any
  @Input() disableActins: any = false;
  isReadOnly: boolean = true;
  currentUser: any;
  submitted: boolean = false;
  defintionHeadingForm: FormGroup;
  formErrors: any;
  validationMessage = {
    'heading': {
      'required': 'Heading is required.',
      'maxlength': 'Maximum length of H & S Definition Heading is 20.',
    },
    'status': {
      'required': 'Status is required.',
    }
  };
  hnsPermission: any = [];

  constructor(
    private fb: FormBuilder,
    private hnsService: HnsPortalService,
    private helper: HelperService,
    private alertService: AlertService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.defGrpFormMode == "new") {
      this.title = "New Health and Safety Heading";
    } else if (this.defGrpFormMode == "change") {
      this.title = "Change Health and Safety Heading";
    } else if (this.defGrpFormMode == "view") {
      this.title = "View Health and Safety Heading - (In Use - Read Only)";
    }

    // this.title = this.defGrpFormMode == "new" ? "New Health and Safety Heading" : "Change Health and Safety Heading";
    this.defintionHeadingForm = this.fb.group({
      heading: ['', [Validators.required]],
      status: ['A', [Validators.required]],
      createdBy: [''],
      modifiedBy: [''],
      createdDate: [''],
      modifiedDate: [''],
    });

    if (this.defGrpFormMode == "change" || this.defGrpFormMode == "view") {
      this.defintionHeadingForm.patchValue({
        heading: this.selectedNode.hasheadingname,
        status: this.selectedNode.hasheadingstatus,
        createdBy: this.selectedNode.createdby,
        modifiedBy: this.selectedNode.modifiedby,
        createdDate: this.helper.formatDateWithoutTime(this.selectedNode.createddate),
        modifiedDate: this.helper.formatDateWithoutTime(this.selectedNode.modifieddate),
      })
    }

    if (this.disableActins) {
      this.defintionHeadingForm.disable();
    }

    if (this.defGrpFormMode == "new" || this.defGrpFormMode == "change") {
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
      'heading': '',
      'isRepeatable': '',
      'status': '',
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
      this.logValidationErrors(this.defintionHeadingForm);

      let updateMessage = 'updated'
      if (this.defGrpFormMode == "new"){
         updateMessage = 'added'
      }

      if (this.defintionHeadingForm.invalid) {
        return;
      }

      let formRawVal = this.defintionHeadingForm.getRawValue();
      let formObj: any = {};
      formObj.HASHEADINGNAME = formRawVal.heading;
      formObj.HASHEADINGSTATUS = formRawVal.status;
      formObj.MODIFIEDBY = this.currentUser.userId;
      formObj.HASVERSION = this.selectedNode.hasversion;
      formObj.HASCODE = this.selectedNode.hascode;
      formObj.HASGROUPID = this.selectedNode.hasgroupid;

      if (this.defGrpFormMode == "new") {
        formObj.CREATEDBY = this.currentUser.userId;
        formObj.HASHEADINGID = 0;
        formObj.HASHEADINGSEQ = 0;
      } else if (this.defGrpFormMode == "change") {
        formObj.CREATEDBY = this.selectedNode.createdby;
        formObj.CREATEDDATE = this.selectedNode.createddate;
        formObj.HASHEADINGID = this.selectedNode.hasheadingid;
        formObj.HASHEADINGSEQ = this.selectedNode.hasheadingseq;
      }

      this.hnsService.saveHnsHeading(formObj, this.defGrpFormMode).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success('Definition Heading successfully ' +  updateMessage);
            if (createAnother != null) {
              this.defintionHeadingForm.reset();
              this.defintionHeadingForm.patchValue({ status: "A" })
              setTimeout(() => {
                this.firstInpElm.nativeElement.focus();
              }, 200);
            } else {
              this.closeDefHeadingForm();
            }
            this.isSuccessFullSubmit.emit(true);
          }
        }
      )
    }

  }

  closeDefHeadingForm() {
    this.isOpenDefHeading = false;
    this.closeDefHeading.emit(this.isOpenDefHeading);
  }


}
