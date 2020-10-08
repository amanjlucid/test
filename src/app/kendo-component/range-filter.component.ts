import { Component, Input, OnInit, OnDestroy, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SinglePopupService, PopupCloseEvent, BaseFilterCellComponent } from '@progress/kendo-angular-grid';


const closest = (node: any, predicate: any): any => {
    while (node && !predicate(node)) {
        node = node.parentNode;
    }

    return node;
};

@Component({
    selector: 'range-filter',
    template: `
        <div class="k-form">
            <label class="k-form-field">
                <span>From</span>
                <kendo-numerictextbox (ngModelChange)="onStartChange($event)" [(ngModel)]="start" [min]="0">
              </kendo-numerictextbox>
               
            </label>
            <label class="k-form-field">
                <span>To</span>
              
                <kendo-numerictextbox (ngModelChange)="onEndChange($event)" [(ngModel)]="end" [min]="0">
              </kendo-numerictextbox>
            </label>
        </div>
   `,
    styles: [`
        .k-form {
            padding: 5px;
        }
   `]
})
export class RangeFilterComponent extends BaseFilterCellComponent implements OnInit, OnDestroy {

    @Input() public filter: CompositeFilterDescriptor;
    @Input() public filterService: FilterService;
    @Input() public field: string;
    @Output() filterGrid = new EventEmitter<any>();

    public start: any;
    public end: any;

    public get min(): any {
        return this.start ? 0 : null;
    }

    public get max(): any {
        return this.end ? 0 : null;
    }

    public popupSettings: any = {
        popupClass: 'date-range-filter'
    };


    private popupSubscription: any;

    constructor(
        private element: ElementRef,
        private popupService: SinglePopupService,
        filterService: FilterService,
        private chRef: ChangeDetectorRef
    ) {
        super(filterService);
        // Handle the service onClose event and prevent the menu from closing when the datepickers are still active.
        this.popupSubscription = popupService.onClose.subscribe((e: PopupCloseEvent) => {
            if (document.activeElement && closest(document.activeElement,
                node => node === this.element.nativeElement || (String(node.className).indexOf('date-range-filter') >= 0))) {
                e.preventDefault();
            }
        });
    }

    public ngOnInit(): void {
        this.start = this.findValue('gte');
        this.end = this.findValue('lte');
        // setTimeout(() => {
        //     let filterBtn = $('.k-form').closest('range-filter').next('.k-action-buttons').find('.k-button.k-primary');
        //     $(filterBtn).text("Set Filter")

        // }, 200);
    }

    public ngOnDestroy(): void {
        this.popupSubscription.unsubscribe();
    }

    public onStartChange(value: any): void {
        this.filterRange(value, this.end);
    }

    public onEndChange(value: any): void {
        this.filterRange(this.start, value);
    }

    private findValue(operator) {
        const filter: any = this.filter.filters.filter((x: any) => x.field === this.field && x.operator === operator)[0];
        return filter ? filter.value : null;
    }

    private filterRange(start, end) {
        const filters = [];

        if (start && (!end || start < end || start == end)) {
            filters.push({
                field: this.field,
                operator: "gte",
                value: start
            });
            this.start = start;
        }

        if (end && (!start || start < end || start == end)) {
            filters.push({
                field: this.field,
                operator: "lte",
                value: end
            });
            this.end = end;
        }

        this.filterService.filter({
            logic: "and",
            filters: filters
        });





    }

    // inpChagne($event) {
    //     const target = $event.target
    //     let filterBtn = $(target).closest('range-filter').next('.k-action-buttons').find('.k-button.k-primary');
    //     $(filterBtn).text("Set Filter")
    //     //$(filterBtn).trigger("click")
    // }
}
