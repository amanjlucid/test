import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, UserService, WorksOrdersService } from '../../../_services';
import { CustomValidators } from '../../../_helpers/custom.validator'
import { User } from '../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';


@Component({
  selector: 'app-workorder-form',
  templateUrl: './workorder-form.component.html',
  styleUrls: ['./workorder-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class WorkOrderFormComponent implements OnInit {
  subs = new SubSink();
  userForm: FormGroup;
  @Input() userFormWindow: boolean = false
  @Input() selectedUser:any;
  @Input() userFormType: any
  @Output() closeUserFormWin = new EventEmitter<boolean>();
  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '45';
  public windowLeft = 'auto';
  contractorList: any;
  loading = false;
  submitted = false;
  public windowTitle: string;
  saveMsg: string;
  currentUser;
  assetTemplateListData:any;
  getWorkOrderTypeData:any;
  workOrderProgrammeListData:any;
  WorkOrderContractListData:any;
  GetPhaseTemplateListData:any;
  public addStage = 1;
  public saveParms;
  readInput: boolean
  validationMessage = {

    'woType': {
      'required': 'Work order type is required.',
    },

    'wottemplatetype': {
      'required': 'Asset Template is required.',
    },

    'woprogram': {
      'required': 'Programme is required.',
    },

    'contractName': {
      'required': 'Contract is required.',
    },


    'woname': {
      'required': 'Work Order Name is required.',
      'maxlength': 'Name must be maximum 20 characters.',
      'strinUpperCase': 'Name must be uppercase'
    },

    'wodesc': {
      'required': 'Description is required.',
    },




  };
  formErrors: any;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private worksOrdersService: WorksOrdersService,

    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    //  console.log(this.userFormType)
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getContractor();

    if(this.addStage == 1){
      this.userForm = this.fb.group({
        woname: [''],
        wodesc: [''],
        woType: ['', Validators.required],
        wottemplatetype: ['', Validators.required],
        woprogram: ['', Validators.required],
        contractName: ['', Validators.required],
        wophasetemplate: [''],



      })

    }




    if (this.userFormType == "new") {
      this.readInput = false;
      this.saveMsg = "Work Order created successfully."
      this.windowTitle = "New Work Order";
    } else if (this.userFormType == "edit") {
      this.readInput = true
      this.windowTitle = "Work Order User";
      this.saveMsg = "Work Order updated successfully."
    }

    this.formControlValueChanged();
    this.populateUser(this.selectedUser);
    this.getAssetTemplateList();
    this.getWorkOrderType();
    this.GetWorkOrderProgrammeList();
    this.WorkOrderContractList();
    this.GetPhaseTemplateList();
    this.chRef.detectChanges();
  }




GetPhaseTemplateList() {

  this.subs.add(
    this.worksOrdersService.GetPhaseTemplateList().subscribe(
      (data) => {
        // console.log('WorkOrderContractList '+ JSON.stringify(data) )
        this.GetPhaseTemplateListData = data.data;
        this.chRef.detectChanges();
      },
      error => {
        //console.log(error);
        this.alertService.error(error);
        this.chRef.detectChanges();

      }
    )
  )
}

WorkOrderContractList() {

  let bActiveOnly = true;
  this.subs.add(
    this.worksOrdersService.WorkOrderContractList( bActiveOnly).subscribe(
      (data) => {
        // console.log('WorkOrderContractList '+ JSON.stringify(data) )
        this.WorkOrderContractListData = data.data;
        this.chRef.detectChanges();
      },
      error => {
        //console.log(error);
        this.alertService.error(error);
        this.chRef.detectChanges();

      }
    )
  )
}

GetWorkOrderProgrammeList() {
  this.subs.add(
    this.worksOrdersService.GetWorkOrderProgrammeList().subscribe(
      (data) => {
        // console.log(data)
        this.workOrderProgrammeListData = data.data;
        this.chRef.detectChanges();
      },
      error => {
        //console.log(error);
        this.alertService.error(error);
        this.chRef.detectChanges();

      }
    )
  )
}


  getAssetTemplateList() {
    this.subs.add(
      this.worksOrdersService.getAssetTemplateList().subscribe(
        (data) => {
          // console.log(data)
          this.assetTemplateListData = data.data;
          this.chRef.detectChanges();
        },
        error => {
          //console.log(error);
          this.alertService.error(error);
          this.chRef.detectChanges();

        }
      )
    )
  }

  getWorkOrderType() {
    this.subs.add(
      this.worksOrdersService.getWorkOrderType().subscribe(
        (data) => {
        //   console.log(data)
          this.getWorkOrderTypeData = data.data;
          this.chRef.detectChanges();
        },
        error => {
          //console.log(error);
          this.alertService.error(error);
          this.chRef.detectChanges();

        }
      )
    )
  }







  formControlValueChanged() {


  }



  populateUser(user = null) {
    //console.log(this.selectedUser);
    return this.userForm.patchValue({

      woType: (this.userFormType == "new") ? '' : user.woType,
      wottemplatetype: (this.userFormType == "new") ? '' : user.woType,
      woprogram: (this.userFormType == "new") ? '' : user.woprogram,
      contractName: (this.userFormType == "new") ? '' : user.woprogram,
      wophasetemplate: (this.userFormType == "new") ? '' : user.woprogram,
        woname: (this.userFormType == "new") ? '' : user.woname,
        wodesc: (this.userFormType == "new") ? '' : user.wodesc,


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

      'woType': '',
      'wottemplatetype': '',
      'woprogram': '',
      'contractName': '',
      'wophasetemplate': '',
      'woname': '',
      'wodesc': '',
    }
  }

  get f() { return this.userForm.controls; }

  onSubmit() {



    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.userForm);

    if (this.userForm.invalid) {
      return;
    }





      if(this.addStage == 2){


        this.saveParms = {
           woType:   this.saveParms.woType,
           wottemplatetype:   this.saveParms.wottemplatetype,
           woprogram:   this.saveParms.woprogram,
           contractName:   this.saveParms.contractName,
           wophasetemplate:   this.saveParms.wophasetemplate,
           woname:   this.f.woname.value,
           wodesc:   this.f.wodesc.value,
           IsEdit:   this.userFormType == "new" ? false : true
       }


      }


      if(this.addStage == 1){

        this.saveParms = {

         woType: this.f.woType.value,
         wottemplatetype: this.f.wottemplatetype.value,
         woprogram: this.f.woprogram.value,
         contractName: this.f.woprogram.value,
         wophasetemplate: this.f.woprogram.value,
       }
       

            this.addStage = 2;
            this.userForm = this.fb.group({
              woname: ['', Validators.required],
              wodesc: ['', Validators.required],
              woType: [''],
              wottemplatetype: [''],
              woprogram: [''],
              contractName: [''],
              wophasetemplate: [''],
            })



        }

  //  this.addStage = 2;


    console.log('saveParms '+ JSON.stringify(this.saveParms));

    this.loading = true;

      this.loading = false;
    /*
    this.subs.add(
      this.userService.manageUser(user)
        .subscribe(
          data => {
            //console.log(data);
            if (data.isSuccess) {
              this.userForm.reset();
              this.alertService.success(this.saveMsg);
              this.loading = false;
              this.closeUserFormWindow();
            } else {
              this.loading = false;
              this.alertService.error(data.message);
            }
            this.chRef.detectChanges();
          },
          error => {
            //console.log(error);
            this.alertService.error(error);
            this.loading = false;
          })
    )

    */

  }


  getContractor() {
    this.subs.add(
      this.userService.getContractors().subscribe(
        (data) => {
          // console.log(data)
          this.contractorList = data.data;
          this.chRef.detectChanges();
        },
        error => {
          //console.log(error);
          this.alertService.error(error);
          this.chRef.detectChanges();

        }
      )
    )
  }

  refreshForm() {
    // let user:User;
    // this.userFormType = "new";
    // this.populateUser(user);
    this.userForm.reset();
    this.chRef.detectChanges();
  }

  closeUserFormWindow() {
    this.userFormWindow = false;
    this.closeUserFormWin.emit(this.userFormWindow)
  }

  convertDate(d, f) {
    var momentDate = moment(d);
    if (!momentDate.isValid()) return d;
    return momentDate.format(f);
  }





}
