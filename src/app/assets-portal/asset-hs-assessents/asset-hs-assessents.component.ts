import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, HelperService } from '../../_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-hs-assessents',
  templateUrl: './asset-hs-assessents.component.html',
  styleUrls: ['./asset-hs-assessents.component.css']
})
export class AssetHSAssessentsComponent implements OnInit, OnDestroy {


  @Input() assetId: string;
  @Input() selectedAsset;
  hsFilters;
  hsData;
  actualHsData;
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
  public resultData: any;
  groups: GroupDescriptor[] = [];
  public gridView: DataResult;
  public allowUnsort = true;
  public multiple = false;
  fileName: string = 'hNs.xlsx';
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
    this.getAssetHSAssessmentFilters();
    this.getAssetHSAssessmentList();

  }

  public mySelectionKey(context: RowArgs) {
    // if (this.mySelection.length != undefined && this.mySelection.length > 0) {
    //   let selectedRows = this.gridView.data.filter((v, k) => {
    //     return this.mySelection.includes(k)
    //   });
    //   this.selectedRows = selectedRows;
    // }
    return context.index;
  }


  getAssetHSAssessmentFilters() {
    this.subs.add(
      this.assetAttributeService.getAssetHSAssessmentFilters(this.assetId).subscribe(
        data => {
          this.hsFilters = data;

        }
      )
    )
  }

  getAssetHSAssessmentList() {
    this.subs.add(
      this.assetAttributeService.getAssetHSAssessmentList(this.assetId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.hasasource = (s.hasasource == 'I') ? 'Interface' : 'Survey';
                s.hasassessmentdate = (s.hasassessmentdate != "") ? DateFormatPipe.prototype.transform(s.hasassessmentdate, 'DD-MMM-YYYY') : s.hasassessmentdate;

              });
              this.hsData = tempData;
              this.actualHsData = tempData;
              this.gridView = process(this.hsData, this.state);
            }
          }
        )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.hsData, this.state);//process(this.characteristicData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.hsData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.hsData, this.state);

  }

  filterAttributes(value) {
    let actualchar = this.actualHsData;
    if (value == 'ALL') {
      this.hsData = this.actualHsData;
    } else {
      this.hsData = actualchar.filter(c => c.filterValue == value);
    }
    this.gridView = process(this.hsData, this.state)
  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'hNs.' + fileExt;
      let ignore = [];
      let label = {
        'hascode': 'Definition',
        'hasversion': 'Version',
        'hasassessmentref': 'Assessment Ref',
        'hasassessmentdate': 'Assessment Date',
        'hasassessor': 'Assessor',
        'hasasource': 'Source',
        'supcode': 'Project'

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
        //this.helper.exportAsExcelFile(this.selectedRows, 'hNs', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'hNs', label)
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

  openResult() {
    window.open(`https://apexdevweb.rowanwood.ltd/dev/Rowanwood/HealthAndSafety/#/Results?ASSID=${this.assetId}&HSCODE=${this.resultData.hascode}&HSVERSION=${this.resultData.hasversion}&HSASSESSMENTREF=${this.resultData.hasassessmentref}`, "_blank");
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.resultData = dataItem
  }

}
