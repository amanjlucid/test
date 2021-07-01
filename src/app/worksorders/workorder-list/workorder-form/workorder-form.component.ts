import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WorksOrdersService, HelperService, LoaderService, WorksorderManagementService } from '../../../_services';
import { SubSink } from 'subsink';
import { forkJoin } from 'rxjs';
import { firstDateIsLower, IsGreaterDateValidator, isNumberCheck, ShouldGreaterThanYesterday, shouldNotZero, SimpleDateValidator, yearFormatValidator } from 'src/app/_helpers';

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
    @Input() selectedProgramme: any = null;
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
        wotargetcompletiondate: [''],
        wobudget: ['', [Validators.required, shouldNotZero()]],
        purchase_order_no: [''],
        wobudgetcode: [''],
        plan_year: ['', [Validators.required, yearFormatValidator()]],
        woplanstartdate: ['', [SimpleDateValidator()]],
        woplanenddate: ['', [SimpleDateValidator()]],
        woinstructions: ['', Validators.required],
        wooverheadpct: ['', Validators.required],
        woprelimpct: ['', Validators.required],
        woprofitpct: ['', Validators.required],
        woothercostpct: ['', Validators.required],
        contract_payment_type: ['', Validators.required],
        defectLibPeriodCheck: [''],
        defectLibPeriodVal: ['', [shouldNotZero()]],
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
            'pastDate': 'Target Date cannot be in the past.',
            'invalidDate': 'Target Date in dd/mm/yyyy format.',
            'isLower': 'Target Date must be on or after the Plan Start Date.',
        },

        'wobudget': {
            'required': 'Budget is required.',
            'pattern': 'Number Only.',
            'shouldNotZero': 'Budget cannot be 0 and blank'
        },
        'purchase_order_no': {
            'required': 'Purchase Order No is required.',
        },
        'wobudgetcode': {
            'required': 'Budget code is required.',
        },
        'plan_year': {
            'required': 'Plan Year is required.',
            'invalidYear': 'Plan Year is invalid.'
        },
        'woplanstartdate': {
            'required': 'Plan Start Date is required.',
            'pastDate': 'Plan Start Date cannot be in the past.',
            'invalidDate': 'Plan Start Date in dd/mm/yyyy format.',
        },
        'woplanenddate': {
            'required': 'Plan End Date is required.',
            'isLower': 'Plan End Date must be on or after the Plan Start Date.',
            'invalidDate': 'Plan End Date in dd/mm/yyyy format.',
            'pastDate': 'Plan End Date cannot be in the past.',
            'isGreaterDate': 'Plane End Date cannot be later than the Target Completion Date.'
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
        'defectLibPeriodVal': {
            'isNotNumber': 'DLP value should be an integer value.',
            'shouldNotZero': 'DLP value cannot be 0 and blank'
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
        private loaderService: LoaderService,
        private worksorderManagementService: WorksorderManagementService
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
                    this.GetPhaseTemplateListData = data[0].data;
                    this.getWorkOrderTypeData = data[1].data;
                    this.workOrderProgrammeListData = data[2].data;
                    this.assetTemplateListData = data[3].data;
                    this.WorkOrderContractListData = data[4].data;
                    this.chRef.detectChanges();

                    if (this.woFormType == "edit") {
                        this.worksOrdersService.GetWorksOrderByWOsequence(this.selectedWorkOrderAddEdit.wosequence).subscribe(
                            wod => {
                                if (wod.isSuccess) {
                                    this.worksOrderData = wod.data;
                                    this.populateStage2Form(this.worksOrderData)
                                } else {
                                    this.alertService.error(wod.message)
                                }

                                this.chRef.detectChanges();
                            }
                        )
                    } else {
                        if (this.selectedProgramme != null) {
                            this.woForm.patchValue({
                                woprogram: this.selectedProgramme?.wprsequence
                            })
                        }
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
            });


        } else if (stage == 2) {
            this.windowWidth = 1200;
            if (this.woFormType == "edit") {
                this.windowTitle = "Edit Works Order";
            }


            this.woForm2 = this.fb.group(this.stage2FormSetting,
                {
                    validator: [
                        firstDateIsLower('woplanenddate', 'woplanstartdate'),
                        IsGreaterDateValidator('woplanenddate', 'wotargetcompletiondate')
                    ],
                }
            );

            const targetCompletionCtr = this.woForm2.get('wotargetcompletiondate')
            const planStartCompletionCtr = this.woForm2.get('woplanstartdate')
            const planEndCompletionCtr = this.woForm2.get('woplanenddate')

            if (this.woFormType == "edit") {
                targetCompletionCtr.setValidators[Validators.required, SimpleDateValidator()];
                planStartCompletionCtr.setValidators[SimpleDateValidator()];
                planEndCompletionCtr.setValidators[SimpleDateValidator()];

                // this.stage2FormSetting.wotargetcompletiondate = [Validators.required, ShouldGreaterThanYesterday(), SimpleDateValidator()];
                // this.stage2FormSetting.woplanstartdate = [ShouldGreaterThanYesterday(), SimpleDateValidator()];
                // this.stage2FormSetting.woplanenddate = [ShouldGreaterThanYesterday(), SimpleDateValidator()];
            }

            if (this.woFormType == "new") {
                targetCompletionCtr.setValidators[Validators.required, ShouldGreaterThanYesterday(), SimpleDateValidator()];
                planStartCompletionCtr.setValidators[ShouldGreaterThanYesterday(), SimpleDateValidator()];
                planEndCompletionCtr.setValidators[ShouldGreaterThanYesterday(), SimpleDateValidator()];

                // this.stage2FormSetting.wotargetcompletiondate = [Validators.required, ShouldGreaterThanYesterday(), SimpleDateValidator()];
                // this.stage2FormSetting.woplanstartdate = [ShouldGreaterThanYesterday(), SimpleDateValidator()];
                // this.stage2FormSetting.woplanenddate = [ShouldGreaterThanYesterday(), SimpleDateValidator()];
            }

        }

        this.chRef.detectChanges();
    }




    prepareStage2Form() {
        this.subs.add(
            this.worksOrdersService.GetNewSourceCodeForWorksOrder().subscribe(
                data => {
                    this.workOrderNo = data.data;
                    this.initializeForm(2);
                    this.populateStage2Form(undefined);
                    this.chRef.detectChanges();

                }, err => this.alertService.error(err)
            )
        )
    }

    populateStage2Form(wod) {
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
            wobudget: wod?.wobudget ?? "",
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


        let targetDateValidationArr = [Validators.required, ShouldGreaterThanYesterday(), SimpleDateValidator()];
        if (this.woFormType == "edit") {
            targetDateValidationArr = [Validators.required, SimpleDateValidator()];
        }

        const targetCompletionCtr = this.woForm2.get('wotargetcompletiondate');
        targetCompletionCtr.setValidators(targetDateValidationArr);

        const budgetCtr = this.woForm2.get('wobudget');
        this.subs.add(
            budgetCtr.valueChanges.subscribe(
                val => {
                    budgetCtr.setValidators([shouldNotZero()])
                }
            )
        )

        this.woForm2.get('valuationCheck').disable();

        if (this.woFormType == "edit") {
            this.woForm2.get('contract_payment_type').disable();
            this.woForm2.get('defectLibPeriodCheck').disable();
            this.woForm2.get('defectLibPeriodVal').disable();
        }

        this.subs.add(
            this.woForm2.get('contract_payment_type').valueChanges.subscribe(
                val => {
                    if (val == "VALUATION") {
                        this.woForm2.get('valuationCheck').enable();
                    } else {
                        this.woForm2.get('valuationCheck').disable();
                    }
                }
            )
        )



        const defectLibPeriodValCtr = this.woForm2.get('defectLibPeriodVal');

        if (this.woFormType == "new") {
            this.woForm2.get('wostatus').disable();
            this.subs.add(
                this.woForm2.get('defectLibPeriodCheck').valueChanges.subscribe(
                    val => {
                        defectLibPeriodValCtr.clearValidators();
                        if (val) {
                            defectLibPeriodValCtr.enable();
                            defectLibPeriodValCtr.setValidators([shouldNotZero()]);
                            this.woForm2.patchValue({ defectLibPeriodVal: 0 })
                            this.chRef.detectChanges();
                        } else {
                            this.woForm2.patchValue({ defectLibPeriodVal: 0 })
                            defectLibPeriodValCtr.disable();
                            delete this.formErrors.defectLibPeriodVal
                            this.chRef.detectChanges();
                        }
                    }
                )
            )
        } else if (this.woFormType == "edit") {
            defectLibPeriodValCtr.clearValidators();
            this.chRef.detectChanges();
        }



        this.chRef.detectChanges();


    }


    onSubmit() {

        this.submitted1 = true;
        this.formErrorObject(); // empty form error
        this.logValidationErrors(this.woForm);
        this.chRef.detectChanges();

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



    async onSubmit2() {

        this.submitted = true;
        this.formErrorObject(); // empty form error
        this.logValidationErrors(this.woForm2);
        this.chRef.detectChanges();

        if (this.woForm2.invalid) {
            return;
        }

        let formRawVal = this.woForm2.getRawValue();

        let msg = "";
        let wodData: any = {};
        let wocodE6: any = '';
        let WOCODE5: any = null;
        let userAndDate: any = {};

        if (this.woFormType == "new") {
            msg = "Work Order created successfully.";
            wocodE6 = this.woForm.getRawValue().woType;
            WOCODE5 = this.woForm.getRawValue().wophasetemplate == "" ? null : this.woForm.getRawValue().wophasetemplate
            userAndDate.MPgoA = this.currentUser.userId;
            userAndDate.MPgpA = this.dateFormate(this.minDate);
            userAndDate.MPgqA = this.dateFormate(this.minDate);
            userAndDate.MPgrA = this.currentUser.userId;
            userAndDate.MPgsA = this.dateFormate(this.minDate);
            userAndDate.MPgtA = this.dateFormate(this.minDate);
        } else {
            msg = "Work Order updated successfully.";
            wodData = this.worksOrderData;
            wocodE6 = wodData.wocodE6;

            userAndDate.MPgoA = wodData.mPgoA;
            userAndDate.MPgpA = wodData.mPgpA;
            userAndDate.MPgqA = wodData.mPgqA;
            userAndDate.MPgrA = this.currentUser.userId;

            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            let yesterdayObj = {
                year: yesterday.getFullYear(),
                month: yesterday.getMonth() + 1,
                day: yesterday.getDate()
            }

            userAndDate.MPgsA = this.dateFormate(yesterdayObj);
            userAndDate.MPgtA = this.dateFormate(this.minDate);


            if (wodData.wocodE5 == "" || wodData.wocodE5 == null) {
                WOCODE5 = null;
            } else {
                const template = this.GetPhaseTemplateListData.find(x => x.wottemplatetype == wodData.wocodE5);
                if (template) {
                    WOCODE5 = template.wotsequence
                }
            }
            // WOCODE5 = (wodData.wocodE5 == "" || wodData.wocodE5 == null) ? null : this.GetPhaseTemplateListData.find(x.wottemplatetype == wodData.wocodE5)?.
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
            WPRSEQUENCE: this.woFormType == "new" ? this.programSelcted.wprsequence : wodData?.wprsequence,

            WOFINALACCOUNT: wodData?.wofinalaccount ?? 0,
            WOBUDGETASSET: wodData?.wobudgetasset ?? 0,
            WOFORECAST: wodData?.woforecast ?? 0,
            WOCOMMITTED: wodData?.wocommitted ?? 0,
            WOAPPROVED: wodData?.woapproved ?? 0,
            WOPENDING: wodData?.wopending ?? 0,
            WOACTUAL: wodData?.woactual ?? 0,
            WOFORECASTFEE: wodData?.woforecastfee ?? 0,
            WOCOMMITTEDFEE: wodData?.wocommittedfee ?? 0,
            WOAPPROVEDFEE: wodData?.woapprovedfee ?? 0,
            WOPENDINGFEE: wodData?.wopendingfee ?? 0,
            WOACTUALFEE: wodData?.woactualfee ?? 0,
            WOFORECASTCONFEE: wodData?.woforecastconfee ?? 0,
            WOCOMMITTEDCONFEE: wodData?.wocommittedconfee ?? 0,
            WOAPPROVEDCONFEE: wodData?.woapprovedconfee ?? 0,
            WOPENDINGCONFEE: wodData?.wopendingconfee ?? 0,
            WOACTUALCONFEE: wodData?.woactualconfee ?? 0,
            WOINITIALCONTRACTSUM: wodData?.woinitialcontractsum ?? 0,
            WOCURRENTCONTRACTSUM: wodData?.wocurrentcontractsum ?? 0,
            WOACCEPTEDVALUE: wodData?.woacceptedvalue ?? 0,

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
            WOPAYMENT: wodData?.wopayment ?? 0,
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
            MPgoA: userAndDate.MPgoA, // created user
            MPgpA: userAndDate.MPgpA, // created date
            MPgqA: userAndDate.MPgqA, // created date
            MPgrA: userAndDate.MPgrA, // updated user
            MPgsA: userAndDate.MPgsA, // created date
            MPgtA: userAndDate.MPgtA, // updated date

            filed: false
        }

        let apiCall: any;
        if (this.woFormType == "new") {
            let validationparmas = {
                WPRSequence: params.WPRSEQUENCE,
                Budget: params.WOBUDGET,
                TargetDate: params.WOTARGETCOMPLETIONDATE,
                PlanStartDate: params.WOPLANSTARTDATE,
                PlanEndDate: params.WOPLANENDDATE,
                WONAME: params.WONAME,
            }

            let validate = await this.worksOrdersService.WEBWorksOrdersValidateNewWorksOrder(validationparmas);
            if (validate.isSuccess) {
                if (validate.data.validYN == "N") {
                    this.alertService.error(validate.data.validationMessage);
                    return
                }
            }

            apiCall = this.worksOrdersService.InsertWorksOrder(params)

        } else {

            if (wodData.wostatus == "New" && formRawVal.wostatus == "In Progress") {
                this.alertService.error("The Works Order Status cannot be changed from 'New' to 'In Progress'");
                return
            }

            if (wodData.wostatus == "Closed" && formRawVal.wostatus == "New") {
                this.alertService.error("The Works Order Status cannot be changed from 'Closed' to 'New'");
                return
            }

            if (wodData.wostatus == "In Progress" && formRawVal.wostatus == "New") {
                this.alertService.error("The Works Order Status cannot be changed from 'In Progress' to 'New'");
                return
            }

            if (new Date(params.WOTARGETCOMPLETIONDATE) < new Date()) {
                this.alertService.warning("Warning - Target Completion Date is in the past!", false);
                this.loaderService.pageShow();
                // setTimeout(() => {
                // //   this.subscribeToSubmitForm(apiToAddUpdate, message);
                // }, 2000);
            }


            apiCall = this.worksOrdersService.UpdateWorksOrder(params)
        }

        this.subs.add(
            apiCall.subscribe(
                data => {
                    if (data.isSuccess) {
                        this.alertService.success(msg);
                        this.closewoFormWindow();
                    } else {
                        this.alertService.error(data.message);
                        this.chRef.detectChanges();
                    }
                    this.loaderService.pageHide();
                }, error => {
                    this.loaderService.pageHide();
                    this.alertService.error(error)
                }
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
            'defectLibPeriodVal': ''
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
