import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerDashboardService, HelperService, AssetAttributeService } from '../../../_services'
import { encode } from 'punycode';
import { appConfig } from '../../../app.config';

@Component({
  selector: 'app-retrieved-epc-grid',
  templateUrl: './retrieved-epc-grid.component.html',
  styleUrls: ['./retrieved-epc-grid.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrievedEpcGridComponent implements OnInit {

  subs = new SubSink();
  allowUnsort = true;
  multiple = false;
  @Input() retrievedEPCs: boolean = false;
  @Input() showPanel: boolean = false;
  @Input() selectedBarChartXasis: any;
  chartData: any;
  selectedEvent: any;
  @Output() closeEPCChartDataWindow = new EventEmitter<boolean>();
  title: any = 'Energy';
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  mySelection: number[] = [];
  gridView: DataResult;
  columnName = [];
  showAssetLink: boolean = false;
  AssetIDColumn: string = "";

  constructor(
    private chRef: ChangeDetectorRef,
    private dashboardService: EventManagerDashboardService,
    private helperService: HelperService,
    private alertService: AlertService,
    private assetAttributeService: AssetAttributeService,
  ) { }

  ngOnInit() {
    if (this.retrievedEPCs) {
      this.title = 'Retrieved EPCs during ' + this.selectedBarChartXasis.xAxisValue;
    } else {
      this.title = 'Energy Data for ' + this.selectedBarChartXasis.chartName + ' - ' + this.selectedBarChartXasis.xAxisValue;
    }

    this.getData(this.selectedBarChartXasis);
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  getData(params) {
    this.subs.add(
      this.dashboardService.getListOfUserEventByCriteria(params).subscribe(
        data => {
          if (data.isSuccess) {
            let chartTempData = Object.assign([], data.data);
            let col = data.data[0];
            
            for (let cl in col) {
              if (col[cl] != '')
                this.columnName.push({ 'key': `col${cl}`, 'val': col[cl] })
            }

            
            let seqCol = this.columnName.find(x => x.val == "Asset ID")
            if (seqCol) {
              this.showAssetLink = true;
            }
            
            // chartTempData.shift();
            for (let tmpData of chartTempData) {
              for (let tindex in tmpData) {
                tmpData[`col${tindex}`] = tmpData[tindex]
                delete tmpData[tindex];
              }
            }

            this.chartData = Object.assign([], chartTempData);
            this.renderGrid();

          }
        }
      )
    )
  }



  groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.renderGrid();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.renderGrid();
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.renderGrid();
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedEvent = dataItem;
    if (columnIndex > 1) {

    }
  }

  renderGrid() {
    this.gridView = process(this.chartData, this.state);
    this.chRef.detectChanges();
  }

  closeGrid() {
    this.showPanel = false;
    this.closeEPCChartDataWindow.emit(this.showPanel)
  }

  export() {
    let label = {};
    for (let col of this.columnName) {
      label[col.key] = col.val
    }

    if (this.chartData) {
      this.helperService.exportAsExcelFile(this.chartData, this.selectedBarChartXasis.xAxisValue, label)
    } else {
      this.alertService.error("There is no record to export.")
    }

  }

  AssetLink(val) {
    const seqCol = this.columnName.find(x => x.val == "Asset ID")
    if (seqCol) {
      let assetIds = [];
      if (val == "all") {
        if (this.chartData.length > 0) {
          assetIds = this.chartData.map(x => x[seqCol.key])
        } else {
          this.alertService.error("No record selected.")
          return
        }
      } else {
        if (this.mySelection.length > 0) {
          for (let rowSelected of this.mySelection) {
            assetIds.push(this.chartData[rowSelected][seqCol.key]);
          }
        } else {
          this.alertService.error("No record selected.")
          return
        }
      }

      localStorage.setItem('assetList', btoa(assetIds.toString()));
      let siteUrl = `${appConfig.appUrl}/asset-list?energyData=true`
      window.open(siteUrl, "_blank");

    } else {
      this.alertService.error('Asset ID column not found.')
      return
    }






    //   if (this.ChartsWithLinks.includes(this.selectedBarChartXasis.chartName)) {

    //     let url = `${appConfig.appUrl}/asset-list`; // for local
    //     if (this.selectedBarChartXasis.chartName == "EPC SAP Band & Cloned" || this.selectedBarChartXasis.chartName == "EPC SAP Bands") {
    //       url += `?sapBand=${encodeURIComponent(this.selectedBarChartXasis.xAxisValue)}`;
    //     }
    //     if (this.selectedBarChartXasis.chartName == "EPC Status") {
    //       url += `?epcStatus=${encodeURIComponent(this.selectedBarChartXasis.xAxisValue)}`;
    //     }
    //     window.open(url, "_blank");

    // } else {
    //   let assetIds = this.chartData.map(x => x[`col${this.AssetIdColumnIndex}`])
    //   localStorage.setItem('assetList', btoa(assetIds.toString()));
    //   let siteUrl = `${appConfig.appUrl}/asset-list?energyData=true`
    //   window.open(siteUrl, "_blank");


    // }

  }






}
