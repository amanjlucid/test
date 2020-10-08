import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[gridColor]'
})

export class KendoGridColor implements OnInit {

    @Input('gridColor') obj: any;

    constructor(private el: ElementRef) { }
    ngOnInit() {
        if (this.obj.status == "Active") {
            this.el.nativeElement.style.color = this.obj.colour;
        } else {
            this.el.nativeElement.style.color = 'gray';
        }
    }
}