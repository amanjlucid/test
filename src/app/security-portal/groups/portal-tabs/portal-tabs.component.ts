import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, PortalGroupService } from '../../../_services'
import { PortalTabsModel } from '../../../_models'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
const cloneData = (data: any) => JSON.parse(JSON.stringify(data));

@Component({
  selector: 'app-portal-tabs',
  templateUrl: './portal-tabs.component.html',
  styleUrls: ['./portal-tabs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PortalTabsComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
  @Output() closeGroupAssetDetailEvent = new EventEmitter<boolean>();
  assetTabs: PortalTabsModel[];
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
  initialSelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return context.dataItem.portalTabId
  }
  booleanFilterDropDown = [{ valid: "A", val: "Active" }, { valid: "I", val: "Inactive" }];
  @Input() gridHeight = 550;
  textSearch$ = new Subject<string>();
  @Output() refreshSecurityGroup = new EventEmitter<boolean>();

  constructor(
    private portalGrpService: PortalGroupService,
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
    this.getAllPortaltabas()

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

  cellClickHandler({ columnIndex, dataItem }) {
  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.assetTabs, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.assetTabs, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.assetTabs.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.assetTabs.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }

  getAllPortaltabas() {
    this.portalGrpService.getAllPortaltabas(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.assetTabs = data.data;
          this.mySelection = data.data.filter(x => x.isSelected == true).map(x => x.portalTabId)
          this.initialSelection = cloneData(this.mySelection);

          this.gridView = process(this.assetTabs, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }

  includeOnlyGroup(event: any) {
    this.loading = true;
    this.portalGrpService.getAllPortaltabas(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          const tempIsSelectedData = data.data.filter(x => x.isSelected == true);
          this.mySelection = tempIsSelectedData.map(x => x.portalTabId);
          this.initialSelection = cloneData(this.mySelection);

          if (event.target.checked) this.assetTabs = tempIsSelectedData;
          else this.assetTabs = data.data;

          this.gridView = process(this.assetTabs, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }


  onFilter(inputValue: string): void {
    this.textSearch$.next(inputValue);
  }


  searchInAllFields(inputValue: any) {
    this.resetGrid()
    this.gridView = process(this.assetTabs, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'tabName',
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
    if (JSON.stringify(this.initialSelection) == JSON.stringify(this.mySelection)) {
      this.close()
      return
    }

    this.subs.add(
      this.portalGrpService.assignePortalTabGroups(this.mySelection, this.selectedGroup.groupID).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Data saved successfully");
            this.refreshSecurityGroup.emit(true)
          } else this.alertService.error(data.message);
        }, error => this.alertService.error(error)
      )
    )

  }


  close() {
    this.closeGroupAssetDetailEvent.emit(true)
  }



}
