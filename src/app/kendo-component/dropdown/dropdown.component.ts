import { Component, Input, EventEmitter, OnInit, OnDestroy, ElementRef, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SinglePopupService, PopupCloseEvent, BaseFilterCellComponent } from '@progress/kendo-angular-grid';


@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class DropdownComponent extends BaseFilterCellComponent {

  public get selectedValue(): any {
    const filter = this.filterByField(this.valueField);
    return filter ? filter.value : null;
  }

  @Input() public filterService: FilterService;
  @Input() public filter: CompositeFilterDescriptor;
  @Input() public data: any[];
  @Input() public textField: string;
  @Input() public valueField: string;
  @Output() filterGrid = new EventEmitter<any>();

  public get defaultItem(): any {
    return {
      [this.textField]: 'Select item...',
      [this.valueField]: null
    };
  }

  constructor(filterService: FilterService, private chRef: ChangeDetectorRef) {
    super(filterService);

  }

  public onChange(value: string): void {
    this.applyFilter(
      value === null ? // value of the default item
        this.removeFilter(this.valueField) : // remove the filter
        this.updateFilter({ // add a filter for the field with the value
          field: this.valueField,
          operator: 'eq',
          value: value
        })
    ); // update the root filter

    // const filters = [];
    // if (value == null) {
    //   this.removeFilter(this.valueField)  // remove the filter
    // } else {
    //   filters.push({
    //     field: this.valueField,
    //     operator: 'eq',
    //     value: value
    //   });
    // }

    // const root = this.filter || {
    //   logic: "and",
    //   filters: []
    // }

    // if (filters.length) {
    //   root.filters.push(...filters);
    // }
    //console.log(root)
    //this.filterGrid.emit(root);
    // this.filterService.filter(root);


    this.chRef.detectChanges();
  }




}
