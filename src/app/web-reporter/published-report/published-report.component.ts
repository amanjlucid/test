import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WebReporterService } from '../../_services'

@Component({
  selector: 'app-published-report',
  templateUrl: './published-report.component.html',
  styleUrls: ['./published-report.component.css'],
  encapsulation: ViewEncapsulation.None
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
  loading = true;
  selectedReport: any;
  openPreviewReport = false;

  constructor(
    private reporterService: WebReporterService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.getPublishedReport();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getPublishedReport(param = null): void {
    this.subs.add(
      this.reporterService.getPublishedReport(param).subscribe(
        data => {
          if (data.isSuccess) {
            this.reportList = data.data;
            this.gridView = process(this.reportList, this.state);
            this.loading = false;
          } else this.alertService.error(data.message)
        },
        err => this.alertService.error(err)
      )
    )
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
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
    this.selectedReport = dataItem;
    // if (this.mySelection.length > 0) {
    //   setTimeout(() => {
    //     this.selectedReportList = this.reportList.filter(x => this.mySelection.indexOf(x.reportId) !== -1);
    //     this.chRef.detectChanges();
    //   }, 10);
    // }
  }

  previewReport(item) {
    this.selectedReport = item;
    this.openPreviewReport = true;
    $('.reportpublishedOverlay').addClass('ovrlay');
  }

  closePreviewReport(eve) {
    this.openPreviewReport = eve;
    $('.reportpublishedOverlay').removeClass('ovrlay');
  }

  openConfirmationDialog(item) {
    this.selectedReport = item;
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this report ?')
      .then((confirmed) => (confirmed) ? this.deleteReport(item) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));


  }

  deleteReport(item) {
    this.subs.add(
      this.reporterService.deletePublishedReport(item.xportIdentifier).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`${item.xportIdentifier} Report deleted successfully.`);
            this.getPublishedReport();
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }


}
