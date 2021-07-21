import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HnsPortalService,  AlertService, HelperService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-definition-group',
  templateUrl: './hns-definition-group.component.html',
  styleUrls: ['./hns-definition-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsDefinitionGroupComponent implements OnInit {
  @ViewChild('firstInp') firstInpElm: ElementRef;
  @ViewChild('secondInp') secondInpElm: ElementRef;
  title: string = "";
  subs = new SubSink();
  @Input() isCreateNewGrp: boolean = false;
  @Input() defGrpFormMode: string = "create";
  @Output() closeDefGrp = new EventEmitter<boolean>();
  @Output() isSuccessFullSubmit = new EventEmitter<boolean>();
  @Input() selectedDefinition: any;
  @Input() selectedNode: any;
  @Input() disableActins: boolean = false;
  isReadOnly: boolean = true;
  currentUser: any;
  definitionGrpForm: FormGroup;
  submitted: boolean = false;
  formErrors: any;

  validationMessage = {
    'group': {
      'required': 'Group is required.',
      'maxlength': 'Maximum length of H & S Definition Group is 20.',
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
      this.title = "New Health and Safety Group";
    } else if (this.defGrpFormMode == "change") {
      this.title = "Change Health and Safety Group";
    } else if (this.defGrpFormMode == "view") {
      this.title = "View Health and Safety Group - (In Use - Read Only)";
    }

    //this.title = this.defGrpFormMode == "new" ? "New Health and Safety Group" : "Change Health and Safety Group";

    this.definitionGrpForm = this.fb.group({
      group: ['', [Validators.required]],
      isRepeatable: [''],
      status: ['A', [Validators.required]],
      createdBy: [''],
      modifiedBy: [''],
      createdDate: [''],
      modifiedDate: [''],

    });

    if (this.defGrpFormMode == "change" || this.defGrpFormMode == "view") {
      this.definitionGrpForm.patchValue({
        group: this.selectedNode.hasgroupname,
        isRepeatable: this.selectedNode.hasrepeatable == "Y" ? true : false,
        status: this.selectedNode.hasgroupstatus,
        createdBy: this.selectedNode.createdby,
        modifiedBy: this.selectedNode.modifiedby,
        createdDate: this.helper.formatDateWithoutTime(this.selectedNode.createddate),
        modifiedDate: this.helper.formatDateWithoutTime(this.selectedNode.modifieddate),
      })
    }

    if (this.disableActins) {
      this.definitionGrpForm.disable();
    }

    if (this.defGrpFormMode == "new") {
      setTimeout(() => {
        this.firstInpElm.nativeElement.focus();
      }, 200);
    } else if (this.defGrpFormMode == "change") {
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
      'group': '',
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

      let updateMessage = 'updated'
      if (this.defGrpFormMode == "new"){
         updateMessage = 'added'
      }

      this.submitted = true;
      this.formErrorObject(); // empty form error
      this.logValidationErrors(this.definitionGrpForm);

      if (this.definitionGrpForm.invalid) {
        return;
      }

      let formRawVal = this.definitionGrpForm.getRawValue();
      let formObj: any = {};
      formObj.HASGROUPNAME = formRawVal.group;
      formObj.HASREPEATABLE = formRawVal.isRepeatable == true ? "Y" : "N";
      formObj.HASGROUPSTATUS = formRawVal.status;
      formObj.MODIFIEDBY = this.currentUser.userId;
      formObj.HasVersion = (this.selectedNode != undefined) ? this.selectedNode.hasversion : this.selectedDefinition.hasversion;
      formObj.HasCode = (this.selectedNode != undefined) ? this.selectedNode.hascode : this.selectedDefinition.hascode;

      if (this.defGrpFormMode == "new") {
        formObj.HASGROUPID = 0;
        formObj.HASGROUPSEQ = 0;
        formObj.CREATEDBY = this.currentUser.userId;
      } else if (this.defGrpFormMode == "change") {
        formObj.CREATEDBY = this.selectedNode.createdby;
        formObj.CREATEDDATE = this.selectedNode.createddate;
        formObj.HASGROUPID = this.selectedNode.hasgroupid;
        formObj.HASGROUPSEQ = this.selectedNode.hasgroupseq;
      }

      this.hnsService.saveHnsGrp(formObj, this.defGrpFormMode).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success('Definition Group successfully ' +  updateMessage);
            if (createAnother != null) {
              this.definitionGrpForm.reset();
              this.definitionGrpForm.patchValue({ status: "A" })
              setTimeout(() => {
                this.firstInpElm.nativeElement.focus();
              }, 200);
            } else {
              this.closeDefGroupForm();
            }
            this.isSuccessFullSubmit.emit(true);
          }
        }
      )
    }

  }


  closeDefGroupForm() {
    this.isCreateNewGrp = false;
    this.closeDefGrp.emit(this.isCreateNewGrp);
  }

}
