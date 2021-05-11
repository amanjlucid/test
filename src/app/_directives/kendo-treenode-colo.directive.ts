import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[treeNodeColor]'
})

export class KendoTreeNodeColor implements OnInit {

    @Input('treeNodeColor') nodeObj: any;

    constructor(private el: ElementRef) { }
    ngOnInit() {
        if(this.nodeObj.elType == "ques")
        {
          if(this.nodeObj.hasquestionstatus == "A")
          {
            if(this.nodeObj.hasquestiontype == "Info"){
                this.el.nativeElement.closest("li").style.color = "blue";  
            } else {
                this.el.nativeElement.closest("li").style.color = "red";  
            }
        }
          else{
            this.el.nativeElement.closest("li").style.color = "lightgray";
          }
        }
        if(this.nodeObj.elType == "heading")
        {
          if(this.nodeObj.hasheadingstatus == "A")
          {
            this.el.nativeElement.style.color = this.nodeObj.color;
    }
          else{
            this.el.nativeElement.style.color = "lightgray";
          }
        }
        if(this.nodeObj.elType == "group")
        {
          if(this.nodeObj.hasgroupstatus == "A")
          {
            this.el.nativeElement.style.color = this.nodeObj.color;
          } else{
            this.el.nativeElement.style.color = "lightgray";
          }
        }
    }
}