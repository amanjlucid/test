import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, SelectionEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, HelperService } from '../../_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { SubSink } from 'subsink';


@Component({
  selector: 'app-asset-works-management',
  templateUrl: './asset-works-management.component.html',
  styleUrls: ['./asset-works-management.component.css']
})
export class AssetWorksManagementComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;

  worksManagementData;
  selectedWorkManagement;
  assetWorkDetailWindow: boolean = false;
  touchtime = 0;
  selectedAttribute;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  groups: GroupDescriptor[] = [];
  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  fileName: string = 'asset-work-management.xlsx';
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
    this.getAssetWorksManagementList();
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  getAssetWorksManagementList() {
    this.subs.add(
      this.assetAttributeService.getAssetWorksManagementList(this.assetId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.planned_Start_Date = (s.planned_Start_Date != "") ? DateFormatPipe.prototype.transform(s.planned_Start_Date, 'DD-MMM-YYYY') : s.planned_Start_Date;
                s.planned_End_Date = (s.planned_End_Date != "") ? DateFormatPipe.prototype.transform(s.planned_End_Date, 'DD-MMM-YYYY') : s.planned_End_Date;
                s.completion_Date = (s.completion_Date != "") ? DateFormatPipe.prototype.transform(s.completion_Date, 'DD-MMM-YYYY') : s.completion_Date;
                s.changed_On = (s.changed_On != "") ? DateFormatPipe.prototype.transform(s.changed_On, 'DD-MMM-YYYY') : s.changed_On;

              });
              this.worksManagementData = tempData;
              this.gridView = process(this.worksManagementData, this.state);
            }
          }
        )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.worksManagementData, this.state);//process(this.characteristicData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.worksManagementData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.worksManagementData, this.state);

  }

  public selectedRowChange(selectionEvent: SelectionEvent) {
    //this.selectedAttribute = this.gridView.data[selectionEvent.index];
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAttribute = dataItem;

  }

  openWorkDetail($event) {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        $('.charBlur').addClass('ovrlay');
        this.assetWorkDetailWindow = true;
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }

  }

  closeassetWorkDetailWindow($event) {
    $('.charBlur').removeClass('ovrlay');
    this.assetWorkDetailWindow = $event;
  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'asset-work-management.' + fileExt;
      let ignore = [];
      let label = {
        'element': 'Element',
        'attribute': 'Attribute',
        'plan_Year': 'Plan Year',
        'contractor': 'Contractor',
        'cttname': 'Contract',
        'work_Package': 'Work Package',
        'status': 'Status',
        'planned_Start_Date': 'Plan Started Date',
        'planned_End_Date': 'Plan End Date',
        'completion_Date': 'Completion Date',
        'changed_By': 'Modified By',
        'changed_On': 'Date Modified',

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
        //this.helper.exportAsExcelFile(this.selectedRows, 'asset-work-management', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'asset-work-management', label)
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


  checkDate(date) {
    if (date == '01-Jan-1753') {
      return null;
    }
    return date;
  }


}
