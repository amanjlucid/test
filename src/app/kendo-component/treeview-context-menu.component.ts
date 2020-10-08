import { Component, ContentChild, EventEmitter, Input, Output, OnDestroy, Renderer2, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'treeview-context-menu',
  template: `
        <kendo-popup *ngIf="show" [offset]="offset" class="popUp">
            <ul class="menu">
            <ng-container *ngFor="let item of menuItems">
              <li (click)="menuItemSelected(item)" *ngIf="checkQuestionType(item)">
                <ng-template *ngIf="menuItemTemplate" [ngTemplateOutlet]="menuItemTemplate"
                    [ngTemplateOutletContext]="{ item: item, dataItem: dataItem }">
                </ng-template>
                <ng-container *ngIf="!menuItemTemplate">
                    {{ item }}
                </ng-container>
              </li>
            </ng-container>
            </ul>
        </kendo-popup>
    `,
  styles: [`
     .menu {
        list-style:none;
        margin: 0;
        padding: 0;
        cursor: pointer;
      }

      .popUp{
        z-index:10000;
      }

      .menu li {
        border-bottom: 1px solid rgba(0,0,0,.08);
        padding: 8px 12px;
        transition: background .2s, color .2s;
      }

      .menu li:last-child {
        border-bottom: 0;
      }

      .menu li:hover {
        background: #e8e8e8;
      }

      .menu li:active {
        background: #ff6358;
        color: #fff;
      }
    `]
})
export class TreeviewContextMenuComponent implements OnDestroy {

  @ContentChild(TemplateRef)
  public menuItemTemplate: TemplateRef<any>;

  @Input()
  public menuItems: any[] = [];

  @Input() selectedDefinition:any;

  @Output()
  public select: EventEmitter<any> = new EventEmitter<any>();

  @Input() public set for(treeview: any) {
    this.unsubscribe();
    this.cellClickSubscription = treeview.nodeClick.subscribe(this.onCellClick);
  }


  public show: boolean;
  public dataItem: any;
  public offset: any;

  private cellClickSubscription: Subscription;
  private documentClickSubscription: any;

  constructor(private renderer: Renderer2) {
    this.onCellClick = this.onCellClick.bind(this);
    this.documentClickSubscription = this.renderer.listen('document', 'click', () => {
      this.show = false;
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
    this.documentClickSubscription();
  }

  public menuItemSelected(item: any): void {
    this.select.emit({ item: item, dataItem: this.dataItem });
  }

  private onCellClick({ item, type, originalEvent }): void {
    if (type === 'contextmenu') {
      originalEvent.preventDefault();
      this.dataItem = item.dataItem;
      this.show = true;
      this.offset = { left: originalEvent.pageX, top: originalEvent.pageY };
     // console.log(this.offset);
    }
  }

  private unsubscribe(): void {
    if (this.cellClickSubscription) {
      this.cellClickSubscription.unsubscribe();
      this.cellClickSubscription = null;
    }
  }

  checkQuestionType(item:string){
    if(this.dataItem.hasOwnProperty('hasquestiontype')){
      if((this.dataItem.hasquestiontype == "Info" && item == "Edit Template Issues") || (this.dataItem.hasquestiontype == "Info" && item == "Edit Template Actions") || (this.dataItem.hasquestiontype == "Info" && item == "Edit Scoring Rules" && this.dataItem.hasinfodatatype != 'I') || (item == "Edit Scoring Rules" && this.selectedDefinition.hasscoring != 1)){
        return false;
      }
    }
    return true;
  }

}
