import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, AttributeGroupService } from '../../../_services'

@Component({
  selector: 'app-attribute-group',
  templateUrl: './attribute-group.component.html',
  styleUrls: ['./attribute-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AttributeGroupComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
  attrGroups;
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
    return context.dataItem.aaG_Code
  }
  booleanFilterDropDown = [{ valid: "A", val: "Active" }, { valid: "I", val: "Inactive" }];
  gridHeight = 700;


  constructor(
    private attrGrpService: AttributeGroupService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.getAllAttributeGroups();
  }

  getAllAttributeGroups() {
    this.attrGrpService.getAllAttributeGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.attrGroups = data.data;
          this.gridView = process(this.attrGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }


  cellClickHandler({ columnIndex, dataItem }) {
    // this.selectedChar = dataItem;
    // this.checkCanDelete(dataItem);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.attrGroups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.attrGroups, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.attrGroups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.attrGroups.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }


  includeOnlyGroup(event) {
    this.loading = true;
    this.attrGrpService.getAllAttributeGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          if (event.target.checked) {
            this.attrGroups = data.data.filter(x => x.isSelected == true)
          } else {
            this.attrGroups = data.data;
          }

          this.gridView = process(this.attrGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }

      })
  }

  assigneGroup(event: any, aaG_Code) {
    this.attrGrpService.assigneAttributeGroups(aaG_Code, this.selectedGroup.groupID).subscribe(
      data => {
        if (data.isSuccess == false) {
          this.alertService.error(data.message);
        }
      }, error => this.alertService.error(error)
    )
  }

}
