import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, HelperService } from '../../_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-quality',
  templateUrl: './asset-quality.component.html',
  styleUrls: ['./asset-quality.component.css']
})
export class AssetQualityComponent implements OnInit, OnDestroy {
  @Input() assetId: string;
  @Input() selectedAsset;

  qualityData;

  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  groups: GroupDescriptor[] = [];
  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  fileName: string = 'asset-quality.xlsx';
  subs = new SubSink(); // to unsubscribe services

  constructor(
    private assetAttributeService: AssetAttributeService,
    private helper: HelperService,
  ) { }


  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.getAssetQualityList();
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  getAssetQualityList() {
    this.subs.add(
      this.assetAttributeService.getAssetQualityList(this.assetId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.run_Date = (s.run_Date != "") ? DateFormatPipe.prototype.transform(s.run_Date, 'DD-MMM-YYYY') : s.run_Date;
              });
              this.qualityData = tempData;
              this.gridView = process(this.qualityData, this.state);
            }
          }
        )
    )
  }


  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.qualityData, this.state);//process(this.characteristicData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.qualityData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.qualityData, this.state);

  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'asset-quality.' + fileExt;
      let ignore = [];
      let label = {
        'pass_or_Fail': 'Passed?',
        'run_Date': 'Run Date',
        'run_ID': 'Run ID',
        'quality_Standard': 'Quality Standard',
        'quality_Standard_name': 'Quality Standard Name',
        'quality_Run_Name': 'Quality Run Name',
        'run_Type': 'Run Type',
        'cost_Horizon': 'Cost Horizon',
        'current_Fail_Cost': 'Current Fail Cost',
        'future_Failure_Cost': 'Future Failure Cost',
        'financial_Year': 'Financial Year'
      }
      if (rowSelection != null) {
        if (this.mySelection.length != undefined && this.mySelection.length > 0) {
          let selectedRows = this.gridView.data.filter((v, k) => {
            return this.mySelection.includes(k)
          });
          this.selectedRows = selectedRows;
        } else {
          this.selectedRows = this.gridView.data;
        }
      } else {
        this.selectedRows = this.gridView.data;
      }
      //if (fileExt == 'xlsx' && rowSelection != null) {
      if (fileExt == 'xlsx') {
        //this.helper.exportAsExcelFile(this.selectedRows, 'asset-quality', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'asset-quality', label)
      } else if (fileExt == 'html') {
        this.helper.exportAsHtmlFile(this.selectedRows, this.fileName, label)
      } else {
        this.helper.exportToCsv(this.fileName, this.selectedRows, ignore, label);
      }
      //this.helper.exportToCsv(this.fileName, this.gridView.data, ignore, label);
    } else {
      grid.saveAsExcel();
    }
  }



}
