import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, HelperService, WorksorderManagementService, SharedService } from '../../_services'

@Component({
  selector: 'app-worksorders-package-mapping',
  templateUrl: './worksorders-package-mapping.component.html',
  styleUrls: ['./worksorders-package-mapping.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersPackageMappingComponent implements OnInit {
  @Input() packageMappingWindow: boolean = false;
  @Input() worksOrderSingleData: any;
  @Output() closePackageMappingEvent = new EventEmitter<boolean>();

  subs = new SubSink();
  state: State = {
    skip: 0,
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
  title = 'Works Order Package Mapping';
  mappingData: any

  requestedData: any = [];
  templates: any;
  templateid: any = 0;
  public mySelection: number[] = [];


  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {

    this.getTemplate();

    this.getWorksPackages();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  getWorksPackages() {
    const param = {
      "WOSEQUENCE": this.worksOrderSingleData.wosequence,
      "CTTSURCDE": this.worksOrderSingleData.cttsurcde,
      "WPHCODEFilter": "",
      "WPHNAMEFilter": "",
      "ATADESCRIPTIONFilter": "",
      "UseDistinctFilter": false,
      "StageCheckDescDistinctList": ''
    }

    this.subs.add(
      this.worksorderManagementService.packageMappingList(param).subscribe(
        data => {
          if (data.isSuccess && data) {
            this.mappingData = data.data;
            this.gridView = process(this.mappingData, this.state);
            this.gridLoading = false;
            this.chRef.detectChanges();
          }

        }
      )
    )
  }

  getTemplate() {
    this.subs.add(
      this.worksorderManagementService.getPackageTemplate(this.worksOrderSingleData.wosequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.templates = data.data;
          } else {
            this.alertService.error(data.message)
          }
        }
      )
    )
  }

  closePackageMappingWindow() {
    this.packageMappingWindow = false;
    this.closePackageMappingEvent.emit(this.packageMappingWindow);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {

  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.mappingData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.mappingData, this.state);
  }

  apply(type) {

    let applyApi: any;

    //type 1 is form selected and type 2 is for all
    if (type == 1) {
      if (this.mySelection.length == 0) {
        this.alertService.error("Please select atleast one package mapping record.");
        return
      }

      let selectedData = this.mappingData.filter(x => this.mySelection.includes(x.wphcode));
      let wphcode = [];
      let ataid = [];

      for (let mapdata of selectedData) {
        wphcode.push(mapdata.wphcode);
        ataid.push(mapdata.ataid);
      }

      let params = {
        sequence: this.worksOrderSingleData.wosequence,
        cttsurcde: this.worksOrderSingleData.cttsurcde,
        wphcode: wphcode,//[],
        ataid: ataid,//[],
        checksurcde: this.templateid
      }

      applyApi = this.worksorderManagementService.selectedOrderMapping(params);

    } else {

      let params = {
        WOSEQUENCE: this.worksOrderSingleData.wosequence,
        CTTSURCDE: this.worksOrderSingleData.cttsurcde,
        WOCHECKSURCDE: this.templateid,
        WPHCODEFilter: '',
        WPHNAMEFilter: '',
        ATADESCRIPTIONFilter: '',
        StageCheckDescDistinctList: '',
        UseDistinctFilter: false
      }

      applyApi = this.worksorderManagementService.applyAllWorksOrderPackageMapping(params);

    }

    applyApi.subscribe(
      data => {
        if (!data.isSuccess) {
          this.alertService.error(data.message);
          return;
        }

        this.templateid = 0;
        this.mySelection = [];
        this.getWorksPackages();
      },
      err => this.alertService.error(err)
    )


  }

}
