import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, UserService, WorksOrdersService } from '../../../_services';
import { CustomValidators } from '../../../_helpers/custom.validator'
import { User } from '../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-workorder-form',
  templateUrl: './workorder-form.component.html',
  styleUrls: ['./workorder-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class WorkOrderFormComponent implements OnInit {
   wotargetcompletiondate_model: NgbDateStruct;
   woplanstartdate_model: NgbDateStruct;
   woplanenddate_model: NgbDateStruct;
  subs = new SubSink();
  userForm: FormGroup;
  @Input() userFormWindow: boolean = false
  @Input() selectedUser: any;
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
  work_order_no:any;
  public addStage = 1;
  public saveParms;
  calendarPosition: string = "bottom";



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

    'wostatus': {
      'required': 'Status is required.',
    },
    'woactinact': {
      'required': 'Active?inactive is required.',
    },
    'wotargetcompletiondate': {
      'required': 'Target Date is required.',
    },

    'wobudget': {
      'required': 'Budget is required.',
      'pattern': 'Number Only.',
    },

    'purchase_order_no': {
      'required': 'Purchase Order No is required.',
    },


    'wobudgetcode': {
      'required': 'Budget code is required.',
    },


    'plan_year': {
      'required': 'Plan Year is required.',
    },


    'woplanstartdate': {
      'required': 'Plan Start Date is required.',
    },

    'woplanenddate': {
      'required': 'Plan End Date is required.',
    },

    'woinstructions': {
      'required': 'Instructions is required.',
    },

    'wooverheadpct': {
      'required': 'Overhead is required.',
    },


    'woprelimpct': {
      'required': 'Prelim is required.',
    },


    'woprofitpct': {
      'required': 'Profit is required.',
    },

    'woothercostpct': {
      'required': 'Other Cost is required.',
    },

    'contract_payment_type': {
      'required': 'Contract payment Type is required.',
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

    if (this.addStage == 1) {
      this.userForm = this.fb.group({
        woname: [''],
        wodesc: [''],
      //  woType: ['', Validators.required],
      //  wottemplatetype: ['', Validators.required],
    //    woprogram: ['', Validators.required],
      //  contractName: ['', Validators.required],
        woType: [''],
        wottemplatetype: [''],
        woprogram: [''],
        contractName: [''],
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



  GetNewSourceCodeForWorksOrder() {

    this.subs.add(
      this.worksOrdersService.GetNewSourceCodeForWorksOrder().subscribe(
        (data) => {
          // console.log('WorkOrderContractList '+ JSON.stringify(data) )
          this.work_order_no = data.data;
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
      this.worksOrdersService.WorkOrderContractList(bActiveOnly).subscribe(
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
      contractName: (this.userFormType == "new") ? '' : user.contractName,
      wophasetemplate: (this.userFormType == "new") ? '' : user.wophasetemplate,
        woname: (this.userFormType == "new") ? '' : user.woname,
        wodesc: (this.userFormType == "new") ? '' : user.wodesc,
        wostatus: (this.userFormType == "new") ? '' : user.wostatus,
        woactinact: (this.userFormType == "new") ? '' : user.woactinact,
        wotargetcompletiondate: (this.userFormType == "new") ? '' : user.wotargetcompletiondate,
        wobudget: (this.userFormType == "new") ? '' : user.wobudget,
        purchase_order_no: (this.userFormType == "new") ? '' : user.purchase_order_no,
        wobudgetcode: (this.userFormType == "new") ? '' : user.wobudgetcode,
        plan_year: (this.userFormType == "new") ? '' : user.plan_year,
        woplanstartdate: (this.userFormType == "new") ? '' : user.woplanstartdate,
        woplanenddate: (this.userFormType == "new") ? '' : user.woplanenddate,
        woinstructions: (this.userFormType == "new") ? '' : user.woinstructions,
        wooverheadpct: (this.userFormType == "new") ? '' : user.wooverheadpct,
        woprelimpct: (this.userFormType == "new") ? '' : user.woprelimpct,
        woprofitpct: (this.userFormType == "new") ? '' : user.woprofitpct,
        woothercostpct: (this.userFormType == "new") ? '' : user.woothercostpct,
        contract_payment_type: (this.userFormType == "new") ? '' : user.contract_payment_type,


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
  numberOnly(event): boolean {
      const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;

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
      'wostatus': '',
      'woactinact': '',
      'wotargetcompletiondate': '',
      'wobudget': '',
      'purchase_order_no': '',
      'wobudgetcode': '',
      'plan_year': '',
      'woplanstartdate': '',
      'woplanenddate': '',
      'woinstructions': '',
      'wooverheadpct': '',
      'woprelimpct': '',
      'woprofitpct': '',
      'woothercostpct': '',
      'contract_payment_type': '',
    }
  }

  get f() { return this.userForm.controls; }




  onSubmit() {

  //  alert( this.f.contractName.a);

    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.userForm);

    if (this.userForm.invalid) {
      return;
    }





    if (this.addStage == 2) {


      this.saveParms = {
        woType: this.saveParms.woType,
        wottemplatetype: this.saveParms.wottemplatetype,
        woprogram: this.saveParms.woprogram,
        contractName: this.saveParms.contractName,
        wophasetemplate: this.saveParms.wophasetemplate,
        woname: this.f.woname.value,
        wodesc: this.f.wodesc.value,
        IsEdit: this.userFormType == "new" ? false : true
      }

        this.saveParms = {
           WOSEQUENCE:   this.work_order_no,
           WOEXTREF:   this.work_order_no,
        //   woType:   this.saveParms.woType,

          // wottemplatetype:   this.saveParms.wottemplatetype,
          // woprogram:   this.saveParms.woprogram,


           //contractName:   this.saveParms.contractName,
          // cttname:   this.saveParms.cttname,
///cttcode:   this.saveParms.cttcode,




          // wophasetemplate:   this.saveParms.wophasetemplate,
           WONAME:   this.f.woname.value,
           WODESC:   this.f.wodesc.value,
           WOSTATUS:   this.f.wostatus.value,
           WOACTINACT:   this.f.woactinact.value,
          // wotargetcompletiondate:   this.f.wotargetcompletiondate.value,
           WOBUDGET:   this.f.wobudget.value,
          // purchase_order_no:   this.f.purchase_order_no.value,
          // wobudgetcode:   this.f.wobudgetcode.value,
           //plan_year:   this.f.plan_year.value,
        //   woplanstartdate:   this.f.woplanstartdate.value,
        //   woplanenddate:   this.f.woplanenddate.value,
           WOINSTRUCTIONS:   this.f.woinstructions.value,
           WOOVERHEADPCT:   this.f.wooverheadpct.value,
           WOPRELIMPCT:   this.f.woprelimpct.value,
           WOPROFITPCT:   this.f.woprofitpct.value,
           WOOTHERCOSTPCT:   this.f.woothercostpct.value,
           WOCONTRACTTYPE:   this.f.contract_payment_type.value,
           WOCODE1:   this.f.plan_year.value,


           CTTSURCDE : 106,



           WOTSEQUENCE : 328,
           WPRSEQUENCE : 203,
           WOFINALACCOUNT : 123,
           WOBUDGETASSET : 123,
           WOFORECAST : 123,
           WOCOMMITTED : 123,
           WOAPPROVED : 123,
           WOPENDING : 123,
           WOACTUAL : 123,
           WOFORECASTFEE : 123,
           WOCOMMITTEDFEE : 123,
           WOAPPROVEDFEE : 123,
           WOPENDINGFEE : 123,
           WOACTUALFEE : 123,
           WOFORECASTCONFEE : 123,
           WOCOMMITTEDCONFEE : 123,
           WOAPPROVEDCONFEE : 123,
           WOPENDINGCONFEE : 123,
           WOACTUALCONFEE : 123,
           WOINITIALCONTRACTSUM : 123,
           WOCURRENTCONTRACTSUM : 123,
           WOACCEPTEDVALUE : 123,
           WOCONTRACTORISSUEDATE : '1753-01-01 00:00:00.000',
           WOTARGETCOMPLETIONDATE : '20/03/2021 00:00:00',
           WOCONTRACTORACCEPTANCEDATE : '1753-01-01 00:00:00.000',
           WOPLANSTARTDATE : '1753-01-01 00:00:00.000',
           WOPLANENDDATE : '1753-01-01 00:00:00.000',
           WOACTUALSTARTDATE : '1753-01-01 00:00:00.000',
           WOACTUALENDDATE : '1753-01-01 00:00:00.000',
           WOCALCOVERPREMTYPE : 'N',
           WODEFECTLIABPERIODFLAG : 'N',
           WODEFECTLIABPERIODDAYS : 0,
           WOPAYMENT : 0,
           WOCODE2 : null,
           WOCODE3 : this.f.purchase_order_no.value,
           WOCODE4:   this.f.wobudgetcode.value,
           WOCODE5:   'Works Order Milestone',
           WOCODE6:   this.saveParms.woType,
           WOTEXT1:   null,
           WOTEXT2:   null,
           WOTEXT3:   null,
           WOTEXT4:   null,
           WOTEXT5:   null,
           WOTEXT6:   null,
           MPgoA:     'BRIANJ',
           MPgpA:     '17/03/2021 18:30:00',
           MPgqA:     '18/03/2021 10:04:03',
           MPgrA:     'BRIANJ',
           MPgsA:     '17/03/2021 18:30:00',
           MPgtA:     '18/03/2021 10:04:03',





           //IsEdit:   this.userFormType == "new" ? false : true
       }

    }


    if (this.addStage == 1) {

      this.saveParms = {

let contarctSelcted = this.f.contractName.value;
         this.GetNewSourceCodeForWorksOrder();
        this.saveParms = {
         woType: this.f.woType.value,
         wottemplatetype: this.f.wottemplatetype.value,
         woprogram: this.f.woprogram.value,
         contractName: contarctSelcted.conname,
         cttname: contarctSelcted.cttname,
         cttcode: contarctSelcted.cttcode,
         wophasetemplate: this.f.wophasetemplate.value,
       }


            this.addStage = 2;
            this.userForm = this.fb.group({
              woType: [''],
              wottemplatetype: [''],
              woprogram: [''],
              contractName: [''],
              wophasetemplate: [''],
              woname: ['', Validators.required],
              wodesc: ['', Validators.required],
              wostatus: ['', Validators.required],
              woactinact: ['', Validators.required],
              wotargetcompletiondate: ['', Validators.required],

              wobudget: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
              purchase_order_no: ['', Validators.required],
              wobudgetcode: ['', Validators.required],
              plan_year: ['', Validators.required],
              woplanstartdate: ['', Validators.required],
              woplanenddate: ['', Validators.required],
              woinstructions: ['', Validators.required],
              wooverheadpct: ['', Validators.required],
              woprelimpct: ['', Validators.required],
              woprofitpct: ['', Validators.required],
              woothercostpct: ['', Validators.required],
              contract_payment_type: ['', Validators.required],






            })



    }

    //  this.addStage = 2;


    console.log('saveParms ' + JSON.stringify(this.saveParms));

    this.loading = true;

      this.loading = false;

    this.subs.add(
      this.worksOrdersService.InsertWorksOrder(this.saveParms)
        .subscribe(
          data => {
            console.log(data);
            if (data.isSuccess) {
            //  this.userForm.reset();
              this.alertService.success(this.saveMsg);
              this.loading = false;
            //  this.closeUserFormWindow();
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
