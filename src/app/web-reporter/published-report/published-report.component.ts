import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WebReporterService } from '../../_services'

@Component({
  selector: 'app-published-report',
  templateUrl: './published-report.component.html',
  styleUrls: ['./published-report.component.css']
})

export class PublishedReportComponent implements OnInit {
  subs = new SubSink();
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
  allowUnsort = true;
  multiple = false;
  selectableSettings: SelectableSettings;
  mySelection: number[] = [];
  currentUser: any;
  rowheight = 36;
  gridView: DataResult;
  pageSize = 25;
  reportList: any;
  loading = false;
  selectedReport: any;

  constructor() {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'multiple'
    };
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.reportList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.reportList, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.reportList.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.reportList.length
    };
  }

  setSeletedRow(dataItem) {
    this.selectedReport = dataItem;
  }

  onSelectedKeysChange($event) {
    // console.log(this.mySelection)
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // if (this.mySelection.length > 0) {
    //   setTimeout(() => {
    //     this.selectedReportList = this.reportList.filter(x => this.mySelection.indexOf(x.reportId) !== -1);
    //     this.chRef.detectChanges();
    //   }, 10);
    // }
  }


}
