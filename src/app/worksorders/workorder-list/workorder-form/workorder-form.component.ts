import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WorksOrdersService , HelperService } from '../../../_services';
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
  woForm: FormGroup;
  @Input() woFormWindow: boolean = false
  @Input() selectedWorkOrderAddEdit:any;
  @Input() woFormType: any = 'new';
  @Output() closeWoFormWin = new EventEmitter<boolean>();
  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '45';
  public windowLeft = 'auto';
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
  public FinalSubmit = false;
  calendarPosition: string = "bottom";
  contractSelcted:any = {};
  programSelcted:any = {};
  assetTmpSelcted:any = {};
  validateAddFormError:string = 'N';


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
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
  ) { }


  ngOnDestroy() {
      this.subs.unsubscribe();
  }
  ngOnInit() {

      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

      if (this.addStage == 1 && this.woFormType == "new") {
          this.woForm = this.fb.group({
              woname: [''],
              wodesc: [''],
              woType: ['', Validators.required],
              wottemplatetype: ['', Validators.required],
              woprogram: ['', Validators.required],
              contractName: ['', Validators.required],
              wophasetemplate: [''],



          })

      }
      if (this.woFormType == "new") {
          this.readInput = false;
          this.saveMsg = "Work Order created successfully."
          this.windowTitle = "New Work Order";
      } else if (this.woFormType == "edit") {

          this.addStage = 2;

          this.woForm = this.fb.group({
              cttname: [{
                  value: '',
                  disabled: true
              }],
              cttcode: [{
                  value: '',
                  disabled: true
              }],
              conname: [{
                  value: '',
                  disabled: true
              }],
              wotname: [{
                  value: '',
                  disabled: true
              }],
              woTypevalue: [{
                  value: '',
                  disabled: true
              }],
              woname: [''],
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


          this.readInput = false
          this.windowTitle = "Edit Work Order";
          this.saveMsg = "Work Order updated successfully."
      }

      //  this.formControlValueChanged();



      this.getAllData();

  }

  async getAllData() {


      this.GetPhaseTemplateList();
      this.getWorkOrderType();
      this.GetWorkOrderProgrammeList();

      if (this.woFormType == "edit") {
          await this.firstCallData();
      } else {
          this.getAssetTemplateList();
          this.WorkOrderContractList();
      }
      this.populateWorkOrder(this.selectedWorkOrderAddEdit);
      this.chRef.detectChanges();


  }

  async firstCallData() {

    const promise1 =   this.getAssetTemplateList();
    const promise2 =   this.WorkOrderContractList();

    Promise.all([promise1, promise2]).then((values) => {
        this.EditRecordData();
    });

  }



  async EditRecordData() {

      await this.GetWorksOrderByWOsequence();

      let contData = this.WorkOrderContractListData;

    //  console.log('selectedWorkOrderAddEdit ' + JSON.stringify(this.selectedWorkOrderAddEdit));

      for (let k = 0; k < contData.length; k++) {
          if (contData[k].cttsurcde == this.selectedWorkOrderAddEdit.cttsurcde) {
              this.contractSelcted = contData[k];
          }
      }
      /*
        const woProgramLst = this.workOrderProgrammeListData;


        for(let k=0;k<woProgramLst.length;k++)
        {
           if(woProgramLst[k].wprsequence == this.selectedWorkOrderAddEdit.wprsequence){
            this.programSelcted = woProgramLst[k];
           }
        }
      */
      let assetTmpLst = this.assetTemplateListData;
      for (let k = 0; k < assetTmpLst.length; k++) {
          if (assetTmpLst[k].wotsequence == this.selectedWorkOrderAddEdit.wotsequence) {
              this.assetTmpSelcted = assetTmpLst[k];
          }
      }

      this.chRef.detectChanges();

      let wotname = '';
      let conname = '';
      let cttcode = '';
      let cttname = '';







      if (this.assetTmpSelcted.hasOwnProperty("wotname") ) {

      } else {

          this.assetTmpSelcted.wotname = '';
          this.assetTmpSelcted.wotsequence = this.selectedWorkOrderAddEdit.wotsequence
      }

      if (this.contractSelcted.hasOwnProperty("conname")  && this.contractSelcted.hasOwnProperty("cttcode") && this.contractSelcted.hasOwnProperty("cttname")) {

      } else {
          this.contractSelcted.conname = '';
          this.contractSelcted.cttcode = '';
          this.contractSelcted.cttname = '';
          this.contractSelcted.cttsurcde = this.selectedWorkOrderAddEdit.cttsurcde;

      }


    // console.log('selectedWorkOrderAddEdit edit '+ JSON.stringify( this.selectedWorkOrderAddEdit));
      this.woForm.patchValue({
          conname: (this.contractSelcted.conname) ? this.contractSelcted.conname : '',
          cttcode: (this.contractSelcted.cttcode) ? this.contractSelcted.cttcode : '',
          cttname: (this.contractSelcted.cttname) ? this.contractSelcted.cttname : '',
          wotname: (this.assetTmpSelcted.wotname) ? this.assetTmpSelcted.wotname : '',
          woTypevalue: (this.selectedWorkOrderAddEdit.wocodE6) ? this.selectedWorkOrderAddEdit.wocodE6 : '',
          woname: (this.selectedWorkOrderAddEdit.wocodE6) ? this.selectedWorkOrderAddEdit.woname : '',
          wodesc: (this.selectedWorkOrderAddEdit.wodesc) ? this.selectedWorkOrderAddEdit.wodesc : '',
          wostatus: (this.selectedWorkOrderAddEdit.wostatus) ? this.selectedWorkOrderAddEdit.wostatus : '',
          woactinact: (this.selectedWorkOrderAddEdit.woactinact) ? this.selectedWorkOrderAddEdit.woactinact : '',
          wotargetcompletiondate: (this.selectedWorkOrderAddEdit.wotargetcompletiondate) ? this.helperService.ngbDatepickerFormat(this.selectedWorkOrderAddEdit.wotargetcompletiondate) : '',
          wobudget: (this.selectedWorkOrderAddEdit.wobudget) ? this.selectedWorkOrderAddEdit.wobudget : 0,
          purchase_order_no: (this.selectedWorkOrderAddEdit.wocodE3) ? this.selectedWorkOrderAddEdit.wocodE3 : '',
          wobudgetcode: (this.selectedWorkOrderAddEdit.wocodE4) ? this.selectedWorkOrderAddEdit.wocodE4 : '',
          plan_year: (this.selectedWorkOrderAddEdit.wocodE1) ? this.selectedWorkOrderAddEdit.wocodE1 : '',
          woplanstartdate: (this.selectedWorkOrderAddEdit.woplanstartdate) ? this.helperService.ngbDatepickerFormat(this.selectedWorkOrderAddEdit.woplanstartdate) : '',
          woplanenddate: (this.selectedWorkOrderAddEdit.woplanenddate) ? this.helperService.ngbDatepickerFormat(this.selectedWorkOrderAddEdit.woplanenddate) : '',
          woinstructions: (this.selectedWorkOrderAddEdit.woinstructions) ? this.selectedWorkOrderAddEdit.woinstructions : '',
          wooverheadpct: (this.selectedWorkOrderAddEdit.wooverheadpct) ? this.selectedWorkOrderAddEdit.wooverheadpct : 0,
          woprelimpct: (this.selectedWorkOrderAddEdit.woprelimpct) ? this.selectedWorkOrderAddEdit.woprelimpct : 0,
          woprofitpct: (this.selectedWorkOrderAddEdit.woprofitpct) ? this.selectedWorkOrderAddEdit.woprofitpct : 0,
          woothercostpct: (this.selectedWorkOrderAddEdit.woothercostpct) ? this.selectedWorkOrderAddEdit.woothercostpct : 0,
          contract_payment_type: (this.selectedWorkOrderAddEdit.wocontracttype) ? this.selectedWorkOrderAddEdit.wocontracttype : '',
      })


      this.chRef.detectChanges();





  }



  async GetWorksOrderByWOsequence() {

      this.work_order_no = this.selectedWorkOrderAddEdit.wosequence;
      let promise = new Promise((resolve, reject) => {


          this.worksOrdersService.GetWorksOrderByWOsequence(this.work_order_no).subscribe(
              (data) => {
                  this.selectedWorkOrderAddEdit = data.data;
                  this.chRef.detectChanges();
                  resolve(true);
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      });
      return promise;
  }




  GetNewSourceCodeForWorksOrder() {

      this.subs.add(
          this.worksOrdersService.GetNewSourceCodeForWorksOrder().subscribe(
              (data) => {
                  this.work_order_no = data.data;
                  this.chRef.detectChanges();
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      )
  }


  GetPhaseTemplateList() {

      let promise = new Promise((resolve, reject) => {


          this.worksOrdersService.GetPhaseTemplateList().subscribe(
              (data) => {
                  this.GetPhaseTemplateListData = data.data;
                  this.chRef.detectChanges();
                  resolve(true);
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      });
      return promise;

  }

  WorkOrderContractList() {

      let bActiveOnly = true;
      let promise = new Promise((resolve, reject) => {


          this.worksOrdersService.WorkOrderContractList(bActiveOnly).subscribe(
              (data) => {
                  this.WorkOrderContractListData = data.data;
                  this.chRef.detectChanges();
                  resolve(true);
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      });
      return promise;




  }

  GetWorkOrderProgrammeList() {

      let promise = new Promise((resolve, reject) => {


          this.worksOrdersService.GetWorkOrderProgrammeList().subscribe(
              (data) => {
                  this.workOrderProgrammeListData = data.data;
                  this.chRef.detectChanges();
                  resolve(true);
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      });
      return promise;




  }

  getAssetTemplateList() {

      let promise = new Promise((resolve, reject) => {


          this.worksOrdersService.getAssetTemplateList().subscribe(
              (data) => {
                  this.assetTemplateListData = data.data;
                  this.chRef.detectChanges();
                      resolve(true);
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      });
      return promise;



  }

  getAssetTemplateListOld() {


      this.subs.add(

          this.worksOrdersService.getAssetTemplateList().subscribe(
              (data) => {
                  this.assetTemplateListData = data.data;
                  this.chRef.detectChanges();
              },
              error => {
                  this.alertService.error(error);
                  this.chRef.detectChanges();

              }
          )
      )

  }


  getWorkOrderType() {


      let promise = new Promise((resolve, reject) => {
          this.subs.add(
              this.worksOrdersService.getWorkOrderType().subscribe(
                  (data) => {
                      this.getWorkOrderTypeData = data.data;
                      this.chRef.detectChanges();
                      resolve(true);
                  },
                  error => {
                      this.alertService.error(error);
                      this.chRef.detectChanges();

                  }
              )
          )
      });
      return promise;


  }

  formControlValueChanged() {

  }

  populateWorkOrder(item = null) {



      let promise = new Promise((resolve, reject) => {




          this.woForm.patchValue({
              woType: (this.woFormType == "new") ? '' : item.woType,
              wottemplatetype: (this.woFormType == "new") ? '' : item.wotsequence,
              woprogram: (this.woFormType == "new") ? '' : item.wprsequence,
              contractName: (this.woFormType == "new") ? '' : item.cttsurcde,
              wophasetemplate: (this.woFormType == "new") ? '' : item.wophasetemplate,
          });

          resolve(true);


      });
      return promise;

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

  get f() {
      return this.woForm.controls;
  }

  onEditSubmit() {


      this.submitted = true;
      this.formErrorObject(); // empty form error
      this.logValidationErrors(this.woForm);

      if (this.woForm.invalid) {
          return;
      }




  }

  onSubmitEdit() {

      this.submitted = true;
      this.formErrorObject(); // empty form error
      this.logValidationErrors(this.woForm);

      if (this.woForm.invalid) {
          return;
      }


      this.FinalSubmit = true;
      this.saveParms = {
          WOSEQUENCE: this.work_order_no,
          WOEXTREF: this.work_order_no,
          WONAME: this.f.woname.value,
          WODESC: this.f.wodesc.value,
          WOSTATUS: this.f.wostatus.value,
          WOACTINACT: this.f.woactinact.value,
          WOBUDGET: this.f.wobudget.value,
          WOINSTRUCTIONS: this.f.woinstructions.value,
          WOOVERHEADPCT: this.f.wooverheadpct.value,
          WOPRELIMPCT: this.f.woprelimpct.value,
          WOPROFITPCT: this.f.woprofitpct.value,
          WOOTHERCOSTPCT: this.f.woothercostpct.value,
          WOCONTRACTTYPE: this.f.contract_payment_type.value,
          WOCODE1: this.f.plan_year.value,
          CTTSURCDE: this.contractSelcted.cttsurcde,
          WOTSEQUENCE: this.assetTmpSelcted.wotsequence,
          WPRSEQUENCE: this.selectedWorkOrderAddEdit.wprsequence,
          WOFINALACCOUNT: 0,
          WOBUDGETASSET: 0,
          WOFORECAST: 0,
          WOCOMMITTED: 0,
          WOAPPROVED: 0,
          WOPENDING: 0,
          WOACTUAL: 0,
          WOFORECASTFEE: 0,
          WOCOMMITTEDFEE: 0,
          WOAPPROVEDFEE: 0,
          WOPENDINGFEE: 0,
          WOACTUALFEE: 0,
          WOFORECASTCONFEE: 0,
          WOCOMMITTEDCONFEE: 0,
          WOAPPROVEDCONFEE: 0,
          WOPENDINGCONFEE: 0,
          WOACTUALCONFEE: 0,
          WOINITIALCONTRACTSUM: 0,
          WOCURRENTCONTRACTSUM: 0,
          WOACCEPTEDVALUE: 0,
          WOCONTRACTORISSUEDATE: '1753-01-01 00:00:00.000',
          WOTARGETCOMPLETIONDATE: this.dateFormate(this.f.wotargetcompletiondate.value),
          WOCONTRACTORACCEPTANCEDATE: '1753-01-01 00:00:00.000',
          WOPLANSTARTDATE: this.dateFormate(this.f.woplanstartdate.value),
          WOPLANENDDATE: this.dateFormate(this.f.woplanenddate.value),
          WOACTUALSTARTDATE: '1753-01-01 00:00:00.000',
          WOACTUALENDDATE: '1753-01-01 00:00:00.000',
          WOCALCOVERPREMTYPE: 'N',
          WODEFECTLIABPERIODFLAG: 'N',
          WODEFECTLIABPERIODDAYS: 0,
          WOPAYMENT: 0,
          WOCODE2: '',
          WOCODE3: this.f.purchase_order_no.value,
          WOCODE4: this.f.wobudgetcode.value,
          WOCODE5: 'Works Order Milestone',
          WOCODE6: this.selectedWorkOrderAddEdit.wocodE6,
          WOTEXT1: '',
          WOTEXT2: '',
          WOTEXT3: '',
          WOTEXT4: '',
          WOTEXT5: '',
          WOTEXT6: '',
          MPgoA: 'BRIANJ',
          MPgpA: '2021-03-17 18:30:00',
          MPgqA: '2021-03-17 18:30:00',
          MPgrA: 'BRIANJ',
          MPgsA: '2021-03-17 18:30:00',
          MPgtA: '2021-03-17 18:30:00',
      }



      //console.log('Edited saveParms ' + JSON.stringify(this.saveParms));


      if (this.FinalSubmit == true) {

          this.loading = true;

          this.subs.add(
              this.worksOrdersService.UpdateWorksOrder(this.saveParms)
              .subscribe(
                  data => {
                    //  console.log(data);
                      if (data.isSuccess) {
                          this.woForm.reset();
                          this.alertService.success(this.saveMsg);
                          this.loading = false;
                          this.closewoFormWindow();
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



  }


  onSubmit() {
      if (this.woFormType == 'new') {
          this.onSubmitAdd();
      }
      if (this.woFormType == 'edit') {
          this.onSubmitEdit();
      }
  }


  getDetectorCheck() {
      this.chRef.detach();
      this.chRef.detectChanges();
      this.chRef.reattach();
    //  console.log('FOR DETECTOR CHANGE');
  }


  onSubmitAdd() {

      this.submitted = true;
      this.formErrorObject(); // empty form error
      this.logValidationErrors(this.woForm);

      if (this.woForm.invalid) {
          return;
      }


      if (this.addStage == 2) {


          let woType = this.saveParms.woType;

          this.FinalSubmit = true;
          this.saveParms = {
              WOSEQUENCE: this.work_order_no,
              WOEXTREF: this.work_order_no,
              WONAME: this.f.woname.value,
              WODESC: this.f.wodesc.value,
              WOSTATUS: this.f.wostatus.value,
              WOACTINACT: this.f.woactinact.value,
              WOBUDGET: this.f.wobudget.value,
              WOINSTRUCTIONS: this.f.woinstructions.value,
              WOOVERHEADPCT: this.f.wooverheadpct.value,
              WOPRELIMPCT: this.f.woprelimpct.value,
              WOPROFITPCT: this.f.woprofitpct.value,
              WOOTHERCOSTPCT: this.f.woothercostpct.value,
              WOCONTRACTTYPE: this.f.contract_payment_type.value,
              WOCODE1: this.f.plan_year.value,
              CTTSURCDE: this.contractSelcted.cttsurcde,
              WOTSEQUENCE: this.assetTmpSelcted.wotsequence,
              WPRSEQUENCE: this.programSelcted.wprsequence,
              WOFINALACCOUNT: 0,
              WOBUDGETASSET: 0,
              WOFORECAST: 0,
              WOCOMMITTED: 0,
              WOAPPROVED: 0,
              WOPENDING: 0,
              WOACTUAL: 0,
              WOFORECASTFEE: 0,
              WOCOMMITTEDFEE: 0,
              WOAPPROVEDFEE: 0,
              WOPENDINGFEE: 0,
              WOACTUALFEE: 0,
              WOFORECASTCONFEE: 0,
              WOCOMMITTEDCONFEE: 0,
              WOAPPROVEDCONFEE: 0,
              WOPENDINGCONFEE: 0,
              WOACTUALCONFEE: 0,
              WOINITIALCONTRACTSUM: 0,
              WOCURRENTCONTRACTSUM: 0,
              WOACCEPTEDVALUE: 0,
              WOCONTRACTORISSUEDATE: '1753-01-01 00:00:00.000',
              WOTARGETCOMPLETIONDATE: this.dateFormate(this.f.wotargetcompletiondate.value),
              WOCONTRACTORACCEPTANCEDATE: '1753-01-01 00:00:00.000',
              WOPLANSTARTDATE: this.dateFormate(this.f.woplanstartdate.value),
              WOPLANENDDATE: this.dateFormate(this.f.woplanenddate.value),
              WOACTUALSTARTDATE: '1753-01-01 00:00:00.000',
              WOACTUALENDDATE: '1753-01-01 00:00:00.000',
              WOCALCOVERPREMTYPE: 'N',
              WODEFECTLIABPERIODFLAG: 'N',
              WODEFECTLIABPERIODDAYS: 0,
              WOPAYMENT: 0,
              WOCODE2: '',
              WOCODE3: this.f.purchase_order_no.value,
              WOCODE4: this.f.wobudgetcode.value,
              WOCODE5: 'Works Order Milestone',
              WOCODE6: woType,
              WOTEXT1: '',
              WOTEXT2: '',
              WOTEXT3: '',
              WOTEXT4: '',
              WOTEXT5: '',
              WOTEXT6: '',
              MPgoA: 'BRIANJ',
              MPgpA: '2021-03-17 18:30:00',
              MPgqA: '2021-03-17 18:30:00',
              MPgrA: 'BRIANJ',
              MPgsA: '2021-03-17 18:30:00',
              MPgtA: '2021-03-17 18:30:00',
          }




      }

      if (this.addStage == 1) {

          this.contractSelcted = this.f.contractName.value;
          this.programSelcted = this.f.woprogram.value;
          this.assetTmpSelcted = this.f.wottemplatetype.value;




          //  let wprsequence  = this.programSelcted.wprsequence;
          //  let wotsequence  = this.assetTmpSelcted.wotsequence;
          //  let wprsequence  = this.programSelcted.wprsequence;
          let WorksOrderTypes = this.f.woType.value;

          this.loading = true;

          this.subs.add(
              this.worksOrdersService.WEBWorksOrdersValidForNewWorkOrder(this.programSelcted.wprsequence, this.assetTmpSelcted.wotsequence, this.programSelcted.wprsequence, WorksOrderTypes)
              .subscribe(
                  data => {
                    //  console.log(data);
                      if (data.isSuccess) {

                          this.loading = false;
                          if (data.data.validYN == 'Y') {

                          } else {

                              this.validateAddFormError = 'Y';
                              this.alertService.error(data.data.validationMessage);
                              this.getDetectorCheck();

                          }



                      } else {
                          this.validateAddFormError = 'Y';
                          this.getDetectorCheck();
                          this.loading = false;
                          this.alertService.error(data.message);
                      }

                  },
                  error => {
                      this.validateAddFormError = 'Y';
                      this.alertService.error(error);
                      this.loading = false;
                      this.getDetectorCheck();
                  })
          )


          setTimeout(() => {

              if (this.validateAddFormError == 'Y') {

                  return true;

              } else {

                  this.GetNewSourceCodeForWorksOrder();
                  this.saveParms = {
                      woType: this.f.woType.value,
                      wophasetemplate: this.f.wophasetemplate.value,
                  }

                  let woType = this.f.woType.value;
                  this.addStage = 2;
                  this.woForm = this.fb.group({
                      woType: [''],
                      wottemplatetype: [''],
                      woprogram: [''],
                      contractName: [''],
                      //  cttname: [''],
                      cttname: [{
                          disabled: true
                      }],
                      cttcode: [''],
                      conname: [''],
                      wotname: [''],
                      woTypevalue: [''],
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


                  this.woForm.patchValue({
                      conname: (this.contractSelcted.conname) ? this.contractSelcted.conname : '',
                      cttcode: (this.contractSelcted.cttcode) ? this.contractSelcted.cttcode : '',
                      cttname: (this.contractSelcted.cttname) ? this.contractSelcted.cttname : '',
                      wotname: (this.assetTmpSelcted.wotname) ? this.assetTmpSelcted.wotname : '',
                      woTypevalue: (woType) ? woType : '',
                      wobudget: 0,
                      wooverheadpct: 0,
                      woprelimpct: 0,
                      woprofitpct: 0,
                      woothercostpct: 0,

                  });


              }




          }, 1000);




      }



      if (this.FinalSubmit == true) {

        //  console.log('saveParms ' + JSON.stringify(this.saveParms));

          this.loading = true;

          this.subs.add(
              this.worksOrdersService.InsertWorksOrder(this.saveParms)
              .subscribe(
                  data => {
                    //  console.log(data);
                      if (data.isSuccess) {
                          this.woForm.reset();
                          this.alertService.success(this.saveMsg);
                          this.loading = false;
                          this.closewoFormWindow();
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

  }

  openCalendar(obj) {
      obj.toggle()
  }

  dateFormate(value) {
      if (value == undefined || typeof value == 'undefined' || typeof value == 'string') {
          return new Date('1753-01-01').toJSON()
      }
      const dateStr = `${value.year}-${this.helperService.zeorBeforeSingleDigit(value.month)}-${this.helperService.zeorBeforeSingleDigit(value.day)}`;
      return new Date(dateStr).toJSON()
  }


  refreshForm() {
      // this.woFormType = "new";
      // this.populateWorkOrder(item);
      this.woForm.reset();
      this.chRef.detectChanges();
  }

  closewoFormWindow() {
      this.woFormWindow = false;
      this.closeWoFormWin.emit(this.woFormWindow)
  }

  convertDate(d, f) {
      var momentDate = moment(d);
      if (!momentDate.isValid()) return d;
      return momentDate.format(f);
  }




  }
