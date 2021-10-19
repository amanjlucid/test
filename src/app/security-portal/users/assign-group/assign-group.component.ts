import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, UserService } from '../../../_services'
import { UserGroup } from '../../../_models'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-assign-group',
  templateUrl: './assign-group.component.html',
  styleUrls: ['./assign-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AssignGroupComponent implements OnInit {
  subs = new SubSink();
  @Input() openUserAssignGroup: boolean = false;
  @Input() selectedUser;
  @Output() closeAssignGroupEvent = new EventEmitter<boolean>();
  assignGroups: UserGroup[];
  selectedGroup: UserGroup;
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  gridView: DataResult;
  pageSize = 25;
  loading = true;
  selectableSettings: SelectableSettings;
  mySelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return JSON.stringify(context.dataItem)
  }
  gridHeight = 550;
  textSearch$ = new Subject<string>();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  initialSavedData = [];
  @Output() refreshUserSecurityGrid = new EventEmitter<boolean>();


  constructor(
    private userService: UserService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    this.getAssignedUserGroup();

    this.subs.add(
      this.textSearch$
        .pipe(
          debounceTime(600),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.searchInAllFields(searchTerm)
          this.chRef.detectChanges()
        })
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  getAssignedUserGroup() {
    this.resetGrid()

    this.subs.add(
      this.userService.getUserGroups(this.selectedUser.userId).subscribe(
        data => {
          // console.log(data)
          if (data && data.isSuccess) {
            this.assignGroups = data.data;
            this.initialSavedData = data.data.filter(x => x.isSelected == true);
            this.mySelection = this.initialSavedData.map(x => JSON.stringify(x));

            this.gridView = process(this.assignGroups, this.state);
            this.loading = false;
            this.chRef.detectChanges()
          }
        }
      )
    )
  }


  includeOnlyGroup(event: any) {
    this.resetGrid()
    this.loading = true;
    this.chRef.detectChanges();

    this.subs.add(
      this.userService.getUserGroups(this.selectedUser.userId.toString()).subscribe(
        data => {
          // console.log(data);
          if (data && data.isSuccess) {
            const tempIsSelectedData = data.data.filter(x => x.isSelected == true);
            this.initialSavedData = tempIsSelectedData;
            this.mySelection = this.initialSavedData.map(x => JSON.stringify(x));

            if (event.target.checked) this.assignGroups = tempIsSelectedData
            else this.assignGroups = data.data;

            this.gridView = process(this.assignGroups, this.state);
            this.loading = false;
            this.chRef.detectChanges()
          }
        }
      )
    )
  }


  cellClickHandler({ columnIndex, dataItem }) {

  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.assignGroups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.assignGroups, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.assignGroups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.assignGroups.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }


  onFilter(inputValue: string): void {
    this.textSearch$.next(inputValue);
  }

  searchInAllFields(inputValue: any) {
    this.resetGrid()
    this.gridView = process(this.assignGroups, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'groupName',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'description',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'createdBy',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'createdDate',
            operator: 'contains',
            value: inputValue
          },
        ]
      }
    });
  }


  save() {

    const dataToadd = this.mySelection.map(x => {
      const temp = JSON.parse(x);
      return {
        UserId: temp.userId,
        GroupId: temp.groupId,
        LoggedInUserId: this.currentUser.userId,
        IsSelected: true
      }
    });

    const selctedData = dataToadd.map(x => `${x.UserId}_${x.GroupId}`);
    const arrayToDelete = this.initialSavedData.filter(x => !selctedData.includes(`${x.userId}_${x.groupId}`)).map(y => {
      return {
        UserId: y.userId,
        GroupId: y.groupId,
        LoggedInUserId: this.currentUser.userId,
        IsSelected: false
      }
    });



    if (dataToadd.length == 0 && arrayToDelete.length == 0) {
      this.alertService.error("There is no change");
      return
    }

    const params = { AddArray: dataToadd, DeleteArray: arrayToDelete }

    this.subs.add(
      this.userService.assigneGroup(params).subscribe(
        data => {
          // console.log(data)
          if (data.isSuccess) {
            this.alertService.success("User Updated Successfully.");
            this.refreshUserSecurityGrid.emit(true);
            this.close();
          } else this.alertService.error(data.message);
        }, error => this.alertService.error(error)
      )
    )

  }

  close() {
    this.openUserAssignGroup = false;
    this.closeAssignGroupEvent.emit(false)
  }


}
