import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { $ } from 'protractor';

@Directive({
    selector: '[kzindex]'
})

export class KendoZindex implements OnInit {

    @Input('kzindex') editWindow: boolean;

    constructor(private el: ElementRef) { }
    ngOnInit() {
        if (this.editWindow) {
            this.el.nativeElement.style.zIndex = "20000";
        } else {
            this.el.nativeElement.style.zIndex = "10004";
        }
    }
}