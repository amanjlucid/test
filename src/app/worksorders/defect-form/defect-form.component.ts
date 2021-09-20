import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, GridComponent, RowClassArgs } from '@progress/kendo-angular-grid';
import { WorksorderManagementService, AlertService, HelperService, ReportingGroupService, WorksOrdersService, LoaderService } from '../../_services'
import { forkJoin, Observable } from 'rxjs';
import { checkFirstDateisLower, MustbeTodayOrLower, SimpleDateValidator } from 'src/app/_helpers';

@Component({
  selector: 'app-defect-form',
  templateUrl: './defect-form.component.html',
  styleUrls: ['./defect-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DefectFormComponent implements OnInit {
  @Input() openDefectform: boolean = false;
  @Input() defectFormMode: string = 'new';
  @Input() openedFrom: string;
  @Input() singleWorkOrderAssetInp: any;
  @Input() selectedDefectInp: any;
  @Output() closeDefectFormEvent = new EventEmitter<boolean>();

  subs = new SubSink(); // to unsubscribe services
  title = 'New Defect';
  defectForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'status': {
      'required': 'Status is required.',
    },
    'IdentifiedDate': {
      'required': 'Identified Date is required.',
      'invalidDate': 'Identified Date in dd/mm/yyyy format.',
      'futureDate': 'Identified Date cannot be in the future.'
    },
    'reportedBy': {
      'required': 'Reported By is required.',
    },
    'description': {
      'required': 'Description is required.',
    },
    'cost': {
      'required': 'Cost is required.',
    },
    'score': {
      'required': 'Score is required.',
      'invalidRange': 'Score value between 0 and 99999 inclusive',
      'min': '',
      'max': '',
    },
    'resolutionDate': {
      'required': 'Resolution Date is required.',
      'invalidDate': 'Resolution Date in dd/mm/yyyy format.',
      'isLower': 'Resolution Date must be on or after the Identified Date.',
      'futureDate': 'Resolution Date cannot be in the future.'
    },
    'resolvedBy': {
      'required': 'Resolved By is required.',
    },
    'resolutionDetails': {
      'required': 'Resolution Detail is required.',
    },
    'signOffDate': {
      'required': 'Sign Off Date is required.',
      'invalidDate': 'Sign Off Date in dd/mm/yyyy format.',
    },
    'signOffBy': {
      'required': 'Sign Off By is required.',
    },
  };

  state: State = {
    skip: 0,
    take: 25,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  gridView: DataResult;
  gridLoading = true
  pageSize = 25;
  mySelection: number[] = [];
  packageData: any;
  @ViewChild(GridComponent) grid: GridComponent;
  selectableSettings: SelectableSettings;

  programmeData: any;
  worksOrderData: any;
  phaseData: any;
  workorderAsset: any;
  userList;
  selectedPkzSingle;
  minDate: any;
  maxDate: any;
  alreadySelected: number;
  // planYear: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService,
    private worksOrdersService: WorksOrdersService,
    private loaderService: LoaderService
  ) {
    this.setSelectableSettings();
    const current = new Date();
    this.maxDate = this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };

  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    // console.log({ opendFrom: this.openedFrom, asset: this.singleWorkOrderAssetInp, def: this.selectedDefectInp })
    this.defectForm = this.fb.group({
      status: ['New', [Validators.required]],
      IdentifiedDate: ['', [Validators.required, SimpleDateValidator(), MustbeTodayOrLower()]], //n
      reportedBy: ['', [Validators.required]],//n
      description: ['', [Validators.required]],//n
      cost: [0, [Validators.required]],
      score: ['', [Validators.required]],//n
      resolutionDate: [''],
      resolvedBy: [''],
      resolutionDetails: [''],
      signOffDate: ['', [SimpleDateValidator()]],
      signOffBy: [''],
    });

    // Change validation on status change
    const resDateCtr = this.defectForm.get('resolutionDate');
    const resByCtr = this.defectForm.get('resolvedBy');
    const resDetCtr = this.defectForm.get('resolutionDetails');
    const IdeDateCtr = this.defectForm.get('IdentifiedDate');
    const status = this.defectForm.get('status');

    //set defatul validation for resolution date
    resDateCtr.setValidators([SimpleDateValidator(), checkFirstDateisLower(resDateCtr, IdeDateCtr), MustbeTodayOrLower()]);

    //set validaton on status field change
    this.subs.add(
      status.valueChanges.subscribe(
        val => {
          if (val == "New") {
            resDetCtr.setErrors(null);
            resDetCtr.clearValidators();
            resByCtr.setErrors(null);
            resByCtr.clearValidators();
            resDateCtr.setValidators([SimpleDateValidator(), checkFirstDateisLower(resDateCtr, IdeDateCtr), MustbeTodayOrLower()]);
          } else if (val == "Resolved") {
            resDateCtr.setValidators([Validators.required, SimpleDateValidator(), checkFirstDateisLower(resDateCtr, IdeDateCtr), MustbeTodayOrLower()]);
            resByCtr.setValidators([Validators.required]);
            resDetCtr.setValidators([Validators.required]);
          }

          resDateCtr.updateValueAndValidity();
          resByCtr.updateValueAndValidity();
          resDetCtr.updateValueAndValidity();
          IdeDateCtr.updateValueAndValidity();
        }
      )
    )

    this.requiredPageData();

  }

  populateForm() {
    if (this.defectFormMode == "new") {
      this.defectForm.patchValue({ score: 0 });
      this.disableFields();
    }

    if (this.defectFormMode == "edit") {
      this.title = "Edit Defect"
      this.getDefect();
    }

  }

  disableFields() {
    const disableFields = ['signOffDate', 'signOffBy'];
    for (const disableField of disableFields) {
      this.defectForm.get(disableField).disable();
    }
  }


  getDefect() {
    const { wprsequence, wosequence, assid, wodsequence } = this.selectedDefectInp;
    this.subs.add(
      this.workOrderProgrammeService.getWorksOrderDefect(wprsequence, wosequence, assid, wodsequence).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            const { wodstatus, woddate, wodmpusid, woddescription, wodapproxcost, wodresolveddate, wodresolvedmpusid, wodresolveddescription, wodsignoffmpusid, wodsignoffdate, wodscore, wlataid } = data.data;

            this.mySelection = [wlataid];
            this.alreadySelected = wlataid;

            this.defectForm.patchValue({
              status: wodstatus,
              IdentifiedDate: this.helperService.ngbDatepickerFormat(woddate),
              reportedBy: wodmpusid,
              description: woddescription,
              cost: wodapproxcost,
              score: wodscore,
              resolutionDate: this.helperService.ngbDatepickerFormat(wodresolveddate),
              resolvedBy: wodresolvedmpusid,
              resolutionDetails: wodresolveddescription,
              signOffDate: this.helperService.ngbDatepickerFormat(wodsignoffdate),
              signOffBy: wodsignoffmpusid,
            });

            //disable fields
            if (wodstatus == "Signed Off") {
              this.defectForm.disable();
            } else if (wodstatus == "New" || wodstatus == "Resolved By") {
              this.disableFields();
            }

          } else this.alertService.error(data.message);
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
  }


  requiredPageData() {
    this.loaderService.pageShow();
    let pagaRequiredParams: any;
    if (this.openedFrom == 'workdetail' || this.openedFrom == 'assetchecklist') {
      pagaRequiredParams = this.singleWorkOrderAssetInp
    }

    if ( this.openedFrom == "workorder") {
      pagaRequiredParams = this.selectedDefectInp
    }

    const { wprsequence, wosequence, wopsequence, assid } = pagaRequiredParams;
    let pageReq = [
      this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
      this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
      this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
      this.workOrderProgrammeService.getAssetAddressByAsset(assid),
      this.workOrderProgrammeService.worksOrdersSecurityUsersList(wosequence),
      this.worksOrdersService.WorkOrderAssetDetail(wosequence, wopsequence, assid, 0),
      this.workOrderProgrammeService.getDefectScoreLimits(),
    ];

    this.subs.add(
      forkJoin(pageReq).subscribe(
        (data: any) => {
          // console.log(data);
          const programmeData = data[0];
          const worksOrderData = data[1];
          const phaseData = data[2];
          const workorderAsset = data[3];
          const userList = data[4];
          const pkzdata = data[5];
          const scoreLimit = data[6].data;


          //set min and max score validation and rule dynamically
          const { defectmin, defectmax } = scoreLimit
          const scoreCtr: any = this.defectForm.get('score')
          scoreCtr.setValidators([Validators.required, Validators.min(defectmin), Validators.max(defectmax)]);
          this.validationMessage.score.max = this.validationMessage.score.min = `Score value between ${defectmin} and ${defectmax} inclusive`

          //othere reuired page data
          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;
          if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];
          if (userList.isSuccess) this.userList = userList.data;

          if (pkzdata.isSuccess) {
            this.packageData = pkzdata.data;
            if (this.defectFormMode == 'edit') {
              this.selectedPkzSingle = { ...this.selectedDefectInp };
              // const { wlataid, wlcode, wlplanyear } = this.selectedDefectInp;
              // this.selectedPkzSingle = this.packageData.find(x => x.wlataid == wlataid && x.wlcode == wlcode && x.wlplanyear == wlplanyear)
            }
            this.gridView = process(this.packageData, this.state);
            this.gridLoading = false;
          }

          this.populateForm();
          this.loaderService.pageHide();
          this.chRef.detectChanges();

        }, err => {
          this.alertService.error(err);
          this.loaderService.pageHide();
        }
      )
    )

  }

  closeDefectForm() {
    this.openDefectform = false;
    this.closeDefectFormEvent.emit(false);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.packageData, this.state);
    this.chRef.detectChanges();
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.packageData, this.state);
    this.chRef.detectChanges();
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.packageData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.packageData.length
    };
    this.chRef.detectChanges();
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (this.selectedDefectInp?.wodstatus == "Signed Off") {
      this.mySelection = [];
      return
    }

    // when deselect record with ctr key, clear selected item
    if (this.mySelection.length == 0) {
      this.selectedPkzSingle = undefined;
      this.alreadySelected = undefined;
      return;
    }

    const { wlataid } = dataItem;
    // when deselect record on clik of selected record
    if (this.alreadySelected === wlataid) {
      this.mySelection = [];
      this.selectedPkzSingle = undefined;
      this.alreadySelected = undefined;
      return;
    }

    this.alreadySelected = wlataid;
    this.selectedPkzSingle = dataItem;


  }


  openCalendar(obj) {
    obj.toggle()
  }


  formErrorObject() {
    this.formErrors = {
      'status': '',
      'IdentifiedDate': '',
      'reportedBy': '',
      'description': '',
      'cost': '',
      'score': '',
      'resolutionDate': '',
      'resolvedBy': '',
      'resolutionDetails': '',
      'signOffDate': '',
      'signOffBy': '',
    }
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


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.defectForm);

    if (this.defectForm.invalid) {
      return;
    }

    let apiCall: Observable<any>;
    let formRawVal = this.defectForm.getRawValue();
    let successMsg = '';
    let params: any = {};

    const { status, IdentifiedDate, reportedBy, description, cost, score, resolutionDate, resolvedBy, resolutionDetails, signOffDate, signOffBy } = formRawVal;

    //check resolution date, resolved by or resolution text are entered
    if ((resolutionDate != "" && resolutionDate != null) && status == "New") {
      this.alertService.error('Resolved Date must only be entered if status is "Resolved".');
      return;
    }

    if (resolvedBy != "" && status == "New") {
      this.alertService.error('Resolved User must only be entered if status is "Resolved".');
      return;
    }

    if (resolutionDetails != "" && status == "New") {
      this.alertService.error('Resolved Description must only be entered if status is "Resolved".');
      return;
    }


    //set common form data for new and edit case
    params.WODDATE = this.helperService.dateObjToString(IdentifiedDate);
    params.WODMPUSID = reportedBy;
    params.WODDESCRIPTION = description;
    params.WODRESOLVEDDATE = this.helperService.dateObjToString(resolutionDate);
    params.WODRESOLVEDMPUSID = resolvedBy;
    params.WODRESOLVEDDESCRIPTION = resolutionDetails;
    params.WODSIGNOFFDATE = this.helperService.dateObjToString(signOffDate);
    params.WODSIGNOFFMPUSID = signOffBy;
    params.WODSTATUS = status;
    params.WODAPPROXCOST = cost;
    params.WODSCORE = score;

    if (this.defectFormMode == "new") {
      const { wprsequence, wosequence, assid, wopsequence } = this.singleWorkOrderAssetInp;
      params.WPRSEQUENCE = wprsequence;
      params.WOSEQUENCE = wosequence;
      params.ASSID = assid;
      params.WOPSEQUENCE = wopsequence;
      params.WLCODE = this.selectedPkzSingle?.wlcode ?? 0;
      params.WLATAID = this.selectedPkzSingle?.wlataid ?? 0;
      params.WLPLANYEAR = this.selectedPkzSingle?.wlplanyear ?? 0;

      apiCall = this.workOrderProgrammeService.insertWorksOrderDefect(params);
      successMsg = "New Defect created successfully.";

    } else if (this.defectFormMode == "edit") {
      const { wlataid, wlcode, wlplanyear, wprsequence, wosequence, assid, wodsequence } = this.selectedDefectInp;
      params.WLATAID = this.selectedPkzSingle?.wlataid ?? 0;
      params.WLCODE = this.selectedPkzSingle?.wlcode ?? 0;
      params.WLPLANYEAR = this.selectedPkzSingle?.wlplanyear ?? 0;
      params.WODSTATUS = status;
      params.WPRSEQUENCE = wprsequence;
      params.WOSEQUENCE = wosequence;
      params.ASSID = assid;
      params.WODSEQUENCE = wodsequence;

      apiCall = this.workOrderProgrammeService.updateWorksOrderDefect(params);
      successMsg = "Defect updated successfully.";
    }


    this.subs.add(
      apiCall.subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(successMsg);
            this.closeDefectForm();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }


}
