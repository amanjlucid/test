import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ElementGroupModel } from '../../../_models'
import { AlertService, ElementGroupService } from '../../../_services'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-elements-group',
  templateUrl: './elements-group.component.html',
  styleUrls: ['./elements-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ElementsGroupComponent implements OnInit {
  subs = new SubSink();
  @Output() closeGroupAssetDetailEvent = new EventEmitter<boolean>();
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
  gridHeight = 550;
  textSearch$ = new Subject<string>();


  constructor(
    private elmGrpService: ElementGroupService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  ngOnInit() {
    this.getAllElementGroups()

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

  getAllElementGroups() {
    this.elmGrpService.getAllElementGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.elmGroups = data.data;
          this.mySelection = data.data.filter(x => x.isSelected == true).map(x => x.element_Code)
          this.gridView = process(this.elmGroups, this.state);
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
          const tempIsSelectedData = data.data.filter(x => x.isSelected == true);
          this.mySelection = tempIsSelectedData.map(x => x.element_Code)

          if (event.target.checked) this.elmGroups = tempIsSelectedData;
          else this.elmGroups = data.data;

          this.gridView = process(this.elmGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      })

  }





  onFilter(inputValue: string): void {
    this.textSearch$.next(inputValue);
  }


  searchInAllFields(inputValue: any) {
    this.resetGrid()
    this.gridView = process(this.elmGroups, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'element_Code',
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
      this.elmGrpService.assigneElementGroups(this.mySelection, this.selectedGroup.groupID).subscribe(
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
