import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AssetAttributeService, SharedService, SettingsService } from '../../_services'
import { SubSink } from 'subsink';

@Component({
  selector: 'app-tab-window',
  templateUrl: './tab-window.component.html',
  styleUrls: ['./tab-window.component.css']
})
export class TabWindowComponent implements OnInit, OnDestroy {

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
  energyPortalAccess = [];
  modulesEnabled = [];
  menuList: any = [];
  subs = new SubSink(); // to unsubscribe services

  constructor(
    private assetAttributeService: AssetAttributeService,
    private dataShareService: SharedService,
    private settingService: SettingsService,
  ) {

  }

  ngOnInit() {
    this.getMenus();
    this.dataShareService.sharedAsset.subscribe();
    this.dataShareService.modulePermission.subscribe(data => {this.moduleAccess = data});
    this.dataShareService.realModulesEnabled.subscribe(data => { 
      this.modulesEnabled = data;
    });
    this.dataShareService.energyPortalAccess.subscribe(data => { 
      this.energyPortalAccess = data;
    });
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

  ngOnDestroy() {
    this.subs.unsubscribe();
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

  checkModuleEnabled(val: string): Boolean {
    if (this.modulesEnabled != undefined) {
      return this.modulesEnabled.includes(val);
    }
  }

    
  checkEnergyPortalAccess(val: string): Boolean {
    if (this.energyPortalAccess != undefined) {
    return this.energyPortalAccess.includes(val);
    }
  }

  checkMenuAccess(name: string, forAngular: number): Boolean {
    return this.menuList.some(x => x.menuName == name && x.linkType == forAngular && x.menuVisible == 1);
  }

  getMenus() {
    this.subs.add(
      this.settingService.getSilverLightMenu().subscribe(
        data => {
          if (data.isSuccess) {
            this.menuList = data.data;
          }
        }
      )
    )
  }
  
}
