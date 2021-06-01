import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

import { WorksorderManagementService, AlertService, HelperService, LoaderService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-defect-form',
  templateUrl: './defect-form.component.html',
  styleUrls: ['./defect-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DefectFormComponent implements OnInit {
  @Input() openDefectform: boolean = false;
  @Input() defectInp: any;
  @Input() defectFormMode:string = 'new';
  @Input() openedFrom:string;
  @Output() closeDefectFormEvent = new EventEmitter<boolean>();

  subs = new SubSink(); // to unsubscribe services
  title = 'New Defect';
  defectForm: FormGroup;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'reason': {
      'required': 'Reason is required.',
      'maxlength': 'Reason must be maximum 250 characters.',
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
  packageData:any;
  @ViewChild(GridComponent) grid: GridComponent;
  selectableSettings: SelectableSettings;

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private helperService: HelperService
  ) {
    this.setSelectableSettings();
   }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single'
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
  }

  closeDefectForm(){
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

}
