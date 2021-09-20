import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CompositeFilterDescriptor, distinct, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { FilterService } from '@progress/kendo-angular-treelist';

@Component({
  selector: 'multicheck-treelist-filter',
  template: `
    <ul>
      <li *ngIf="showFilter">
        <input class="k-textbox" (input)="onInput($event)" />
      </li>
      <li #itemElement
        *ngFor="let item of currentData; let i = index; trackBy: trackByIndex"
        (click)="onSelectionChange(valueAccessor(item), itemElement)"
        [ngClass]="{'k-state-selected': isItemSelected(item)}">
        <input
          type="checkbox"
          id="chk-{{valueAccessor(item)}}"
          (focus)="onFocus(itemElement)"
          class="k-checkbox"
          [checked]="isItemSelected(item)" />
        <label
          class="k-multiselect-checkbox k-checkbox-label"
          for="chk-{{valueAccessor(item)}}">
            {{ textAccessor(item) }}
        </label>
      </li>
    </ul>
  `,
  styles: [`
    ul {
      list-style-type: none;
      height: 200px;
      overflow-y: scroll;
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
export class MultiCheckTreeListFilterComponent implements AfterViewInit {
  @Input() public isPrimitive: boolean;
  @Input() public currentFilter: CompositeFilterDescriptor;
  @Input() public data;
  @Input() public textField;
  @Input() public valueField;
  @Input() public filterService: FilterService;
  @Input() public field: string;
  @Output() public valueChange = new EventEmitter<number[]>();

  trackByIndex(index:number, el:any): number {
    return index;
  }

  public currentData: any;
  public showFilter = true;
  private value: any[] = [];

  protected textAccessor = (dataItem: any) => this.isPrimitive ? dataItem : dataItem[this.textField];
  protected valueAccessor = (dataItem: any) => this.isPrimitive ? dataItem : dataItem[this.valueField];

  public ngAfterViewInit() {
    this.currentData = this.data;
    this.value = this.currentFilter.filters.map((f: FilterDescriptor) => f.value);
    this.showFilter = typeof this.textAccessor(this.currentData[0]) === 'string';
  }

  public isItemSelected(item) {
    return this.value.some(x => x === this.valueAccessor(item));
  }

  public onSelectionChange(item, li) {
    if (this.value.some(x => x === item)) {
      this.value = this.value.filter(x => x !== item);
    } else {
      this.value.push(item);
    }

    this.filterService.filter({
      filters: this.value.map(value => ({
        field: this.field,
        operator: 'eq',
        value
      })),
      logic: 'or'
    });

    this.onFocus(li);
  }

  public onInput(e: any) {
    this.currentData = distinct([
      ...this.currentData.filter(dataItem => this.value.some(val => val === this.valueAccessor(dataItem))),
      ...filterBy(this.data, {
        operator: 'contains',
        field: this.textField,
        value: e.target.value
      })],
      this.textField
    );
  }

  public onFocus(li: any): void {
    const ul = li.parentNode;
    const below = ul.scrollTop + ul.offsetHeight < li.offsetTop + li.offsetHeight;
    const above = li.offsetTop < ul.scrollTop;

    // Scroll to focused checkbox
    if (below || above) {
      ul.scrollTop = li.offsetTop;
    }
  }
}
