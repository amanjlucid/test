  import { Component, OnInit } from '@angular/core';
  import { SubSink } from 'subsink';
  import { DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
  import { AlertService,  HelperService, ConfirmationDialogService, SharedService, ChartService } from '../_services'
  import { Router } from '@angular/router';
  import { UserChartSettingViewModel } from '../_models'
  import { tap, switchMap, debounceTime } from 'rxjs/operators';
  import { interval, Subject} from 'rxjs';

  @Component({
    selector: 'app-chart-settings',
    templateUrl: './chart-settings.component.html',
    styleUrls: ['./chart-settings.component.css']
  })

  export class ChartSettingsComponent implements OnInit {
      subs = new SubSink();
      state: State = {
        skip: 0,
        sort: [],
        group: [],
        filter: {
          logic: "and",
          filters: []
        }
      }
      selectedRow: any;
      rowIndex: any
      allowUnsort = true;
      multiple = false;
      public gridView: DataResult;
      dataDetails: any;
      dataDetailsTemp: any
      selectedItem: any;
      userChartSettingViewModel: UserChartSettingViewModel = new UserChartSettingViewModel();
      amendedTermSave$ = new Subject<any>();
      touchtime = 0;
      public mode: any = 'single';
      currentUser: any;
      loading = true
      wopmSecurityList: any = [];

      constructor(
        private chartService: ChartService,
        private alertService: AlertService,
        private confirmationDialogService: ConfirmationDialogService,
        private sharedService: SharedService,
        private router: Router,
        private helper: HelperService
      ) { }

      ngOnInit(): void {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.getGridDataDetails();
        //update notification on top
        this.helper.updateNotificationOnTop();

        this.subs.add(
          this.amendedTermSave$
            .pipe(
              debounceTime(2000),
            ).subscribe((val) => {
              this.changedRowData(this.selectedItem);
            })
        );

      }

      keyupevent(dataItem) {
        this.selectedItem = dataItem
        this.amendedTermSave$.next(dataItem);
     }

      ngOnDestroy() {
        this.subs.unsubscribe();
      }

      ngAfterViewInit() {
      }

      distinctPrimitive(fieldName: string): any {
        return distinct(this.dataDetails, fieldName).map(item => {
          return { val: item[fieldName], text: item[fieldName] }
        });
      }

      getGridDataDetails() {
        this.subs.add(
          this.chartService.getUserChartSetting().subscribe(
            data => {
              if (data.isSuccess) {
                const chartSettings = data.data;
                this.dataDetails = chartSettings;
                this.dataDetailsTemp = Object.assign([], chartSettings);
                this.gridView = process(this.dataDetailsTemp, this.state);
                this.loading = false;
              }
            }
          )
        )
      }

      public sortChange(sort: SortDescriptor[]): void {
        this.state.sort = sort;
        this.gridView = process(this.dataDetailsTemp, this.state);
      }

      public filterChange(filter: any): void {
        this.state.filter = filter;
        this.gridView = process(this.dataDetailsTemp, this.state);

      }

      private closeEditor(grid, rowIndex) {
        grid.closeRow(rowIndex);
      }

      cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
        this.closeEditor(sender, rowIndex);
       // this.selectedRow = dataItem;
        this.rowIndex = rowIndex
        // console.log(this.selectedParam)
        if (columnIndex > 0) {
          sender.editCell(rowIndex, columnIndex);
        }
      }

      keydownevent(dataItem) {
        this.changedRowData(dataItem);
      }

      changedRowData(dataItem) {

        if ((dataItem.numberOfChart != dataItem.originalNumberOfChart) || dataItem.numberOfChart == 0)
        {

          if(dataItem.numberOfChart < 1 || dataItem.numberOfChart == null)
          {
            dataItem.numberOfChart = ''
          }
          if(dataItem.numberOfChart > 100)
          {
            dataItem.numberOfChart = 100
          }

          dataItem.originalNumberOfChart = dataItem.numberOfChart;
          this.selectedRow = dataItem
          setTimeout(() => {
            this.userChartSettingViewModel.dashboard = this.selectedRow.dashboard;
            this.userChartSettingViewModel.numberOfChart  = this.selectedRow.numberOfChart;
             this.subs.add(
              this.chartService.SaveUserChartSettings( this.userChartSettingViewModel).pipe(switchMap(x => interval(100))).subscribe()
            )
          }, 300);
        }

      }

  }

