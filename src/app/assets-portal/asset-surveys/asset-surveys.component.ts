import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, HelperService } from '../../_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-surveys',
  templateUrl: './asset-surveys.component.html',
  styleUrls: ['./asset-surveys.component.css']
})
export class AssetSurveysComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;
  surveyFilters;
  surveyData;
  actualSurveyData;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  groups: GroupDescriptor[] = [];
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  fileName: string = 'asset-survey.xlsx';
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
    this.getAssetSurveysFilters();
    this.getAssetSurveysList();
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.surveyData, this.state);//process(this.characteristicData, this.state);
  }

  getAssetSurveysFilters() {
    this.subs.add(
      this.assetAttributeService.getAssetSurveysFilters(this.assetId).subscribe(
        data => {
          this.surveyFilters = data;
        }
      )
    )
  }

  getAssetSurveysList() {
    this.subs.add(
      this.assetAttributeService.getAssetSurveysList(this.assetId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.healthAndSafetySurveyYN = (s.healthAndSafetySurveyYN == 'Y') ? 'Yes' : 'No';
                s.survey_Date = (s.survey_Date != "") ? DateFormatPipe.prototype.transform(s.survey_Date, 'DD-MMM-YYYY') : s.survey_Date;

                if (s.batch_Asset_Status == "E") {
                  s.batch_Asset_Status = "Export";
                } else if (s.batch_Asset_Status == "P" || s.batch_Asset_Status == "I") {
                  s.batch_Asset_Status = "Partial";
                } else if (s.batch_Asset_Status == "C") {
                  s.batch_Asset_Status = "Complete";
                } else if (s.batch_Asset_Status == "D") {
                  s.batch_Asset_Status = "Downloaded";
                } else if (s.batch_Asset_Status == "N") {
                  s.batch_Asset_Status = "New";
                } else if (s.batch_Asset_Status == "A") {
                  s.batch_Asset_Status = "Active";
                } else if (s.batch_Asset_Status == "R") {
                  s.batch_Asset_Status = "Reassigned";
                } else if (s.batch_Asset_Status == "Q") {
                  s.batch_Asset_Status = "Cloned";
                } else if (s.batch_Asset_Status == "X") {
                  s.batch_Asset_Status = "Archived";
                } else {
                  s.batch_Asset_Status = "Unknown";
                }

                // s.batch_Asset_Status = (s.batch_Asset_Status == 'C') ? 'Complete' : s.batch_Asset_Status == 'E' ? 'Export' : s.batch_Asset_Status == 'E' ? 'Export';
              });
              this.surveyData = tempData;
              this.actualSurveyData = tempData;
              this.gridView = process(this.surveyData, this.state);
            }
          }
        )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.surveyData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.surveyData, this.state);

  }

  filterAttributes(value) {
    let actualchar = this.actualSurveyData;
    if (value == 'ALL') {
      this.surveyData = this.actualSurveyData;
    } else {
      this.surveyData = actualchar.filter(c => c.filterValue == value);
    }
    this.gridView = process(this.surveyData, this.state)
  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'asset-survey.' + fileExt;
      let ignore = [];
      let label = {
        'healthAndSafetySurveyYN': 'H&S',
        'survey_Date': 'Survey Date',
        'project_Code': 'Project Code',
        'project_Name': 'Project Name',
        'survey_Code': 'Survey Code',
        'survey_Version': 'Version',
        'batch_Name': 'Batch Name',
        'batch_Asset_Status': 'Batch Asset Status',
        'surveyor': 'Surveyor'
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
        //this.helper.exportAsExcelFile(this.selectedRows, 'asset-survey', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'asset-survey', label)
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
