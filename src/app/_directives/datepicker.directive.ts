import { Input, Output, EventEmitter, ViewChild, ElementRef, Directive, Renderer2, OnInit } from '@angular/core';
declare var jQuery: any;

@Directive({
    selector: '[mydatePicker]'
})

export class MyDatePicker implements OnInit {

    @Input('mydatePicker') value = '';
    @Input('mfs') mfs: boolean = false;
    @Input('odp') odp: boolean = false;
    @Output() dateChange = new EventEmitter();  

    constructor(public el: ElementRef, public renderer: Renderer2) { }

    ngOnInit() {
        // if (this.odp === true) {
        //     jQuery(this.el.nativeElement).datepicker({
        //         controlType: 'select',
        //         oneLine: true,
        //         minDate: this.mfs === false ? '' : new Date(),
        //         onSelect: (value) => {
        //             this.value = value;
        //             this.dateChange.next(value);
        //         }
        //     })
        //         .datepicker('setDate', this.value);
        // }
        // else {
        //     jQuery(this.el.nativeElement).datetimepicker({
        //         controlType: 'select',
        //         oneLine: true,
        //         timeFormat: 'hh: mm tt',
        //         minDate: this.mfs === false ? '' : new Date(),
        //         onSelect: (value) => {
        //             this.value = value;
        //             this.dateChange.next(value);
        //         }
        //     })
        //         .datepicker('setDate', this.value);
        // }
    }

}