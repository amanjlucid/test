import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, SettingsService } from '../../_services'
import { tap, switchMap } from 'rxjs/operators';
import { interval } from 'rxjs';

@Component({
  selector: 'app-business-area',
  templateUrl: './business-area.component.html',
  styleUrls: ['./business-area.component.css']
})

export class BusinessAreaComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  allowUnsort = true;
  multiple = false;
  gridView: DataResult;
  loading = true
  selectableSettings: SelectableSettings;
  businessAreaList: any;
  selectedRow: any;
  rowIndex: any
  userList: any
  actualSelectedRowState: any;


  constructor(
    private settingService: SettingsService,
    private eventManagerService: EventManagerService
  ) {

    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.subs.add(
      this.eventManagerService.getAvailableUser().subscribe(
        data => {
          if (data.isSuccess) {
            this.userList = data.data;
            this.getbusinessAreaList();
          }
        }
      )
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.businessAreaList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.businessAreaList, this.state);
  }

  private closeEditor(grid, rowIndex) {
    grid.closeRow(rowIndex);
  }


  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.closeEditor(sender, rowIndex);
    this.selectedRow = dataItem;
    this.actualSelectedRowState = Object.assign({}, dataItem);
    this.rowIndex = rowIndex
    // console.log(this.selectedParam)
    if (columnIndex > 0) {
      // if (!isEdited && this.selectedParam.eventTypeParamType == 'N') {
      //   sender.editCell(rowIndex, columnIndex);
      // }
      sender.editCell(rowIndex, columnIndex);
    }
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  getbusinessAreaList() {
    this.subs.add(
      this.settingService.getBusinessAreaList().subscribe(
        data => {
          if (data.isSuccess) {
            this.businessAreaList = data.data
            this.gridView = process(this.businessAreaList, this.state);
          }
          this.loading = false;
        }
      )
    )
  }


  changeedRowData($event, option = null) {
    if (option == "inp") {
      if (JSON.stringify(this.selectedRow) == JSON.stringify(this.actualSelectedRowState)) {
        return
      }
    }

    setTimeout(() => {
      const userObj = this.getUserName(this.selectedRow.busAreaOwner);
      let params = {
        BusAreaCode: this.selectedRow.busAreaCode,
        BusAreaDesc: this.selectedRow.busAreaDesc,
        BusAreaOwner: userObj.mpusid
      }

      this.subs.add(
        this.settingService.updateListOfEventBusinessArea(params).pipe(switchMap(x => interval(100))).subscribe()
      )
    }, 300);
  }

  getUserName(id: any): any {
    return this.userList.find(x => x.mpusid === id);
  }





}
