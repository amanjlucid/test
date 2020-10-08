import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CompositeFilterDescriptor, distinct, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'text-filter',
  template: `
          <ul>
          <li>
            <input value="" class="k-textbox" (input)="onInput($event)" />
          </li>
          
        </ul>
    `,
  styles: [`
      ul {
        list-style-type: none;
        height: auto;
        overflow-y: auto;
        padding-left: 0;
        padding-right: 12px;
      }

      ul>li {
        padding: 8px 12px;
        border: 1px solid rgba(0,0,0,.08);
        border-bottom: none;
      }

      ul>li:last-of-type {
        border-bottom: 1px solid rgba(0,0,0,.08);
      }

      .k-multiselect-checkbox {
        pointer-events: none;
      }
    `]
})
export class TextFilterComponent extends BaseFilterCellComponent {
  public get selectedValue(): any {
    const filter = this.filterByField(this.valueField);
    return filter ? filter.value : null;
  }
  subs = new SubSink();
  @Input() public filterService: FilterService;
  @Input() public filter: CompositeFilterDescriptor;

  @Input() public textField: string;
  @Input() public valueField: string;
  searchTerm$ = new Subject<string>();
  @Output() filterGrid = new EventEmitter<any>();

  constructor(filterService: FilterService, private chRef: ChangeDetectorRef) {
    super(filterService);

  }


  public ngAfterViewInit() {

  }

  ngOnInit() {
    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(600),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {

          const filters = [];
          if (searchTerm == null) {
            this.removeFilter(this.valueField)  // remove the filter
          } else {
            filters.push({
              field: this.valueField,
              operator: 'eq',
              value: searchTerm
            });
          }

          const root = this.filter || {
            logic: "and",
            filters: []
          }

          if (filters.length) {
            root.filters.push(...filters);
          }

          //this.filterGrid.emit(root);
          //this.filterService.filter(root);





          //   this.filterService.filter({
          //     filters: this.value.map(value => ({
          //         field: this.field,
          //         operator: 'eq',
          //         value
          //     })),
          //     logic: 'or'
          // });





          // this.applyFilter(
          //   searchTerm === null ? // value of the default item
          //     this.removeFilter(this.valueField) : // remove the filter
          //     this.updateFilter({ // add a filter for the field with the value
          //       field: this.valueField,
          //       operator: 'eq',
          //       value: searchTerm
          //     })
          // );
          // this.chRef.detectChanges();
        })
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public onInput(e: any) {
    // this.currentData = distinct([
    //   ...this.currentData.filter(dataItem => this.value.some(val => val === this.valueAccessor(dataItem))),
    //   ...filterBy(this.data, {
    //     operator: 'contains',
    //     field: this.textField,
    //     value: e.target.value
    //   })],
    //   this.textField
    // );

    this.searchTerm$.next(e.target.value);

  }


}
