import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, CharacteristicGroupService } from '../../../_services'
import { CharateristicGroupModel } from '../../../_models'

@Component({
  selector: 'app-characteristic-group',
  templateUrl: './characteristic-group.component.html',
  styleUrls: ['./characteristic-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CharacteristicGroupComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
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
  booleanFilterDropDown = [{ valid: "A", val: "Active" }, { valid: "I", val: "Inactive" }];
  gridHeight = 700;


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
      checkboxOnly: false,
      mode: 'single'
    };
  }

  
  ngOnInit() {
    this.getAllCharacteristicGroups()
  }

  getAllCharacteristicGroups() {
    this.subs.add(
      this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupID).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.charGroups = data.data;
            this.gridView = process(this.charGroups, this.state);
            this.loading = false;
            this.chRef.detectChanges()
          }
        }
      )
    )
  }

  includeOnlyGroup(event: any) {
    this.loading = true;
    this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          if (event.target.checked) {
            this.charGroups = data.data.filter(x => x.isSelected == true)
          } else {
            this.charGroups = data.data;
          }

          this.gridView = process(this.charGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }

  assigneGroup(event: any, charGroupId) {
    // const isSelected = event.target.checked;
    this.charGrpService.assigneCharacteristicGroups(charGroupId, this.selectedGroup.groupID).subscribe(
      data => {
        if (data.isSuccess == false) {
          this.alertService.error(data.message);
        }
      }, error => this.alertService.error(error)
    );
  }

  cellClickHandler({ columnIndex, dataItem }) {
    // this.selectedChar = dataItem;
    // this.checkCanDelete(dataItem);
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

}
