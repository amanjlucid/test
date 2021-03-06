import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { RowArgs } from '@progress/kendo-angular-grid';
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
  public mySelection: any[] = [];
  worksOrderData: any;
  mySelectionKey(context: RowArgs): string {
    return `${context.dataItem.wphcode}_${context.dataItem.ataid}_${context.dataItem.cttsurcde}`;
  }

  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    this.subs.add(
      this.worksorderManagementService.getWorksOrderByWOsequence(this.worksOrderSingleData.wosequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.worksOrderData = data.data;
            this.getTemplate();
            this.getWorksPackages();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  getWorksPackages() {
    const param = {
      "WOSEQUENCE": this.worksOrderData.wosequence,
      "CTTSURCDE": this.worksOrderData.cttsurcde,
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
      this.worksorderManagementService.getPackageTemplate(this.worksOrderData.wosequence).subscribe(
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

  confirmAppyAll() {
    $('.k-window').css({ 'z-index': 1000 });
    let confirmationMsg = `${this.mappingData.length} Package Mapping records will be updated. Do you want to continue?`
    this.confirmationDialogService.confirm('Please confirm..', `${confirmationMsg}`)
      .then((confirmed) => (confirmed) ? this.apply(2) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  apply(type) {

    let applyApi: any;

    //type 1 is form selected and type 2 is for all
    if (type == 1) {
      if (this.mySelection.length == 0) {
        this.alertService.error("Please select at least one package mapping record.");
        return
      }

    
      let selectedData = this.mappingData.filter(x => this.mySelection.includes(`${x.wphcode}_${x.ataid}_${x.cttsurcde}`));

      let wphcode = [];
      let ataid = [];

      for (let mapdata of selectedData) {
        wphcode.push(mapdata.wphcode);
        ataid.push(mapdata.ataid);
      }

      let params = {
        sequence: this.worksOrderData.wosequence,
        cttsurcde: this.worksOrderData.cttsurcde,
        wphcode: wphcode,//[],
        ataid: ataid,//[],
        checksurcde: this.templateid
      }

      applyApi = this.worksorderManagementService.selectedOrderMapping(params);

    } else {

      let params = {
        WOSEQUENCE: this.worksOrderData.wosequence,
        CTTSURCDE: this.worksOrderData.cttsurcde,
        WOCHECKSURCDE: this.templateid,
        WPHCODEFilter: '',
        WPHNAMEFilter: '',
        ATADESCRIPTIONFilter: '',
        StageCheckDescDistinctList: '',
        UseDistinctFilter: false
      }

      applyApi = this.worksorderManagementService.applyAllWorksOrderPackageMapping(params);

    }

    this.subs.add(
      applyApi.subscribe(
        data => {
          if (!data.isSuccess) {
            this.alertService.error(data.message);
            return;
          }

          // this.templateid = 0;
          this.mySelection = [];
          this.getWorksPackages();
        },
        err => this.alertService.error(err)
      )
    )


  }

}
