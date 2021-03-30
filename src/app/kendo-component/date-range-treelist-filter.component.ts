import { Component, Input, OnInit, OnDestroy, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
// import { FilterService, SinglePopupService, PopupCloseEvent } from '@progress/kendo-angular-grid';
import { BaseFilterCellComponent, FilterService, PopupCloseEvent, SinglePopupService } from "@progress/kendo-angular-treelist";
import { addDays } from '@progress/kendo-date-math';

const closest = (node: any, predicate: any): any => {
    while (node && !predicate(node)) {
        node = node.parentNode;
    }

    return node;
};

@Component({
    selector: 'date-range-treelist-filter',
    template: `
        <div class="k-form">
            <label class="k-form-field">
                <span>From Date</span>
                <kendo-datepicker (valueChange)="onStartChange($event)"
                    [(ngModel)]="start" [popupSettings]="popupSettings" [format]="'dd-MMM-yyyy'">
                </kendo-datepicker>
            </label>
            <label class="k-form-field">
                <span>To Date</span>
                <kendo-datepicker (valueChange)="onEndChange($event)"
                    [(ngModel)]="end" [popupSettings]="popupSettings" [format]="'dd-MMM-yyyy'" #dateModel="ngModel">
                </kendo-datepicker>
            </label>
        </div>
   `,
    styles: [`
        .k-form {
            padding: 5px;
        }
   `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeTreeListFilterComponent implements OnInit, OnDestroy {
    @Input() public filter: CompositeFilterDescriptor;
    @Input() public filterService: FilterService;
    @Input() public field: string;

    public start: any;
    public end: any;

    public get min(): any {
        return this.start ? addDays(this.start, 0) : null;
    }

    public get max(): any {
        return this.end ? addDays(this.end, 0) : null;
    }

    public popupSettings: any = {
        popupClass: 'date-range-filter'
    };

    private popupSubscription: any;

    constructor(
        private chRef: ChangeDetectorRef,
        private element: ElementRef,
        private popupService: SinglePopupService
    ) {

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
        // this.chRef.detectChanges();
        // setTimeout(() => {
        //     let filterBtn = $('.k-form').closest('date-range-filter').next('.k-action-buttons').find('.k-button.k-primary');
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

        if (start && (!end || start < end)) {
            filters.push({
                field: this.field,
                operator: "gte",
                value: start
            });
            this.start = start;
        }

        if (end && (!start || start < end)) {
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
    //     console.log($event)
    //     const target = $event.target
    //     let filterBtn = $(target).closest('range-filter').next('.k-action-buttons').find('.k-button.k-primary');
    //     $(filterBtn).text("Set Filter")
    //     //$(filterBtn).trigger("click")
    // }
}
