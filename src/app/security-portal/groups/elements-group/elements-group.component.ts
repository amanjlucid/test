import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ElementGroupModel } from '../../../_models'
import { AlertService, ElementGroupService } from '../../../_services'

@Component({
  selector: 'app-elements-group',
  templateUrl: './elements-group.component.html',
  styleUrls: ['./elements-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class ElementsGroupComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
  elmGroups: ElementGroupModel[];
  actualElmGroups: ElementGroupModel[];
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
    return context.dataItem.element_Code
  }
  booleanFilterDropDown = [{ valid: "A", val: "Active" }, { valid: "I", val: "Inactive" }];
  gridHeight = 700;


  constructor(
    private elmGrpService: ElementGroupService,
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

  ngOnInit() {
    this.getAllElementGroups()
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getAllElementGroups() {
    this.elmGrpService.getAllElementGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.elmGroups = data.data;
          this.gridView = process(this.elmGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }


  cellClickHandler({ columnIndex, dataItem }) {
    // this.selectedGroup = dataItem;
  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.elmGroups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.elmGroups, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.elmGroups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.elmGroups.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }


  includeOnlyGroup(event: any) {
    this.loading = true;
    this.elmGrpService.getAllElementGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          if (event.target.checked) {
            this.elmGroups = data.data.filter(x => x.isSelected == true)
          } else {
            this.elmGroups = data.data;
          }
          this.gridView = process(this.elmGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      })

  }


  assigneGroup(event: any, elemCode) {
    // const isSelected = event.target.checked;
    this.elmGrpService.assigneElementGroups(elemCode, this.selectedGroup.groupID).subscribe(
      data => {
        if (data.isSuccess == false) {
          this.alertService.error(data.message);
        }
      }, error => this.alertService.error(error)
    );
  }


}
