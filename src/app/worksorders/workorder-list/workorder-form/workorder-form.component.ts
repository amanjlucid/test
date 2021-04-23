import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WorksOrdersService, HelperService } from '../../../_services';
import { SubSink } from 'subsink';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-workorder-form',
    templateUrl: './workorder-form.component.html',
    styleUrls: ['./workorder-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorkOrderFormComponent implements OnInit {
    subs = new SubSink();
    woForm: FormGroup;
    woForm2: FormGroup;
    @Input() woFormWindow: boolean = false
    @Input() selectedWorkOrderAddEdit: any;
    @Input() woFormType: any = 'new';
    @Output() closeWoFormWin = new EventEmitter<boolean>();
    panelHeight: any = "auto";
    windowWidth: any = 600;
    currentUser: any;
    windowTitle: string;
    readonly = true;
    worksOrderData: any;
    submitted = false;
    submitted1 = false;
    assetTemplateListData: any;
    getWorkOrderTypeData: any;
    workOrderProgrammeListData: any;
    WorkOrderContractListData: any;
    GetPhaseTemplateListData: any;
    formErrors: any;
    stage2FormSetting = {
        won: [''],
        extRef: [''],
        woType: [''],
        wottemplatetype: [''],
        woprogram: [''],
        contractName: [''],
        cttname: [''],
        cttcode: [''],
        conname: [''],
        wotname: [''],
        woTypevalue: [''],
        wophasetemplate: [''],
        woname: ['', [Validators.required, Validators.maxLength(50)]],
        wodesc: ['', Validators.required],
        wostatus: ['', Validators.required],
        woactinact: ['', Validators.required],
        wotargetcompletiondate: ['', Validators.required],
        wobudget: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        purchase_order_no: [''],
        wobudgetcode: [''],
        plan_year: ['', Validators.required],
        woplanstartdate: [''],
        woplanenddate: [''],
        woinstructions: ['', Validators.required],
        wooverheadpct: ['', Validators.required],
        woprelimpct: ['', Validators.required],
        woprofitpct: ['', Validators.required],
        woothercostpct: ['', Validators.required],
        contract_payment_type: ['', Validators.required],
        defectLibPeriodCheck: [''],
        defectLibPeriodVal: [''],
        valuationCheck: [''],
    }
    workOrderNo: any;
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
            'maxlength': 'Name must be maximum 50 characters.',
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
            'isLower': 'Planned End Date must be on or after the Planned Start Date.',
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
    addStage = 1;
    contractSelcted: any = {};
    assetTmpSelcted: any = {};
    programSelcted: any = {};
    left: any = "";
    minDate: any;
    innerWidth: any;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth > 1708) {
            this.left = this.addStage == 1 ? 600 : 300;
        } else if (this.innerWidth > 1300 && this.innerWidth < 1707) {
            this.left = this.addStage == 1 ? 400 : 200;
        } else {
            this.left = "auto";
        }
    }


    constructor(
        private fb: FormBuilder,
        private worksOrdersService: WorksOrdersService,
        private alertService: AlertService,
        private chRef: ChangeDetectorRef,
        private helperService: HelperService,
    ) {
        const current = new Date();
        this.minDate = {
            year: current.getFullYear(),
            month: current.getMonth() + 1,
            day: current.getDate()
        };
    }


    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    ngOnInit() {
        // console.log(this.woFormType)
        // console.log(this.selectedWorkOrderAddEdit)
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (this.woFormType == "new") {
            this.initializeForm(1)
        } else {
            this.initializeForm(2)
        }

        this.subs.add(
            forkJoin([
                this.worksOrdersService.GetPhaseTemplateList(),
                this.worksOrdersService.getWorkOrderType(),
                this.worksOrdersService.GetWorkOrderProgrammeList(),
                this.worksOrdersService.getAssetTemplateList(),
                this.worksOrdersService.WorkOrderContractList(true)
            ]).subscribe(
                data => {
                    // console.log(data);
                    this.GetPhaseTemplateListData = data[0].data;
                    this.getWorkOrderTypeData = data[1].data;
                    this.workOrderProgrammeListData = data[2].data;
                    this.assetTemplateListData = data[3].data;
                    this.WorkOrderContractListData = data[4].data;
                    this.chRef.detectChanges();

                    if (this.woFormType == "edit") {
                        this.worksOrdersService.GetWorksOrderByWOsequence(this.selectedWorkOrderAddEdit.wosequence).subscribe(
                            wod => {
                                // console.log(wod)
                                if (wod.isSuccess) {
                                    this.worksOrderData = wod.data;
                                    this.populateStage2Form(this.worksOrderData)
                                } else {
                                    this.alertService.error(wod.message)
                                }

                                this.chRef.detectChanges();
                            }
                        )
                    }


                }
            )
        )



    }

    initializeForm(stage) {
        this.addStage = stage;
        this.onResize(null);

        if (this.woFormType == "new" && stage == 1) {
            this.windowTitle = "New Works Order";
            this.woForm = this.fb.group({
                woname: [''],
                wodesc: [''],
                woType: ['', Validators.required],
                wottemplatetype: ['', Validators.required],
                woprogram: ['', Validators.required],
                contractName: ['', Validators.required],
                wophasetemplate: [''],
            })
        } else if (stage == 2) {
            // this.panelHeight = 800;
            // this.left = 300;
            this.windowWidth = 1200;

            if (this.woFormType == "edit") {
                this.windowTitle = "Edit Works Order";
            }

            this.woForm2 = this.fb.group(this.stage2FormSetting);

        }

        this.chRef.detectChanges();
    }




    prepareStage2Form() {
        this.subs.add(
            this.worksOrdersService.GetNewSourceCodeForWorksOrder().subscribe(
                data => {
                    // console.log(data);
                    this.workOrderNo = data.data;
                    this.initializeForm(2);
                    this.populateStage2Form(undefined);
                    this.chRef.detectChanges();

                }, err => this.alertService.error(err)
            )
        )
    }

    populateStage2Form(wod) {
        // console.log(wotname);
        // console.log(contractor);
        let wotname: any = "";
        let wocodE6 = wod?.wocodE6 ?? '';
        let compDate: any = '';
        let planStart: any = '';
        let planEnd: any = '';
        let wodefectliabperiodflag = true;
        let wodefectliabperioddays = 0;
        let wocodE2 = false;


        if (this.woFormType == "new") {
            let form1 = this.woForm.getRawValue();
            wocodE6 = form1.woType;
            wotname = this.assetTemplateListData.find(x => x.wotsequence == form1.wottemplatetype)
            this.contractSelcted = this.WorkOrderContractListData.find(x => x.cttsurcde == form1.contractName)
            this.programSelcted = this.workOrderProgrammeListData.find(x => x.wprsequence == form1.woprogram)

        } else {
            wotname = this.assetTemplateListData.find(x => x.wotsequence == wod.wotsequence)
            this.contractSelcted = this.WorkOrderContractListData.find(x => x.cttsurcde == wod.cttsurcde);
            this.programSelcted = this.workOrderProgrammeListData.find(x => x.wprsequence == wod.wprsequence)

            compDate = this.helperService.ngbDatepickerFormat(wod.wotargetcompletiondate);
            planStart = this.helperService.ngbDatepickerFormat(wod.woplanstartdate)
            planEnd = this.helperService.ngbDatepickerFormat(wod.woplanenddate)
            wodefectliabperiodflag = wod.wodefectliabperiodflag == "N" ? false : true;
            wodefectliabperioddays = wod.wodefectliabperioddays;
            wocodE2 = wod.wocodE2 == "N" ? false : true;
        }

        //this variable is used while saving and updating record
        this.assetTmpSelcted = wotname;

        this.woForm2.patchValue({
            won: wod?.wosequence ?? this.workOrderNo,
            woTypevalue: wocodE6 ?? '',
            extRef: wod?.woextref ?? this.workOrderNo.toString(),
            woname: wod?.woname ?? '',
            wodesc: wod?.wodesc ?? '',
            wotname: wotname?.wotname ?? '',
            conname: this.contractSelcted?.conname ?? '',
            cttcode: this.contractSelcted?.cttcode ?? '',
            cttname: this.contractSelcted?.cttname ?? '',
            wostatus: wod?.wostatus ?? 'New',
            woactinact: wod?.woactinact ?? 'A',
            wotargetcompletiondate: compDate,
            wobudget: wod?.wobudget ?? 0,
            purchase_order_no: wod?.wocodE3 ?? '',
            wobudgetcode: wod?.wocodE4 ?? '',
            plan_year: wod?.wocodE1 ?? '',
            woplanstartdate: planStart,
            woplanenddate: planEnd,
            woinstructions: wod?.woinstructions ?? '',
            wooverheadpct: wod?.wooverheadpct ?? 0,
            woprelimpct: wod?.woprelimpct ?? 0,
            woprofitpct: wod?.woprofitpct ?? 0,
            woothercostpct: wod?.woothercostpct ?? 0,
            contract_payment_type: wod?.wocontracttype ?? '',

            defectLibPeriodCheck: wodefectliabperiodflag,
            defectLibPeriodVal: wodefectliabperioddays,
            valuationCheck: wocodE2,

        });

        this.woForm2.get('valuationCheck').disable();
        this.subs.add(
            this.woForm2.get('contract_payment_type').valueChanges.subscribe(
                val => {
                    if (val == "VALUATION") {
                        this.woForm2.get('valuationCheck').enable();
                    }
                }
            )
        )



        if (this.woFormType == "edit") {
            this.woForm2.get('contract_payment_type').disable();
            this.woForm2.get('defectLibPeriodCheck').disable();
            this.woForm2.get('defectLibPeriodVal').disable();
        }

        if (this.woFormType == "new") {
            this.woForm2.get('wostatus').disable();
            this.subs.add(
                this.woForm2.get('defectLibPeriodCheck').valueChanges.subscribe(
                    val => {
                        this.woForm2.get('defectLibPeriodVal').disable();
                        if (val) {
                            this.woForm2.get('defectLibPeriodVal').enable();
                        }
                    }
                )
            )
        }



        this.chRef.detectChanges();


    }


    onSubmit() {
        this.submitted1 = true;
        this.formErrorObject(); // empty form error
        this.logValidationErrors(this.woForm);

        if (this.woForm.invalid) {
            return;
        }

        let formRawVal = this.woForm.getRawValue();
        let paramsForValidWO = {
            programme: formRawVal.woprogram,
            wotSeq: formRawVal.wottemplatetype,
            cttsurcde: formRawVal.contractName,
            WorksOrderTypes: formRawVal.woType,
        }

        if (this.addStage == 1) {
            this.subs.add(
                this.worksOrdersService.WEBWorksOrdersValidForNewWorkOrder(
                    paramsForValidWO.programme,
                    paramsForValidWO.wotSeq,
                    paramsForValidWO.cttsurcde,
                    paramsForValidWO.WorksOrderTypes
                ).subscribe(
                    data => {
                        // console.log(data)
                        if (data.isSuccess) {
                            if (data.data.validYN == 'Y') {
                                this.prepareStage2Form();
                            } else {
                                this.alertService.error(data.data.validationMessage);
                                this.chRef.detectChanges();
                            }
                        } else {
                            this.alertService.error(data.message);
                        }
                    }, err => this.alertService.error(err)
                )
            )
        }


    }



    onSubmit2() {
        this.submitted = true;
        this.formErrorObject(); // empty form error
        this.logValidationErrors(this.woForm2);

        if (this.woForm2.invalid) {
            return;
        }

        let formRawVal = this.woForm2.getRawValue();

        let msg = "";
        let wodData: any = {};
        let wocodE6: any = '';
        let WOCODE5: any = '';
        if (this.woFormType == "new") {
            msg = "Work Order created successfully.";
            wocodE6 = this.woForm.getRawValue().woType;
            WOCODE5 = this.woForm.getRawValue().wophasetemplate
        } else {
            msg = "Work Order updated successfully.";
            wodData = this.worksOrderData;
            wocodE6 = wodData.wocodE6;
            WOCODE5 = wodData.wocodE5
        }

        let params = {
            WOSEQUENCE: formRawVal.won,
            WOEXTREF: formRawVal.extRef,
            WONAME: formRawVal.woname,
            WODESC: formRawVal.wodesc,
            WOSTATUS: formRawVal.wostatus,
            WOACTINACT: formRawVal.woactinact,
            WOBUDGET: this.helperService.convertMoneyToFlatFormat(formRawVal.wobudget),
            WOINSTRUCTIONS: formRawVal.woinstructions,
            WOOVERHEADPCT: formRawVal.wooverheadpct,
            WOPRELIMPCT: formRawVal.woprelimpct,
            WOPROFITPCT: formRawVal.woprofitpct,
            WOOTHERCOSTPCT: formRawVal.woothercostpct,
            WOCONTRACTTYPE: formRawVal.contract_payment_type,
            WOCODE1: formRawVal.plan_year,
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
            WOCONTRACTORISSUEDATE: this.dateFormate(undefined),
            WOTARGETCOMPLETIONDATE: this.dateFormate(formRawVal.wotargetcompletiondate),
            WOCONTRACTORACCEPTANCEDATE: this.dateFormate(undefined),
            WOPLANSTARTDATE: this.dateFormate(formRawVal.woplanstartdate),
            WOPLANENDDATE: this.dateFormate(formRawVal.woplanenddate),
            WOACTUALSTARTDATE: this.dateFormate(undefined),
            WOACTUALENDDATE: this.dateFormate(undefined),
            WOCALCOVERPREMTYPE: 'N',
            WODEFECTLIABPERIODFLAG: formRawVal.defectLibPeriodCheck ? "Y" : "N",
            WODEFECTLIABPERIODDAYS: formRawVal.defectLibPeriodVal,
            WOPAYMENT: 0,
            WOCODE2: formRawVal.valuationCheck ? "Y" : "N",
            WOCODE3: formRawVal.purchase_order_no,
            WOCODE4: formRawVal.wobudgetcode,
            WOCODE5: WOCODE5,
            WOCODE6: wocodE6,
            WOTEXT1: null,
            WOTEXT2: null,
            WOTEXT3: null,
            WOTEXT4: null,
            WOTEXT5: null,
            WOTEXT6: null,
            MPgoA: this.currentUser.userId,
            MPgpA: this.dateFormate(undefined),
            MPgqA: this.dateFormate(undefined),
            MPgrA: this.currentUser.userId,
            MPgsA: this.dateFormate(undefined),
            MPgtA: this.dateFormate(undefined),
        }

        let apiCall: any;
        if (this.woFormType == "new") {
            apiCall = this.worksOrdersService.InsertWorksOrder(params)
        } else {

            // if (this.mData.wprstatus == "New" && managementModel.WPRSTATUS == "In Progress") {
            //     this.alertService.error("The Work Programme Status cannot be changed from 'New' to 'In Progress'");
            //     return
            //   }

            //   if (this.mData.wprstatus == "Closed" && managementModel.WPRSTATUS == "New") {
            //     this.alertService.error("The Work Programme Status cannot be changed from 'Closed' to 'New'");
            //     return
            //   }

            //   if (this.mData.wprstatus == "In Progress" && managementModel.WPRSTATUS == "New") {
            //     this.alertService.error("The Work Programme Status cannot be changed from 'In Progress' to 'New'");
            //     return
            //   }


            apiCall = this.worksOrdersService.UpdateWorksOrder(params)
        }

        this.subs.add(
            apiCall.subscribe(
                data => {
                    //  console.log(data);
                    if (data.isSuccess) {
                        this.alertService.success(msg);
                        this.closewoFormWindow();
                    } else {
                        this.alertService.error(data.message);
                        this.chRef.detectChanges();
                    }
                }, error => this.alertService.error(error)
            )
        )

    }




    logValidationErrors(group: FormGroup): void {
        Object.keys(group.controls).forEach((key: string) => {
            const abstractControl = group.get(key);

            if (abstractControl instanceof FormGroup) {
                this.logValidationErrors(abstractControl);
            } else {
                if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {
                    if (abstractControl.errors.hasOwnProperty('ngbDate')) {
                        delete abstractControl.errors['ngbDate'];

                        if (Object.keys(abstractControl.errors).length == 0) {
                            abstractControl.setErrors(null)
                        }
                    }

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

    closewoFormWindow() {
        this.woFormWindow = false;
        this.closeWoFormWin.emit(this.woFormWindow)
    }



}
