import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, SharedService } from '../../../../../_services';
import { CustomValidators } from '../../../../../_helpers/custom.validator'
import { WopmTemplateModel, WopmChecklistMasterModel } from '../../../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-wopm-edit-checklist-master',
  templateUrl: './wopm-edit-checklist-master.component.html',
  styleUrls: ['./wopm-edit-checklist-master.component.css']
})

export class WopmEditChecklistMasterComponent implements OnInit {
  subs = new SubSink();
  checklistForm: FormGroup;
  @Input() selectedChecklist: WopmChecklistMasterModel
  @Input() editType: any
  @Input() editchecklistWindow: boolean = false;
  @Input() wopmTemplateModel: WopmTemplateModel;
  @Input() allChecklists: any[];
  @Output() closechecklistFormWin = new EventEmitter<boolean>();
  originalName: string;
  contractorList: any;
  loading = false;
  submitted = false;
  public windowTitle: string;
  saveMsg: string;
  currentUser;
  readInput: boolean
  validationMessage = {
    'stage': {
      'required': 'Stage is required.',
    },
    'name': {
      'required': 'Name is required.',
      'maxlength': 'Name must be maximum 100 characters.'
    },
    'description': {
      'maxlength': 'Description must be maximum 1024 characters.',
    },
    'comment': {
      'maxlength': 'Comment must be maximum 1024 characters.',
    },
    'status': {
      'required': 'Status is required.',
    },
    'cost': {
      'minError': 'Cost cannot be negative.',
    },
    'useref2': {
      'maxlength': 'User Ref 2 must be maximum 20 characters.',
    },
    'useref3': {
      'maxlength': 'User Ref 3 must be maximum 20 characters.',
    },
    'useref4': {
      'maxlength': 'User Ref 4 must be maximum 20 characters.',
    },
    'useref5': {
      'maxlength': 'User Ref 5 must be maximum 20 characters.',
    },
    'mailmergedoc': {
      'maxlength': 'Mail merge document must be maximum 1024 characters.',
    },

  };
  formErrors: any;
  public disablechecklistType: boolean = true;
  wotSequence: number = 0;
  masterStages: any;
  wopmPortalAccess = [];
  public formatOptions: any = {
    style: 'currency',
    currency: 'GBP',
    currencyDisplay: 'symbol'
};
fileExt: string = "DOCX, DOTX, DOC, DOT";
fileValue: any;


  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private alertService: AlertService,
    private sharedService: SharedService,
  ) { }


  ngOnInit() {

    this.getMasterStages();
    this.subs.add(
      this.sharedService.worksOrdersAccess.subscribe(data => { 
        this.wopmPortalAccess = data;
      })
    )
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.checklistForm = this.fb.group({
      stage: [0, Validators.required],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1024)]],
      status: ['', Validators.required],
      comment: ['', [Validators.maxLength(1024)]],
      responsibility: [],
      cost: [],
      checklisttype: [],
      useref2: ['', [Validators.maxLength(20)]],
      useref3: ['', [Validators.maxLength(20)]],
      useref4: ['', [Validators.maxLength(20)]],
      useref5: ['', [Validators.maxLength(20)]],
      mailmergedoc: ['', [Validators.maxLength(1024)]],
      attachmentrequired: [],
    })


    if (this.editType == "new") {
      this.readInput = false;
      this.saveMsg = "Checklist item created successfully"
      if (this.wopmTemplateModel.templateType == 'Asset Template') {
        this.windowTitle = "Create checklist item";
      } else {
        this.windowTitle = "Create milestone checklist item";
      }

    } else if (this.editType == "edit") {
      this.readInput = true
      if (this.wopmTemplateModel.templateType == 'Asset Template') {
        this.windowTitle = "Edit checklist item";
      } else {
        this.windowTitle = "Edit milestone checklist item";
      }

      this.saveMsg = "Checklist item updated successfully"
      this.originalName = this.selectedChecklist.name;
    }

    this.formControlValueChanged();
    this.populatechecklist(this.selectedChecklist);
  }

    
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formControlValueChanged() {
/*     const passwordControl = this.checklistForm.get('password');
    const passwordDurationControl = this.checklistForm.get('passwordDuration');
    const maxLoginAttemptControl = this.checklistForm.get('maxLoginAttempt');
    this.checklistForm.get('loginType').valueChanges.subscribe(
      (mode: string) => {
        if (mode === 'S') {
          passwordControl.setValidators([Validators.required, Validators.maxLength(10)]);
          passwordDurationControl.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(9999)]);
          maxLoginAttemptControl.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(9999)]);
        }
        else {
          passwordControl.clearValidators();
          passwordDurationControl.clearValidators();
          maxLoginAttemptControl.clearValidators();
        }
        passwordControl.updateValueAndValidity();
        passwordDurationControl.updateValueAndValidity();
        maxLoginAttemptControl.updateValueAndValidity();
      }); */

   }



  populatechecklist(checklist: WopmChecklistMasterModel = null) {
    // this.wotSequence = (this.editType == "new") ? 0 : checklist.sequence;
    return this.checklistForm.patchValue({
      stage: (this.editType == "new") ? '' : checklist.wostagesurcde,
      name: (this.editType == "new") ? '' : checklist.name,
      description: (this.editType == "new") ? '' : checklist.description,
      status: (this.editType == "new") ? true : checklist.status == "Active" ? true : false,
      comment: (this.editType == "new") ? '' : checklist.comment,
      responsibility: (this.editType == "new") ? 'CLIENT' : checklist.responsibility,
      cost: (this.editType == "new") ? 0 : checklist.cost,
      useref2: (this.editType == "new") ? '' : checklist.useref2,
      useref3: (this.editType == "new") ? '' : checklist.useref3,
      useref4: (this.editType == "new") ? '' : checklist.useref4,
      useref5: (this.editType == "new") ? '' : checklist.useref5,
      checklisttype: (this.editType == "new") ? '' : checklist.checklisttype,
      mailmergedoc: (this.editType == "new") ? '' : (checklist.checklisttype != "LETTER") ? "" :checklist.mailmergedoc,
      attachmentrequired: (this.editType == "new") ? 'No' : checklist.attachmentrequired,

    })

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
              var ff = this.formErrors[key];
              this.formErrors[key] += messages[errorKey] + ' ';
              //console.log(this.formErrors[key]);
            }
          }
        }
      }
    })

  }

  formErrorObject() {
    this.formErrors = {
      'stage': '',
      'name': '',
      'description': '',
      'comment': '',      
      'status': '',
      'cost': '',
      'useref2': '',
      'useref3': '',
      'useref4': '',
      'useref5': '',
      'mailmergedoc': '',
      'responsibility': '',
      'checklisttype':'',
    }
  }

  get f() { return this.checklistForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.checklistForm);

    if (this.checklistForm.invalid) {
      return;
    }

    if (this.f.status.value == "Inactive") {
      this.loading = false;
      this.alertService.error("Checklist item must be active.");
      return;
    }

    if (this.f.checklisttype.value == "RELEASE" || this.f.checklisttype.value == "SIGNOFF" || this.f.checklisttype.value == "HANDOVER") {
        if (this.editType == "new") {
          if (this.allChecklists.some(el => el.wocheckspeciaL1 == this.f.checklisttype.value))
          {
            this.loading = false;
            this.alertService.error("Checklist already includes a '" + this.f.checklisttype.value + "' item.");
            return;
          }
        } else {
          if (this.allChecklists.some(el => el.wocheckspeciaL1 == this.f.checklisttype.value && el.wochecksurcde != this.selectedChecklist.wochecksurcde))
          {
            this.loading = false;
            this.alertService.error("Checklist already includes a '" + this.f.checklisttype.value + "' item.");
            return;
          }
        }



    }
    
    if (this.f.checklisttype.value.toUpperCase() == "LETTER")
    {
      if (!(this.f.mailmergedoc.value.toLowerCase().includes(".docx") || this.f.mailmergedoc.value.toLowerCase().includes(".dotx") ||
        this.f.mailmergedoc.value.toLowerCase().includes(".doc") || this.f.mailmergedoc.value.toLowerCase().includes(".dot"))) {
        this.loading = false;
        this.alertService.error("The 'LETTER' checklist type requires a Mail Merge document to be selected.");
        return;
      }
    }




    const checklist = {
      wotsequence: this.selectedChecklist.wotsequence,
      wochecksurcde: this.selectedChecklist.wochecksurcde,
      wostagesurcde: this.f.stage.value,
      wocheckdispseq: this.selectedChecklist.displaysequence,
      wocheckname: this.f.name.value,
      wocheckdesc: this.f.description.value,
      wocheckitemcomment: this.f.comment.value,
      wocheckresp: this.f.responsibility.value,
      wocheckcost: this.f.cost.value,
      woextraref1: this.f.mailmergedoc.value,
      woextraref2: this.f.useref2.value,
      woextraref3: this.f.useref3.value,
      woextraref4: this.f.useref4.value,
      woextraref5: this.f.useref5.value,
      wocheckspecial1: this.f.checklisttype.value,
      wocheckspecial2: (this.f.attachmentrequired.value == "Yes") ? "Y" : (this.f.attachmentrequired.value == "No") ? "N" : "",
      wocheckstatus: (this.f.status.value) ? "A" : "I",
      user: this.currentUser.userId,
      IsEdit: this.editType == "new" ? false : true
    }

    this.loading = true;
    this.wopmConfigurationService.updateChecklistMaster(checklist)
      .subscribe(
        data => {
          if (data.isSuccess) {

              this.checklistForm.reset();
              this.alertService.success(this.saveMsg);
              this.loading = false;
              this.closeChecklistFormWindow();

          } else {
            this.loading = false;
            this.alertService.error(data.message);
          }
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });

  }

  refreshForm() {
    // let user:User;
    // this.editType = "new";
    // this.populatechecklist(user);
    this.checklistForm.reset();
  }

  closeChecklistFormWindow() {
    this.editchecklistWindow = false;
    this.closechecklistFormWin.emit(this.editchecklistWindow)
  }

  convertDate(d, f) {
    var momentDate = moment(d);
    if (!momentDate.isValid()) return d;
    return momentDate.format(f);
  }

  getMasterStages() {
    this.subs.add(
      this.wopmConfigurationService.getWorksOrdersStageMasterList().subscribe(
        data => {
          if (data.isSuccess) {
            this.masterStages = data.data;
          }
        }
      )
    )
  }

  checkWorksOrdersAccess(val: string): Boolean {
    if (this.wopmPortalAccess != undefined) {
    return this.wopmPortalAccess.includes(val);
    }
  }




  uploadFile(file) {
  var uploadObj = { image: [], message: '' };

    if (this.isValidFileExtension(file)) {
      // uploadObj.image.push(file);
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.wopmConfigurationService.UploadMergeMailDoc(formData)
      .subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data) {
              var rdff = data.data.slice(0,5);
              if (data.data.slice(0,5) == "ERROR") {
                this.alertService.error(data.data.slice(5));
                this.loading = false;
              } else {
                this.alertService.success(`File successfully uploaded to ${data.data}.`);
                this.checklistForm.controls['mailmergedoc'].setValue(data.data);
                this.loading = false;
              }
            } else {
              this.alertService.error("There was an error saving the uploaded file.");
              this.loading = false;
            }
          } else {
            this.loading = false;
            this.alertService.error(data.message);
          }
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
    } else {
      this.alertService.error("Invalid file type.");
      this.loading = false;

    }
    this.fileValue =null;
  }


  private isValidFileExtension(file) : boolean {
    // Make array of file extensions
    let extensions: any;
    extensions = (this.fileExt.split(',')).map(function (x) { return x.toLocaleUpperCase().trim() });


      // Get file extension
      let ext = file.name.toUpperCase().split('.').pop() || file.name;
      // Check the extension exists
      return extensions.includes(ext);
  }

  
  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.uploadFile(event.target.files[0])
    }

  }


  changeType(item){
    if (item != "LETTER") {
      this.checklistForm.controls['mailmergedoc'].setValue("")
    }


  }

}
