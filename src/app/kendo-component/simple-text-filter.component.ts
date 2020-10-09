import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'simple-text-filter',
  template: `
  <div class="k-form">
    <label class="k-form-field">
        <input kendoTextBox [(ngModel)]="text" (ngModelChange)="onInput($event)" />
    </label>

  </div>
         
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
export class SimpleTextFilterComponent extends BaseFilterCellComponent {
  @Input() public filter: CompositeFilterDescriptor;
  @Input() public filterService: FilterService;
  @Input() public field: string;
  @Output() filterGrid = new EventEmitter<any>();
  subs = new SubSink();
  searchTerm$ = new Subject<string>();
  text: any;

  constructor(filterService: FilterService, private chRef: ChangeDetectorRef) {
    super(filterService);

  }


  ngOnInit() {
    this.text = this.findValue('eq');

    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(600),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {

          const filters = [];

          filters.push({
            field: this.field,
            operator: "eq",
            value: searchTerm
          });

          this.text = searchTerm;

          this.filterService.filter({
            logic: "and",
            filters: filters
          });


        })
    )
  }

  private findValue(operator) {
    const filter: any = this.filter.filters.filter((x: any) => x.field === this.field && x.operator === operator)[0];
    return filter ? filter.value : null;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public onInput(e: any) {
    this.searchTerm$.next(e);

  }


}
