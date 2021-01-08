import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, ConfirmationDialogService, HelperService, WebReporterService } from '../../_services'


@Component({
  selector: 'app-set-user-category',
  templateUrl: './set-user-category.component.html',
  styleUrls: ['./set-user-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetUserCategoryComponent implements OnInit {
  subs = new SubSink();
  @Input() openSetUserCategory: boolean = false;
  @Input() selectedReport: any;
  @Output() closeSetUserCategoryWindow = new EventEmitter<boolean>();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  title = 'Choose User Categories';
  gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  userCategoyList: Array<[]>;
  templateHeading = '';
  selectableSettings: SelectableSettings;
  mySelection: number[] = [];
  loading = true;
  selectedUserCategory: any;
  openManageUserCategory: boolean = false;
  openCreateUserCategory: boolean = false;
  mode = 'new';
  currentUser: any;

  constructor(
    private reportService: WebReporterService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.templateHeading = this.selectedReport.reportId + " " + this.selectedReport.reportName;
    this.getUserCategories();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.userCategoyList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.userCategoyList, this.state);
  }

  getUserCategories() {
    this.subs.add(
      this.reportService.getUserCategory().subscribe(
        data => {
          if (data.isSuccess) {
            this.userCategoyList = data.data;
            this.gridView = process(this.userCategoyList, this.state);
            this.loading = false;
            this.chRef.detectChanges();
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }

  closeUserCategories() {
    this.openSetUserCategory = false;
    this.closeSetUserCategoryWindow.emit(this.openSetUserCategory);
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  onSelectedKeysChange($event) {
    // console.log(this.mySelection)
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedUserCategory = dataItem;
  }

  manage(item) {
    this.selectedUserCategory = item;
    this.openManageUserCategory = true;
    $('.userCatOvrlay').addClass('ovrlay');
  }

  closeManageUserCategoryWindow(eve) {
    this.openManageUserCategory = eve;
    $('.userCatOvrlay').removeClass('ovrlay');
  }

  createNewUserCategory(mode = 'new') {
    this.openCreateUserCategory = true;
    this.mode = mode;
    $('.userCatOvrlay').addClass('ovrlay');
  }

  closeCreateUserCategoryWindow(eve) {
    this.openCreateUserCategory = eve;
    $('.userCatOvrlay').removeClass('ovrlay');
  }

  refresSetCategoryWindow(eve) {
    if (eve) this.getUserCategories();
  }

  openConfirmationDialog(item) {
    this.selectedUserCategory = item;
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteUserCategory() : console.log(confirmed))
      .catch((err) => this.alertService.error('Something went wrong.'));
  }

  deleteUserCategory() {
    this.subs.add(
      this.reportService.deleteUserCategory(this.currentUser.userId, this.selectedUserCategory.name).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success('Category delete successfully.');
            this.getUserCategories();
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )
  }


}
