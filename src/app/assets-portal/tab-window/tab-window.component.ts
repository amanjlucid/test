import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { AssetAttributeService, SharedService } from '../../_services'


@Component({
  selector: 'app-tab-window',
  templateUrl: './tab-window.component.html',
  styleUrls: ['./tab-window.component.css']
})
export class TabWindowComponent implements OnInit {

  public windowState = 'default';//'maximized';
  @Input() tabWindow: boolean = false;
  @Input() tabName: string = "attributes";
  @Input() assetId: string;
  @Input() selectedAsset;
  @Output() closeWindow = new EventEmitter<boolean>();
  tabsData;
  currentUser;
  message:any;
  asbestosPortalAccess:any = [];
  moduleAccess: any;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private dataShareService: SharedService
  ) {

  }

  ngOnInit() {
    this.dataShareService.sharedAsset.subscribe();
    this.dataShareService.modulePermission.subscribe(data => {this.moduleAccess = data});
    this.dataShareService.changeSelectedAsset(this.selectedAsset);
    this.dataShareService.asbestosPortalAccess.subscribe(data => this.asbestosPortalAccess = data) // set in sitelayout component
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.assetAttributeService.getAssetTabsList(this.currentUser.userId).subscribe(
      tabData => {
        this.tabsData = tabData;
        //console.log(this.tabsData);
        if(this.tabsData != undefined && (this.tabsData != '' || this.tabsData == 'all')){
           
        }
      }
    )
  }


  public showTab(tabName) {
    this.tabName = tabName;
  }

  checkTabPermission(tab) {
    if (this.tabsData != undefined) {
      if (this.tabsData != "") {
        if (this.tabsData.includes('all') || this.tabsData.includes(tab)) {
          return true;
        }
      }
    }
    return false;
  }


  public closeTabWindow() {
    this.tabWindow = false;
    this.closeWindow.emit(this.tabWindow)
  }

  checkAsbestosPortalAccess() {
    const needles = ['Asbestos Details', 'Asbestos Portal Access'];
    const haystack = this.asbestosPortalAccess;
    for (var i = 0, len = needles.length; i < len; i++) {
      if ($.inArray(needles[i], haystack) == -1) return false;
    }
    return true;
  }

  checkGroupPermission(val: string): Boolean {
    if (this.moduleAccess != undefined) {
      return this.moduleAccess.includes(val);
    }
  }

  
}
