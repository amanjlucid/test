import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[treeNodeColor]'
})

export class KendoTreeNodeColor implements OnInit {

    @Input('treeNodeColor') nodeObj: any;

    constructor(private el: ElementRef) { }
    ngOnInit() {
        if(this.nodeObj.elType == "ques"){
            if(this.nodeObj.hasquestiontype == "Info"){
                this.el.nativeElement.closest("li").style.color = "blue";  
            } else {
                this.el.nativeElement.closest("li").style.color = "red";  
            }
        }

        // if(this.nodeObj.elType == "group" && this.nodeObj.itemes == undefined){
        //     this.el.nativeElement.closest(".k-mid").style.marginLeft = "5px";
        // }
      
    }
}