import { Component, ContentChild, EventEmitter, Input, Output, OnDestroy, Renderer2, TemplateRef } from '@angular/core';


@Component({
  selector: 'simple-context-menu',
  template: `
        <kendo-popup *ngIf="show" [offset]="offset">
            <ul class="menu">
            <ng-container *ngFor="let item of menuItems">
              <li (click)="menuItemSelected(item)">
                <ng-template *ngIf="menuItemTemplate" [ngTemplateOutlet]="menuItemTemplate"
                    [ngTemplateOutletContext]="{ item: item}">
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
export class SimpleContextMenuComponent implements OnDestroy {

  @ContentChild(TemplateRef)
  public menuItemTemplate: TemplateRef<any>;

  @Input()
  public menuItems: any[] = [];

  @Input() selectedDefinition: any;

  @Output()
  public select: EventEmitter<any> = new EventEmitter<any>();

  @Input() showSimpleContextMenu: boolean = false
  @Input() clickEvent: any;
  @Output() hideContextMenu = new EventEmitter<boolean>();

  public show: boolean;

  public offset: any;


  private documentClickSubscription: any;

  constructor(private renderer: Renderer2) {

  }

  ngOnInit() {

    if (this.showSimpleContextMenu != undefined) {
      if (this.showSimpleContextMenu) {
        this.show = true;
        this.offset = { left: this.clickEvent.pageX, top: this.clickEvent.pageY };
      }

      this.documentClickSubscription = this.renderer.listen('document', 'click', (e) => {
        this.showSimpleContextMenu = false
        this.show = false;
        this.hideContextMenu.emit(false);
      });
    }


  }

  public ngOnDestroy(): void {
    this.documentClickSubscription();
  }

  public menuItemSelected(item: any): void {
    this.select.emit({ item: item });
  }





}
