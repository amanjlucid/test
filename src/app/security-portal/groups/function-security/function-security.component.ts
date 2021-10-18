import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, LoaderService, FunctionSecurityService, GroupService } from '../../../_services'
import { forkJoin, Subject } from 'rxjs';
import { FunctionSecurityModel } from '../../../_models'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-function-security',
  templateUrl: './function-security.component.html',
  styleUrls: ['./function-security.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FunctionSecurityComponent implements OnInit {
  subs = new SubSink();
  @Input() functionSecurityWindow: boolean = false;
  @Input() selectedGroup;
  @Output() closeWindow = new EventEmitter<boolean>();
  @Output() cancelGroupFunctionEvents = new EventEmitter<boolean>();
  group: any;
  windowState = 'maximized';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  selectedPortal: any;
  functionPortals: any;
  title = '';
  functionType: any;
  selectedFunctionType = 'Global Function';;
  availableFunctions: FunctionSecurityModel[];
  assignedFunctions: FunctionSecurityModel[];
  availableFunctionState: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  availableGridView: DataResult;
  availableGridpageSize = 25;
  availableGridLoading = true;
  availableGridSelectableSettings: SelectableSettings;
  availableGridMySelection: any = [];
  availableGridMySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.dataItem)
  }
  assignFunctionState: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  assignGridView: DataResult;
  assignGridpageSize = 25;
  assignGridLoading = true;
  assignGridSelectableSettings: SelectableSettings;
  assignGridMySelection: any = [];
  assignGridMySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.dataItem)
  }

  availableFunctionLists: FunctionSecurityModel[] = [];
  assignedFunctionLists: FunctionSecurityModel[] = [];
  gridHeight = window.innerHeight - 300;
  textSearchInAvailableGrid$ = new Subject<string>();
  textSearchInAssignGrid$ = new Subject<string>();

  constructor(
    private functionSecService: FunctionSecurityService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private groupService: GroupService,
  ) {
    this.setSelectableSettings("AV");
    this.setSelectableSettings("AS");
  }

  setSelectableSettings(grid = "AV"): void {
    if (grid == "AV") {
      this.availableGridSelectableSettings = {
        checkboxOnly: false,
        mode: 'multiple'
      };
    }

    if (grid == "AS") {
      this.assignGridSelectableSettings = {
        checkboxOnly: false,
        mode: 'multiple'
      };
    }

  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.subs.add(
      this.groupService.groupListByGroupId(this.selectedGroup.groupID).subscribe(
        data => {
          if (data.isSuccess) {
            this.group = data.data
            this.title = `Security Functions - ${this.group.groupName}`
            this.createSession();
          }
        }
      )
    )

    this.subs.add(
      this.textSearchInAvailableGrid$
        .pipe(
          debounceTime(600),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.searchInAvailableGridAllFields(searchTerm)
          this.chRef.detectChanges()
        })
    )

    this.subs.add(
      this.textSearchInAssignGrid$
        .pipe(
          debounceTime(600),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.searchInAssignGridAllFields(searchTerm)
          this.chRef.detectChanges()
        })
    )

  }


  showTab(tabName) {
    this.selectedFunctionType = tabName;
    this.getAllFunctionList()
  }

  closeFunctionSecWindow() {
    this.cancelGroupFunctions();
    this.functionSecurityWindow = false;
    this.closeWindow.emit(this.functionSecurityWindow)
  }


  createSession() {
    this.subs.add(
      this.functionSecService.createSession(this.selectedGroup.groupID, this.currentUser.userId).subscribe(
        data => {
          if (data && data.data == "Y") {
            this.getPortalAndFunctionList();
          } else {
            this.loaderService.hide();
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


  getPortalAndFunctionList() {
    this.subs.add(
      forkJoin([
        this.functionSecService.getFunctionPortals(this.group.workOrderLevel),
        this.functionSecService.getFunctionTypes(this.group.workOrderLevel)
      ]).subscribe(
        data => {
          this.functionPortals = data[0].data;
          this.selectedPortal = this.functionPortals[0];

          this.functionType = data[1].data;
          this.selectedFunctionType = this.functionType[0];

          this.getAllFunctionList()
          this.chRef.detectChanges()
        }
      )
    )
  }


  getAllFunctionList() {
    if (this.selectedPortal && this.selectedFunctionType && this.selectedGroup) {
      this.availableFunction();
      this.assignedFunction();
    }
  }


  availableFunction() {
    this.availableGridResetGrid()
    this.subs.add(
      this.functionSecService.availableFunctionList(this.selectedPortal, this.selectedFunctionType, this.currentUser.userId, this.selectedGroup.groupID).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.availableFunctions = data.data;
            this.availableGridView = process(this.availableFunctions, this.availableFunctionState);
            this.availableGridLoading = false;
            this.chRef.detectChanges()
          }
        }
      )
    )

  }


  assignedFunction() {
    this.assignGridResetGrid()

    this.functionSecService.assignedFunctionList(this.selectedPortal, this.selectedFunctionType, this.currentUser.userId, this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.assignedFunctions = data.data;
          this.assignGridView = process(this.assignedFunctions, this.assignFunctionState);
          this.assignGridLoading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }



  availableGridCellClickHandler({ columnIndex, dataItem }) {

  }

  availableGridSortChange(sort: SortDescriptor[]): void {
    this.availableGridResetGrid()
    this.availableFunctionState.sort = sort;
    this.availableGridView = process(this.availableFunctions, this.availableFunctionState);
  }

  availableGridFilterChange(filter: any): void {
    this.availableGridResetGrid()
    this.availableFunctionState.filter = filter;
    this.availableGridView = process(this.availableFunctions, this.availableFunctionState);
  }

  availableGridPageChange(event: PageChangeEvent): void {
    this.availableFunctionState.skip = event.skip;
    this.availableGridView = {
      data: this.availableFunctions.slice(this.availableFunctionState.skip, this.availableFunctionState.skip + this.availableGridpageSize),
      total: this.availableFunctions.length
    };
  }

  availableGridResetGrid() {
    this.availableFunctionState.skip = 0;
  }



  assignGridCellClickHandler({ columnIndex, dataItem }) {

  }

  assignGridSortChange(sort: SortDescriptor[]): void {
    this.assignGridResetGrid()
    this.assignFunctionState.sort = sort;
    this.assignGridView = process(this.assignedFunctions, this.assignFunctionState);
  }

  assignGridFilterChange(filter: any): void {
    this.assignGridResetGrid()
    this.assignFunctionState.filter = filter;
    this.assignGridView = process(this.assignedFunctions, this.assignFunctionState);
  }

  assignGridPageChange(event: PageChangeEvent): void {
    this.assignFunctionState.skip = event.skip;
    this.assignGridView = {
      data: this.assignedFunctions.slice(this.assignFunctionState.skip, this.assignFunctionState.skip + this.assignGridpageSize),
      total: this.assignedFunctions.length
    };
  }

  assignGridResetGrid() {
    this.assignFunctionState.skip = 0;
  }


  includeAvailableFunction(incAll = false) {
    if (incAll) {
      // change toTemp value to true to include
      this.availableFunctionLists = this.availableFunctions.filter(x => x.toTemp = true);
    } else {
      for (const selectedAvailable of this.availableGridMySelection) {
        const temp = JSON.parse(selectedAvailable);
        temp.toTemp = true;
        this.availableFunctionLists.push(temp);
      }
    }

    if (this.availableFunctionLists.length) {
      this.subs.add(
        this.functionSecService.includeAvailableFncToAssined(this.availableFunctionLists).subscribe(
          data => {
            if (data && data.isSuccess) {
              this.getAllFunctionList();
              this.availableFunctionLists = [];
              this.assignedFunctionLists = [];
            } else this.alertService.error(data.message)
          }, err => this.alertService.error(err)
        )
      )
    }

  }


  removeAvailableFunction(remAll = false) {
    if (remAll) {
      this.assignedFunctionLists = this.assignedFunctions;
    } else {
      for (const selectedAssignedFunction of this.assignGridMySelection) {
        const temp = JSON.parse(selectedAssignedFunction);
        temp.toTemp = false;
        this.assignedFunctionLists.push(temp);
      }
    }

    if (this.assignedFunctionLists.length) {
      this.functionSecService.removeAvailableFncFromAssined(this.assignedFunctionLists).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.getAllFunctionList();
            this.assignedFunctionLists = [];
            this.availableFunctionLists = [];
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    }
  }


  saveGroupFunction() {
    if (this.availableFunctions && this.assignedFunctions) {
      this.subs.add(
        this.functionSecService.saveGroupFunctions(this.selectedGroup.groupID, this.currentUser.userId).subscribe(
          data => {
            this.closeFunctionSecWindow();
          }
        )
      )
    }
  }

  cancelGroupFunctions() {
    if (this.availableFunctions && this.assignedFunctions) {
      this.cancelGroupFunctionEvents.emit(true)
    } else {
      this.cancelGroupFunctionEvents.emit(false)
    }
  }



  onAvailableGridFilter(inputValue: string): void {
    this.textSearchInAvailableGrid$.next(inputValue);
  }

  searchInAvailableGridAllFields(inputValue: any) {
    this.availableGridResetGrid()
    this.availableGridView = process(this.availableFunctions, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'functionName',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'portalArea',
            operator: 'contains',
            value: inputValue
          }
        ]
      }
    });
  }

  onAssignGridFilter(inputValue: string): void {
    this.textSearchInAssignGrid$.next(inputValue);
  }


  searchInAssignGridAllFields(inputValue: any) {
    this.assignGridResetGrid()
    this.assignGridView = process(this.assignedFunctions, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'functionName',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'portalArea',
            operator: 'contains',
            value: inputValue
          }
        ]
      }
    });
  }



  getWindowHeight(height) {
    const roudedHeight = Math.round(height);
    this.gridHeight = roudedHeight - 307;
  }

  getWindowState(state) {
    if (state == 'default') this.gridHeight = window.innerHeight - 400
    if (state == 'maximized') this.gridHeight = window.innerHeight - 300
  }


}
