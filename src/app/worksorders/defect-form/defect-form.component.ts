import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, GridComponent, RowClassArgs } from '@progress/kendo-angular-grid';
import { WorksorderManagementService, AlertService, HelperService, ReportingGroupService, WorksOrdersService } from '../../_services'
import { forkJoin, Observable } from 'rxjs';
import { firstDateIsLower, numberRange, SimpleDateValidator } from 'src/app/_helpers';

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
      'invalidRange': 'Score value between 0 and 99999 inclusive'
    },
    'resolutionDate': {
      'required': 'Resolution Date is required.',
      'invalidDate': 'Resolution Date in dd/mm/yyyy format.',
      'isLower': 'Resolution Date must be on or after the Identified Date.',
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
      logic: "or",
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

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService,
    private reportingGrpService: ReportingGroupService,
    private worksOrdersService: WorksOrdersService,

  ) {
    this.setSelectableSettings();
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
    console.log({ opendFrom: this.openedFrom, asset: this.singleWorkOrderAssetInp, def: this.selectedDefectInp })

    this.defectForm = this.fb.group({
      status: ['', [Validators.required]],
      IdentifiedDate: ['', [Validators.required, SimpleDateValidator()]],
      reportedBy: ['', [Validators.required]],
      description: ['', [Validators.required]],
      cost: ['', [Validators.required]],
      score: ['', [Validators.required, numberRange(0, 99999)]],
      resolutionDate: ['', [Validators.required, SimpleDateValidator()]],
      resolvedBy: ['', [Validators.required]],
      resolutionDetails: ['', [Validators.required]],
      signOffDate: ['', [SimpleDateValidator()]],
      signOffBy: [''],
    },
      {
        validator: [
          firstDateIsLower('resolutionDate', 'IdentifiedDate'),
        ],
      });

    this.populateForm();
    this.requiredPageData();

  }

  populateForm() {

    if (this.defectFormMode == "new") {
      const disableFields = ['signOffDate', 'signOffBy'];
      for (const disableField of disableFields) {
        this.defectForm.get(disableField).disable();
      }
    }

    if (this.defectFormMode == "edit") {
      this.getDefect();
    }

  }

  getDefect() {
    const { wprsequence, wosequence, assid, wodsequence } = this.selectedDefectInp;
    this.subs.add(
      this.workOrderProgrammeService.getWorksOrderDefect(wprsequence, wosequence, assid, wodsequence).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            const { wodstatus, woddate, wodmpusid, woddescription, wodapproxcost, wodresolveddate, wodresolvedmpusid, wodresolveddescription, wodsignoffmpusid, wodsignoffdate } = data.data;
            // this.mySelection = [wlataid]
            this.defectForm.patchValue({
              status: wodstatus,
              IdentifiedDate: this.helperService.ngbDatepickerFormat(woddate),
              reportedBy: wodmpusid,
              description: woddescription,
              cost: wodapproxcost,
              score: '',
              resolutionDate: this.helperService.ngbDatepickerFormat(wodresolveddate),
              resolvedBy: wodresolvedmpusid,
              resolutionDetails: wodresolveddescription,
              signOffDate: this.helperService.ngbDatepickerFormat(wodsignoffdate),
              signOffBy: wodsignoffmpusid,
            });

            if (wodstatus == "Signed Off") {
              this.defectForm.disable();
            } else if (wodstatus == "New") {
              const disableFields = ['signOffDate', 'signOffBy'];
              for (const disableField of disableFields) {
                this.defectForm.get(disableField).disable();
              }
            }

            // else {
            //   const disableFields = ['status', 'IdentifiedDate', 'reportedBy', 'resolutionDate', 'resolvedBy', 'signOffDate', 'signOffBy'];

            //   for (const disableField of disableFields) {
            //     this.defectForm.get(disableField).disable();
            //   }
            // }

          } else this.alertService.error(data.message);
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
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
    this.selectedPkzSingle = dataItem;
  }

  rowCallback(context: RowClassArgs) {
    // const { woadstatus, woisequence } = context.dataItem;
    console.log(this.selectedDefectInp);
    return {
      'k-state-disabled': this.selectedDefectInp?.wodstatus == "Signed Off"
    };
  }

  requiredPageData() {
    let pagaRequiredParams: any;
    if (this.openedFrom == 'assetchecklist') {
      pagaRequiredParams = this.singleWorkOrderAssetInp
    }

    if (this.openedFrom == 'workdetail') {
      pagaRequiredParams = this.selectedDefectInp
    }

    const { wprsequence, wosequence, wopsequence, assid } = pagaRequiredParams;
    let pageReq = [
      this.workOrderProgrammeService.getWorkProgrammesByWprsequence(wprsequence),
      this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
      this.workOrderProgrammeService.getPhase(wosequence, wopsequence),
      this.workOrderProgrammeService.getAssetAddressByAsset(assid),
      this.reportingGrpService.userListToMail(),
      this.worksOrdersService.WorkOrderAssetDetail(wosequence, wopsequence, assid, 0)
    ];

    this.subs.add(
      forkJoin(pageReq).subscribe(
        (data: any) => {
          console.log(data);
          const programmeData = data[0];
          const worksOrderData = data[1];
          const phaseData = data[2];
          const workorderAsset = data[3];
          const userList = data[4];
          const pkzdata = data[5];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          if (phaseData.isSuccess) this.phaseData = phaseData.data;
          if (workorderAsset.isSuccess) this.workorderAsset = workorderAsset.data[0];
          if (userList.isSuccess) this.userList = userList.data;

          if (pkzdata.isSuccess) {
            this.packageData = pkzdata.data;
            this.gridView = process(this.packageData, this.state);
            this.gridLoading = false;
            this.chRef.detectChanges();
          }

          // this.getDefectList();

        }
      )
    )

  }

  // selectionChange(item) {
  //   if (this.mySelection.includes(item.wphcode)) {
  //     this.mySelection = this.mySelection.filter(x => x != item.wphcode);
  //   } else {
  //     this.mySelection.push(item.wphcode);
  //   }

  //   this.chRef.detectChanges();
  // }

  checkPackageExist(item) {
    if (item.attributeexists == 'Work Package Exists') return false;
    if (item.exclusionreason == 'Work Package already exists on Work List') return false;
    return true;
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

    this.chRef.detectChanges();

    if (this.defectForm.invalid) {
      return;
    }

    debugger;

    let apiCall: Observable<any>;
    let formRawVal = this.defectForm.getRawValue();

    if (this.defectFormMode == "new") {

    } else if (this.defectFormMode == "edit") {
      const { status, IdentifiedDate, reportedBy, description, cost, score, resolutionDate, resolvedBy, resolutionDetails, signOffDate, signOffBy } = formRawVal;

      const { wlataid, wlcode, wlplanyear } = this.selectedDefectInp

      const params = {
        WLATAID: wlataid,
        WLCODE: wlcode,
        WLPLANYEAR: wlplanyear,
        WODAPPROXCOST: cost,
        WODDATE: this.helperService.ngbDatepickerFormat(IdentifiedDate),
        WODDESCRIPTION: description,
        WODMPUSID: reportedBy,
        WODRESOLVEDDATE: this.helperService.ngbDatepickerFormat(resolutionDate),
        WODRESOLVEDDESCRIPTION: resolutionDetails,
        WODRESOLVEDMPUSID: resolvedBy,
        WODSCORE: score,
        WODSIGNOFFDATE: this.helperService.ngbDatepickerFormat(signOffDate),
        WODSIGNOFFMPUSID: signOffBy,
        WODSTATUS: status,
      }

      apiCall = this.workOrderProgrammeService.updateWorksOrderDefect(params);
    }

    return;
    this.subs.add(
      apiCall.subscribe(
        data => {
          console.log(data);
        }
      )
    )




  }

}
