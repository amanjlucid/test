import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, PropertySecurityGroupService } from '../../../_services'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-property-security',
  templateUrl: './property-security.component.html',
  styleUrls: ['./property-security.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class PropertySecurityComponent implements OnInit {
  subs = new SubSink();
  @Input() propertySecurityWindow: boolean = false
  @Input() selectedGroup: any;
  @Output() closePropSecWin = new EventEmitter<boolean>();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  title = ``;
  propSecGroups: any[];
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
  gridHeight = 600;
  textSearch$ = new Subject<string>();
  newPropsecurity = false;


  constructor(
    private propSecGrpService: PropertySecurityGroupService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  ngOnInit() {
    this.title = `Property Security for '${this.selectedGroup.group}'`
    this.getAllPropSecGroups();

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


  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }


  closePropSecWindow() {
    this.propertySecurityWindow = false;
    this.closePropSecWin.emit(this.propertySecurityWindow)
  }


  getAllPropSecGroups() {
    this.resetGrid()

    this.subs.add(
      this.propSecGrpService.getAllPropSecGroups(this.selectedGroup.groupID).subscribe(
        (data) => {
          if (data && data.isSuccess) {
            this.propSecGroups = data.data;
            this.gridView = process(this.propSecGroups, this.state);
            this.loading = false;
            this.chRef.detectChanges()
          } else this.alertService.error(data.message);
        }, (error) => this.alertService.error(error)
      )
    )
  }


  cellClickHandler({ columnIndex, dataItem }) {

  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.propSecGroups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.propSecGroups, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.propSecGroups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.propSecGroups.length
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
    this.gridView = process(this.propSecGroups, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'hierarchyTypeCode',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'assetId',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'assetAddress',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'accessArea',
            operator: 'contains',
            value: inputValue
          },
        ]
      }
    });
  }


  private deleteSecPropGrp(dataItem) {
    const { hierarchyTypeCode, assetId, accessArea } = dataItem;
    this.subs.add(
      this.propSecGrpService.deletePropertySecurity(this.selectedGroup.groupID, hierarchyTypeCode, assetId, accessArea).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.getAllPropSecGroups();
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )
  }

  openNewPropSecPopup() {
    $('.psWindowBlur').addClass('ovrlay');
    this.newPropsecurity = true;
  }

  closeNewPropertysecutiyEvent(eve) {
    this.newPropsecurity = false;
    $('.psWindowBlur').removeClass('ovrlay');
  }

  refreshPropertySecurity(event) {
    if (event) {
      this.getAllPropSecGroups();
    }
  }





}
