import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WebReporterService } from '../../_services'

@Component({
  selector: 'app-manage-user-category',
  templateUrl: './manage-user-category.component.html',
  styleUrls: ['./manage-user-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ManageUserCategoryComponent implements OnInit {
  subs = new SubSink();
  @Input() openManageUserCategory: boolean = false;
  @Input() selectedUserCategory: any;
  @Input() selectedReport: any;
  @Output() closeManageUserCategoryWindow = new EventEmitter<boolean>();
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
  title = 'Manage Custom Categories';
  selectableSettings: SelectableSettings;
  mySelection: number[] = [];
  allowUnsort = true;
  multiple = false;
  reportList: any;
  reportQueryModel = {
    userId: '',
    value: 0,
    Categories: '',
    IsShceduled: false,
    FavouritesOnly: false,
    XportCategory: ''
  }
  currentUser: any;
  rowheight = 36;
  gridView: DataResult;
  pageSize = 25;
  actualSelectedReport: Array<any>;
  selectedReportList: any;
  loading = true;

  constructor(
    private alertService: AlertService,
    private reportService: WebReporterService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.reportQueryModel.userId = this.currentUser.userId;
    this.getUserCategoryReport();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getUserCategoryReport() {
    this.subs.add(
      // this.reportService.getUserCategoryReport(this.selectedUserCategory.name).subscribe(
      //   data => {
      //     if (data.isSuccess) {
      //       this.mySelection = data.data.map(x => x.reportId);
      //       this.actualSelectedReport = [...this.mySelection];
      //       this.getReportList(this.reportQueryModel);
      //     } else this.alertService.error(data.message);
      //   },
      //   err => this.alertService.error(err)
      // )
    )
  }

  getReportList(params) {
    this.subs.add(
      this.reportService.getReportList(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.reportList = data.data;
            this.gridView = process(this.reportList, this.state);
            this.loading = false;
            this.chRef.detectChanges();
          } else this.alertService.error(data.message)
        },
        err => this.alertService.error(err)
      )
    )
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

  closeManageUserCategory() {
    this.openManageUserCategory = false;
    this.closeManageUserCategoryWindow.emit(this.openManageUserCategory);
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'multiple'
    };
  }

  onSelectedKeysChange($event) {
    // console.log(this.mySelection)
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (this.mySelection.length > 0) {
      setTimeout(() => {
        this.selectedReportList = this.reportList.filter(x => this.mySelection.indexOf(x.reportId) !== -1);
        this.chRef.detectChanges();
      }, 10);
    }
  }

  saveReportCategory() {
    const findIdToDelete = this.actualSelectedReport.filter(x => this.mySelection.indexOf(x) === -1);
    if (this.mySelection.length > 0) {
      const params = { XportIdentifier: this.mySelection, XportCategory: this.selectedUserCategory.name }
      this.subs.add(
        this.reportService.insertReportInCategory(params).subscribe(
          data => {
            if (data.isSuccess) {
              if (findIdToDelete.length > 0) {
                const paramsToDelete = { XportIdentifier: findIdToDelete, XportCategory: this.selectedUserCategory.name }
                this.subs.add(
                  this.reportService.deleteReportFromCategory(paramsToDelete).subscribe(
                    data => {
                      if (data.isSuccess) console.log(data)
                      else this.alertService.error(data.message)
                      this.getUserCategoryReport();
                    },
                    err => this.alertService.error(err)
                  )
                )
              } else this.getUserCategoryReport();
            } else this.alertService.error(data.message)
          },
          err => this.alertService.error(err)
        )
      )
    }


  }

}
