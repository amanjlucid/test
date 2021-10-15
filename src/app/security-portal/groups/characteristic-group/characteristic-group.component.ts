import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, CharacteristicGroupService } from '../../../_services'
import { CharateristicGroupModel } from '../../../_models'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-characteristic-group',
  templateUrl: './characteristic-group.component.html',
  styleUrls: ['./characteristic-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CharacteristicGroupComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
  @Output() closeGroupAssetDetailEvent = new EventEmitter<boolean>();
  charGroups: CharateristicGroupModel[]
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
    return context.dataItem.characteristic_Group
  }
  gridHeight = 550;
  textSearch$ = new Subject<string>();


  constructor(
    private charGrpService: CharacteristicGroupService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
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


  ngOnInit() {
    this.getAllCharacteristicGroups();

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

  getAllCharacteristicGroups() {
    this.resetGrid()
    this.subs.add(
      this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupID).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.charGroups = data.data;
            this.mySelection = data.data.filter(x => x.isSelected == true).map(x => x.characteristic_Group);
            this.gridView = process(this.charGroups, this.state);
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
    this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          const tempIsSelectedData = data.data.filter(x => x.isSelected == true);
          this.mySelection = tempIsSelectedData.map(x => x.characteristic_Group);

          if (event.target.checked) this.charGroups = tempIsSelectedData
          else this.charGroups = data.data;

          this.gridView = process(this.charGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }



  cellClickHandler({ columnIndex, dataItem }) {

  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.charGroups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.charGroups, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.charGroups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.charGroups.length
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
    this.gridView = process(this.charGroups, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'characteristic_Group',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'name',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'description',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'status',
            operator: 'contains',
            value: inputValue
          },
        ]
      }
    });
  }




  save() {
    if (this.mySelection.length == 0) {
      this.alertService.error("There is no change");
      return
    }

    this.subs.add(
      this.charGrpService.assigneCharacteristicGroups(this.mySelection, this.selectedGroup.groupID).subscribe(
        data => {
          if (data.isSuccess) this.alertService.success("Data saved successfully");
          else this.alertService.error(data.message);
        }, error => this.alertService.error(error)
      )
    )
  }

  
  close() {
    this.closeGroupAssetDetailEvent.emit(true)
  }



}
