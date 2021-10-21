import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, AttributeGroupService, SharedService } from '../../../_services'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
const cloneData = (data: any) => JSON.parse(JSON.stringify(data));

@Component({
  selector: 'app-attribute-group',
  templateUrl: './attribute-group.component.html',
  styleUrls: ['./attribute-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AttributeGroupComponent implements OnInit {
  subs = new SubSink();
  @Output() closeGroupAssetDetailEvent = new EventEmitter<boolean>();
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
  initialSelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return context.dataItem.aaG_Code
  }
  @Input() gridHeight = 550;
  textSearch$ = new Subject<string>();
  @Output() refreshSecurityGroup = new EventEmitter<boolean>();

  constructor(
    private attrGrpService: AttributeGroupService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedServie: SharedService,
  ) {
    this.setSelectableSettings();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.getAllAttributeGroups();

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

    this.subs.add(
      this.sharedServie.saveSecurityGroupAssetDetailObs.subscribe(data => {
        if (data) this.save()
      })
    )

  }

  getAllAttributeGroups() {
    this.attrGrpService.getAllAttributeGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.attrGroups = data.data;
          this.mySelection = data.data.filter(x => x.isSelected == true).map(x => x.aaG_Code);
          this.initialSelection = cloneData(this.mySelection);

          this.gridView = process(this.attrGroups, this.state);
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
          const tempIsSelectedData = data.data.filter(x => x.isSelected == true)
          this.mySelection = tempIsSelectedData.map(x => x.aaG_Code);
          this.initialSelection = cloneData(this.mySelection);

          if (event.target.checked) this.attrGroups = tempIsSelectedData
          else this.attrGroups = data.data;

          this.gridView = process(this.attrGroups, this.state);
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
    this.gridView = process(this.attrGroups, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'aaG_Code',
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


  callSaveSecurityGroupAssetDetailEvent() {
    this.sharedServie.emitSaveSecutiyGroupAssetDetail(true)
  }

  save() {
    // if (JSON.stringify(this.initialSelection) == JSON.stringify(this.mySelection)) {
    //   this.close()
    //   return
    // }

    this.subs.add(
      this.attrGrpService.assigneAttributeGroups(this.mySelection, this.selectedGroup.groupID).subscribe(
        data => {
          if (data.isSuccess) {
            // this.alertService.success("Data saved successfully");
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
