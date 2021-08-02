import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { AlertService, LoaderService, PropertySecurityGroupService, AssetAttributeService, AuthenticationService, HelperService, SharedService, ServicePortalService, SettingsService } from '../../_services';
import { AssetListModel } from '../../_models'
import { Router, ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { QueryList } from '@angular/core';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';


declare var $: any;

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit, OnDestroy, AfterViewInit {
  myDateValue: Date;
  currentUser;
  printHiearchy: any;
  hiearchyTypeLists: any;
  portals: any;
  selectedHiearchyType: any;
  hierarchyLevels: any;
  selectedhierarchyLevel: any;
  hiearchyWindow = false;
  tabWindow = false;
  tabName: string;
  assetTypes: any;
  attributeLists: any = [];
  scrollLoad = true;
  assetId: string;
  selectedAsset;
  assetList: AssetListModel = {
    'PageSize': 250,
    'CurrentPage': 0,
    'UserId': '',
    'IsAdmin': false,
    'HierarchyTypeCode': '',
    'OwnerAssetId': '',
    'AssetId': '',
    'AssetType': '',
    'AssetCode': '',
    'AssetStatus': 'A',
    'Address': '',
    'OrderBy': 'ASSID',
    'OrderType': 'Ascending',//Ascending, Descending
    'Portal': 'AssetPortal',
    'PostCode': '',
    'AsbestosStatus': '',
    'Auth': false,
    'ShowAsbestos': false,
    'ServiceAssetId': '',
    'ShowService': false,
    'Setcode': '',
    'Concode': '',
    'Secocode': '',
    'Sescode': '',
    'SimCompliance': '',
    'StartDate': '',
    'EndDate': '',
    'EPCOnly': false,
    'SAPBands': '',
    'EPCStatus': '',
    'TaskAsset': false,
    'TaskAssets': []
  }
  visitedHierarchy: any[] = [];
  totalAssetCount: number = 0;
  touchtime = 0;
  assetFilterId: string;
  assetFilterAddress: string;
  @Input() validationObj: any;
  subs = new SubSink(); // to unsubscribe services
  tabsData: any;
  ctrBtnPressed = false;
  selectedAssestsExport: any[] = [];
  startDate: any = new Date();
  authOs: boolean = false;
  individualAssetReport: boolean = false;
  asbestosPortalAccess: any = [];
  energyPortalAccess = [];
  asbestosPropertySecurityAccess: any;
  asbestosColumn: boolean = false;
  moduleAccess: any;
  modulesEnabled = [];
  checkServicePortalRef: boolean = false;
  serviceColumn: boolean = false;
  serviceTypes: any;
  assetFilterObj: any;
  epcOnly: boolean = false;
  epcView: boolean = false;
  retrieveWindow: boolean = false;
  epcStatus: string = "";
  filterEPCStatus: string = "";
  // @ViewChild('sapMultiSelect', { static: true }) public sapMultiSelect: any;
  public sapBands: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Pending', 'No Rating'];
  public selectedSAPBands;
  // @ViewChild('multiselect') sapMultiSelect;
  @ViewChildren(MultiSelectComponent) childrenComponent: QueryList<MultiSelectComponent>;
  // @ViewChild('multiselect', { static: true }) public multiselect: any;
  sapMultiSelect: any;
  MultiSelectDetected: boolean = false;
  EPCFilter: boolean = false;
  AssetFilter: boolean = false;
  AsbestosFilter: boolean = false;
  ServicingFilter: boolean = false;
  TaskFilter: boolean = false;
  energyDashboardFilter:boolean = false;


  menuList: any = [];



  categories: any;
  userCategory: any;
  mulitSelectDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: true,
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 157,
    itemsShowLimit: 10,
    searchPlaceholderText: '',
    noDataAvailablePlaceholderText: 'No Record',
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false
  }
  categoryDropdownSettings = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',
    allowSearchFilter: true,
    clearSearchFilter: true,
    maxHeight: 157,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false
  }
  selectedCategories: any = [];
  selectedCategory: any = [];
  /*  sapBands = [
     {"item_id": "A","item_text": "A"},
     {"item_id": "B","item_text": "B"},
     {"item_id": "C","item_text": "C"},
     {"item_id": "D","item_text": "D"},
     {"item_id": "E","item_text": "E"},
     {"item_id": "F","item_text": "F"},
     {"item_id": "G","item_text": "G"},
   ]; */

  // topping:string;
  postCodeSearch$ = new Subject<any>();






  constructor(
    private propSecGrpService: PropertySecurityGroupService,
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private autService: AuthenticationService,
    private helper: HelperService,
    private sharedService: SharedService,
    private authService: AuthenticationService,
    private servicePortalService: ServicePortalService,
    private chRef: ChangeDetectorRef,
    private settingService: SettingsService,
  ) { }

  ngAfterViewInit() {
    this.childrenComponent.changes.subscribe((comps: QueryList<MultiSelectComponent>) => {
      if (!this.MultiSelectDetected) {
        comps.forEach((element) => {
          if (element.placeholder == "    Select SAP Bands") {
            this.sapMultiSelect = element;
            this.MultiSelectDetected = true;
          }
        });
      }

    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.getMenus();
    setTimeout(() => {
      var ss = this.sapMultiSelect;
    }, 0);
    var ss = this.sapMultiSelect;
    this.loaderService.pageShow();
    this.getSystemDefaultDate();
    this.subs.add(this.sharedService.modulePermission.subscribe(data => {
      this.moduleAccess = data;
    }));
    this.subs.add(this.sharedService.realModulesEnabled.subscribe(data => {
      this.modulesEnabled = data;
    }));
    this.subs.add(this.sharedService.asbestosPortalAccess.subscribe(data => {
      this.asbestosPortalAccess = data;
    })) // set in sitelayout component
    // this.sharedService.asbestosPropertyAccess.subscribe(data => this.asbestosPropertySecurityAccess = data );
    this.subs.add(this.sharedService.energyPortalAccess.subscribe(data => {
      this.energyPortalAccess = data;
    }))
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.assetList.UserId = this.currentUser.userId;
    this.assetList.IsAdmin = (this.currentUser.admin == "Y") ? true : false;
    this.getAssetTypes();

    if (this.validationObj != undefined) {
      this.openLinkTabs(this.validationObj);
    } else {
      this.route.queryParams.subscribe(params => {
        const assetid = params['assetid'];
        const servicePortal = params['servicing'];
        const taskData = params['taskData'];
        const energyData = params['energyData'];
        const sapBand = params['sapBand'];
        const epcStatus = params['epcStatus'];
        const openTab = params['openTab'];
        const asbestos = params['asbestos'];
        if (assetid != undefined) {
          this.autService.validateAssetIDDeepLinkParameters(this.currentUser.userId, assetid).subscribe(
            data => {
              if (data.validated) {
                if (asbestos && asbestos == "Y") {
                  this.openAsbestosTabs(data);
                } else {
                  if (openTab != undefined) {
                    this.openTabFromUrl(data, openTab);
                  } else {
                this.openLinkTabs(data);
                  }
                }

              } else {
                this.assetList.AssetId = this.assetFilterId = assetid;
                const errMsg = `${data.errorCode} : ${data.errorMessage}`
                this.alertService.error(errMsg);
              }
            }
          )
        } else if (taskData != undefined && taskData == "true") {
          this.TaskFilter = true;
          let encodedTasksAssets = localStorage.getItem("assetList");
          if (encodedTasksAssets != null) {
            let assetIdstring = atob(encodedTasksAssets);//Decode tasks assets
            this.assetList.TaskAsset = true;
            this.assetList.TaskAssets = assetIdstring.split(',');
          }
          this.getAllAssets(this.assetList);
        } else if (energyData != undefined && energyData == "true") {
          this.energyDashboardFilter= true;
          let encodedTasksAssets = localStorage.getItem("assetList");
          if (encodedTasksAssets != null) {
            let assetIdstring = atob(encodedTasksAssets);//Decode tasks assets
            this.assetList.TaskAsset = true;
            this.assetList.TaskAssets = assetIdstring.split(',');
          }

          this.getAllAssets(this.assetList);
        } else if (servicePortal != undefined && servicePortal == "true") {
          this.subs.add(
            this.authService.checkModulePermission(this.currentUser.userId).subscribe(data => {
              if (data.includes('Servicing Portal Access')) {
                this.assetAttributeService.getAssetTabsList(this.currentUser.userId).subscribe(
                  tabData => {
                    if ((tabData.includes('all') || tabData.includes('Servicing')) && localStorage.getItem("assetFilterObj") != null) {
                      this.checkServicePortalRef = this.serviceColumn = this.assetList.ShowService = true;
                      this.assetFilterObj = JSON.parse(localStorage.getItem('assetFilterObj'));
                      this.assetList.Setcode = this.assetFilterObj.setCode;
                      this.assetList.Concode = this.assetFilterObj.conCode;
                      this.assetList.Secocode = this.assetFilterObj.secoCode;
                      this.assetList.Sescode = this.assetFilterObj.sesCode;
                      this.assetList.StartDate = this.assetFilterObj.startDate;
                      this.assetList.EndDate = this.assetFilterObj.endDate;
                      this.getAllAssets(this.assetList); // change method name after complete
                      //console.log(this.assetList);
                    } else {
                      this.checkServicePortalRef = this.serviceColumn = this.assetList.ShowService = false;
                      this.getAllAssets(this.assetList);
                    }
                  }
                )
              } else {
                this.checkServicePortalRef = this.serviceColumn = this.assetList.ShowService = false;
                this.getAllAssets(this.assetList);
              }
            }));
        } else if (sapBand != undefined && this.sapBands.some(x => x === sapBand)) {
          this.epcView = true;
          this.assetList.SAPBands = "'" + sapBand + "'";
          var stringarray: string[] = [];
          stringarray.push(sapBand);
          this.selectedSAPBands = stringarray;
          this.getAllAssets(this.assetList);
        } else if (epcStatus != undefined && epcStatus != "") {
          this.epcView = true;

          this.filterEPCStatus = epcStatus;
          this.assetList.EPCStatus = this.filterEPCStatus;
          this.getAllAssets(this.assetList);
        }
        else {
          this.assetFilterObj = undefined;
          this.assetList.SimCompliance = '';
          this.assetList.Sescode = '';
          this.assetList.Concode = '';
          this.assetList.Secocode = '';
          this.assetList.Setcode = '';
          this.getAllAssets(this.assetList);
        }
      });

    }


    this.subs.add(
      this.postCodeSearch$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((val) => {
          this.filterAssetTable(val, 'PostCode');
        })
    );

  }

  onStartDateChange(date) {
    this.myDateValue = new Date();
    this.startDate = date;
    this.startDate = new Date(this.startDate).toISOString();
  }

  onDateChange(newDate: Date) {
    //console.log(newDate);
  }

  openTabFromUrl(validationObj, openTab) {
    this.assetFilterId = validationObj.assid;
    this.assetFilterAddress = validationObj.astconcataddress;
    this.assetList.AssetId = this.assetFilterId;
    this.assetList.Address = this.assetFilterAddress;
    this.attributeLists = [];
    this.assetAttributeService.getAllAssets(this.assetList).subscribe(
      data => {
        // console.log(data);
        if (data && data.isSuccess) {
          this.attributeLists = data.data;
          if (this.attributeLists != undefined && this.attributeLists.length == 1) {
            switch (openTab) {
              case 'Asbestos':
                this.tabName = "asbestos";
                break;
              case 'Attributes':
                this.tabName = "attributes";
                break;
              case 'Characteristics':
                this.tabName = "characteristics";
                break;
              case 'Energy':
                this.tabName = "energy";
                break;
              case 'EPC':
                this.tabName = "epc";
                break;
              case 'Health and Safety':
                this.tabName = "assessments";
                break;
              case 'HHSRS':
                this.tabName = "hhrs";
                break;
              case 'Notepad':
                this.tabName = "notepad";
              case 'Quality':
                this.tabName = "quality";
              case 'Servicing':
                this.tabName = "servicing";
              case 'Surveys':
                this.tabName = "surveys";
              case 'Works Management':
                this.tabName = "workmanagement";
            }
          } else {
            alert('Please select one record');
          }
          const selectedAttribute = this.attributeLists[0];
          this.loaderService.pageHide();
          this.openTabWindow(this.tabName, selectedAttribute);
        }
      },
      error => {
        this.loaderService.hide();
        this.loaderService.pageHide();
        //this.alertService.error(error);
      }
    )
  }

  openLinkTabs(validationObj) {
    this.assetFilterId = validationObj.assid;
    this.assetFilterAddress = validationObj.astconcataddress;
    this.assetList.AssetId = this.assetFilterId;
    this.assetList.Address = this.assetFilterAddress;
    this.assetList.AssetStatus = ''
    this.attributeLists = [];
    this.assetAttributeService.getAllAssets(this.assetList).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.attributeLists = data.data;
          if (this.attributeLists != undefined && this.attributeLists.length == 1) {
            switch (this.attributeLists.fistTab) {
              case 'Asbestos':
                this.tabName = "asbestos";
                break;
              case 'Attributes':
                this.tabName = "attributes";
                break;
              case 'Characteristics':
                this.tabName = "characteristics";
                break;
              case 'Energy':
                this.tabName = "energy";
                break;
              case 'EPC':
                this.tabName = "epc";
                break;
              case 'Health and Safety':
                this.tabName = "assessments";
                break;
              case 'HHSRS':
                this.tabName = "hhrs";
                break;
              case 'Notepad':
                this.tabName = "notepad";
              case 'Quality':
                this.tabName = "quality";
              case 'Servicing':
                this.tabName = "servicing";
              case 'Surveys':
                this.tabName = "surveys";
              case 'Works Management':
                this.tabName = "workmanagement";
            }
          } else {
            alert('Please select one record');
          }
          const selectedAttribute = this.attributeLists[0];

          if (!this.tabName) {
            this.assetAttributeService.getAssetTabsList(this.currentUser.userId).subscribe(
              tabData => {
                this.tabsData = tabData;

                let tabs = ['Attributes', 'Characteristics', 'Asbestos', 'Energy', 'EPC', 'Surveys', 'Health and Safety', 'Servicing', 'HHSRS', 'Works Management', 'Quality', 'Notepad'];
                for (let tab of tabs) {
                  if (this.tabsData.includes(tab)) {
                    switch (tab) {
                      case 'Asbestos':
                        this.tabName = "asbestos";
                        break;
                      case 'Attributes':
                        this.tabName = "attributes";
                        break;
                      case 'Characteristics':
                        this.tabName = "characteristics";
                        break;
                      case 'Energy':
                        this.tabName = "energy";
                        break;
                      case 'EPC':
                        this.tabName = "epc";
                        break;
                      case 'Health and Safety':
                        this.tabName = "assessments";
                        break;
                      case 'HHSRS':
                        this.tabName = "hhrs";
                        break;
                      case 'Notepad':
                        this.tabName = "notepad";
                      case 'Quality':
                        this.tabName = "quality";
                      case 'Servicing':
                        this.tabName = "servicing";
                      case 'Surveys':
                        this.tabName = "surveys";
                      case 'Works Management':
                        this.tabName = "workmanagement";
                    }
                  }
                  if (this.tabName) {
                    break;
                  }
                }
              });
          }

          this.openTabWindow(this.tabName, selectedAttribute);
        }
      },
      error => {
        this.loaderService.hide();
        this.loaderService.pageHide();
        //this.alertService.error(error);
      }
    )
  }

  openAsbestosTabs(validationObj) {
    this.assetFilterId = validationObj.assid;
    this.assetFilterAddress = validationObj.astconcataddress;
    this.assetList.AssetId = this.assetFilterId;
    this.assetList.Address = this.assetFilterAddress;
    this.assetList.AssetStatus = ''
    this.attributeLists = [];
    this.assetAttributeService.getAllAssets(this.assetList).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.attributeLists = data.data;
          if (this.attributeLists != undefined && this.attributeLists.length == 1) {
            this.tabName = "asbestos";
            const selectedAttribute = this.attributeLists[0];
            this.openTabWindow(this.tabName, selectedAttribute);
          } else {
            this.alertService.error("Asset is unavailable.");
          }
          this.loaderService.hide();
          this.loaderService.pageHide();
        }
      },
      error => {
        this.loaderService.hide();
        this.loaderService.pageHide();
        this.alertService.error(error);
      }
    )
  }


  onScroll(event) {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const offsetHeight = event.target.offsetHeight;
    let scrollPosition = scrollTop + offsetHeight + 20;
    const scrollTreshold = scrollHeight;
    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

    if (isIEOrEdge) {
      scrollPosition = scrollPosition + 20;
    }

    if (scrollPosition > scrollTreshold && this.scrollLoad) {
      this.scrollLoad = false;
      this.assetList.CurrentPage = this.assetList.CurrentPage + 1;
      this.assetAttributeService.getAllAssets(this.assetList).subscribe(
        data => {
          if (data && data.isSuccess) {
            if (data.data.length != undefined && data.data.length > 0) {
              this.scrollLoad = true;
              let tempData = data.data;
              this.attributeLists = this.attributeLists.concat(tempData);
              this.attributeLists.map(item => item.assetId)
                .filter((value, index, self) => self.indexOf(value.assetId) === index);
            }
          }
        },
        error => {
          this.loaderService.hide();
        }
      )
    }

  }

  selectBackGround(parent, asset) {
    if (this.selectedAssestsExport.find(x => x.assetId == asset.assetId) != undefined) {
      this.selectedAssestsExport = this.selectedAssestsExport.filter(x => x.assetId != asset.assetId);
      parent.style.backgroundColor = '';
      console.log('in')
    } else {
      console.log('out')
      parent.style.backgroundColor = '#cacaca';
      this.selectedAssestsExport.push(asset);
    }

  }

  removeBack(parent, asset) {
    this.selectedAssestsExport = [];
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.style.backgroundColor = '';
    });
    parent.style.backgroundColor = '#cacaca';
    this.selectedAssestsExport.push(asset);
    //his.helper.setExportAsset(this.selectedAssestsExport);
  }

  toggleClass(event: any, asset) {
    this.sharedService.changeSelectedAsset(asset);
    this.selectedAsset = asset
    const target = event.target;
    let parent = target.parentNode;

    if (event.target.tagName != "A") {
      if (event.target.tagName == "I") {
        parent = target.parentNode.parentNode.parentNode;
      }
      if (parent.tagName == "TR") {
        if (event.ctrlKey) {
          this.selectBackGround(parent, asset);
        } else {
          this.removeBack(parent, asset);
        }

        if ((this.tabsData != undefined && this.tabsData != '') || this.tabsData == 'all') {
          this.assetId = asset.assetId;
          if (this.touchtime == 0) {
            this.touchtime = new Date().getTime();
          } else {
            if (((new Date().getTime()) - this.touchtime) < 200) {
              if (this.tabsData == 'all') {
                if (this.checkServicePortalRef) {
                  this.openTabWindow('servicing', asset);
                } else {
                  this.openTabWindow('attributes', asset);
                }
              } else {
                let tabs = ['Attributes', 'Characteristics', 'Asbestos', 'Energy', 'EPC', 'Surveys', 'Health and Safety', 'Servicing', 'HHSRS', 'Works Management', 'Quality', 'Notepad'];
                for (let tab of tabs) {
                  let tabName;
                  if (this.tabsData.includes(tab) && !this.checkServicePortalRef) {
                    switch (tab) {
                      case "Health and Safety":
                        tabName = "assessments";
                        break;
                      case "HHSRS":
                        tabName = "hhrs";
                        break;
                      case "Works Management":
                        tabName = "workmanagement";
                        break;
                      default:
                        tabName = tab;
                    }
                    this.openTabWindow(tabName.toLowerCase(), asset);
                    break;
                  } else if (this.tabsData.includes(tab) && this.checkServicePortalRef) {
                    // if user comes from service portal
                    this.openTabWindow('servicing', asset);
                  }
                }
              }
              this.touchtime = 0;
            } else {
              this.touchtime = new Date().getTime();
            }
          }
        }

      }
    }


  }

  getAssetTypes() {
    this.assetAttributeService.getAssetTypes().subscribe(
      data => {
        this.subs.add(
          this.assetAttributeService.getAssetTabsList(this.currentUser.userId).subscribe(
            tabData => {
              this.tabsData = tabData;
            }
          )
        )
        if (data && data.isSuccess) {
          this.assetTypes = data.data;
        }
      },
      error => {
        this.loaderService.hide();
        //this.alertService.error(error);
      }
    )
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

  checkAsbestosPortalAccess() {
    const needles = ['Asbestos Details', 'Asbestos Portal Access'];
    const haystack = this.asbestosPortalAccess;
    for (var i = 0, len = needles.length; i < len; i++) {
      if ($.inArray(needles[i], haystack) == -1) return false;
    }
    return true;
  }


  checkEnergyPortalAccess(val: string): Boolean {
    if (this.energyPortalAccess != undefined) {
      var ss = this.energyPortalAccess.includes(val);
      return this.energyPortalAccess.includes(val);
    }
  }

  getAllAssets(assetList: AssetListModel) {

    if (!this.serviceColumn && this.assetList.Sescode == '' && this.assetList.Concode == '' && this.assetList.Secocode == '' && this.assetList.Setcode == '' && this.assetList.SimCompliance == '') {
      this.ServicingFilter = false;
    }
    else { this.ServicingFilter = true; }

    if (!this.asbestosColumn && this.assetList.AsbestosStatus == '' && !this.assetList.Auth) {
      this.AsbestosFilter = false;
    }
    else { this.AsbestosFilter = true; }

    if (this.assetList.PostCode == '' && this.assetList.AssetStatus == 'A') {
      this.AssetFilter = false;
    }
    else { this.AssetFilter = true; }

    if (!this.assetList.EPCOnly && !this.epcView && this.assetList.SAPBands == '' && this.assetList.EPCStatus == '') {
      this.EPCFilter = false;
    }
    else { this.EPCFilter = true; }


    this.attributeLists = [];
    this.assetAttributeService.getAssetCount(assetList).subscribe(
      datacount => {
        //this.loaderService.show();
        if (datacount && datacount != "") {
          this.totalAssetCount = datacount;
        } else {
          this.totalAssetCount = datacount;
        }
        this.assetAttributeService.getAllAssets(assetList).subscribe(
          data => {
            // console.log(data);
            // debugger;
            if (data && data.isSuccess) {
              this.scrollLoad = true;
              let tempData = data.data;
              this.attributeLists = tempData;
              this.checkRendartable();
              //console.log(assetList);
              // tempData.map(v => {
              //   v.status = (v.status == 'A' || v.status == 'Active') ? 'Active' : 'Inactive';
              // });
              // this.attributeLists = tempData;
              //console.log(tempData);
            }
            this.loaderService.pageHide();
          },
          error => {
            this.loaderService.hide();
            this.loaderService.pageHide();
            //this.alertService.error(error);
          }
        )
      }
    )

  }

  filterAssetType(filter) {
    this.assetList.AssetType = filter;
    this.resetAssetList();
    this.loaderService.show();
    this.getAllAssets(this.assetList);

  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.filterAssetGrid(false);
    }
  }

  filterAssetGrid(fromHierarchy) {
    this.resetAssetList();
    if (fromHierarchy == false) {
      if (this.assetFilterId != undefined) {
        this.assetList.AssetId = this.assetFilterId;
      }
      if (this.assetFilterAddress != undefined) {
        this.assetList.Address = this.assetFilterAddress;
      }

      this.getAllAssets(this.assetList);
    }
  }

  triggerPostcodeSearch(value) {
    this.postCodeSearch$.next(value);
  }

  filterAssetTable(value, column) {
    this.resetAssetList();
    if (column == 'AsbestosStatus') {
      this.assetList.AsbestosStatus = value;
    } else if (column == 'PostCode') {
      if (value.length >= 3) {
        this.assetList.PostCode = value;
      } else if (value.length < 3) {
        this.assetList.PostCode = '';
        // return false;
      }
    } else if (column == 'AssetStatus') {
      this.assetList.AssetStatus = value;
    } else if (column == 'os') {
      this.authOs = (value == 'false') ? true : false;
      this.assetList.Auth = this.authOs;
    } else if (column == 'Asbestos') {
      this.asbestosColumn = (value == 'false') ? true : false;
      this.assetList.ShowAsbestos = this.asbestosColumn;
    } else if (column == 'Service') {
      this.serviceColumn = (value == 'false') ? true : false;
      if (!this.serviceColumn) {
        this.assetList.SimCompliance = '';
        this.assetList.Sescode = this.assetList.Secocode = this.assetList.Concode = this.assetList.Setcode = '';
      }
      this.assetList.ShowService = this.serviceColumn;
      //this.assetList.Setcode = this.serviceColumn ? localStorage.getItem('setcode') : '';
    } else if (column == 'Service Type') {
      this.assetList.Sescode = this.assetList.Secocode = this.assetList.Concode = '';
    } else if (column == 'Service Compliance') {
      //this.assetList.SimCompliance = value;
      //console.log(this.assetList);
    } else if (column == 'epc') {
      this.assetList.EPCOnly = value;
    } else if (column == 'epcView') {
      this.epcView = value;
    } else if (column == 'sapBands') {
      if (this.selectedSAPBands.length == 0) {
        this.assetList.SAPBands = ""
      }
      else {
        this.assetList.SAPBands = "'" + this.selectedSAPBands.join("','") + "'";
      }
    } else if (column == 'EPCStatus') {
      this.filterEPCStatus = value;
      this.assetList.EPCStatus = this.filterEPCStatus;
    }

    this.getAllAssets(this.assetList);
  }

  getTableWidth() {
    if (this.asbestosColumn && !this.serviceColumn && !this.epcView) {
      return '132%';
    } else if (!this.asbestosColumn && this.serviceColumn && !this.epcView) {
      return '155%';
    } else if (this.asbestosColumn && this.serviceColumn && !this.epcView) {
      return '210%';
    } else if (this.asbestosColumn && this.serviceColumn && this.epcView) {
      return '280%';
    } else if (!this.asbestosColumn && !this.serviceColumn && this.epcView) {
      return '155%';
    } else if (!this.asbestosColumn && this.serviceColumn && this.epcView) {
      return '210%';
    } else if (this.asbestosColumn && !this.serviceColumn && this.epcView) {
      return '210%';
    } else {
      return '100%';
    }
  }

  clearAssetTable() {
    $("#assetSearch").trigger("reset");
    this.scrollLoad = true;
    this.serviceColumn = this.assetList.ShowService = this.assetList.ShowAsbestos = this.authOs = false;
    this.assetList.Sescode = '';
    this.assetList.Concode = '';
    this.assetList.Secocode = '';
    this.assetList.Setcode = '';
    this.assetList.SimCompliance = '';
    this.asbestosColumn = false;
    this.assetList.AsbestosStatus = '';
    this.assetList.PostCode = '';
    this.assetList.AssetStatus = 'A';
    this.assetList.Auth = false;
    this.assetList.EPCOnly = false;
    this.assetList.SAPBands = '';
    this.assetList.EPCStatus = '';
    this.assetList.TaskAsset = false;
    this.assetList.TaskAssets = [];
    this.resetAssetList();
    this.epcOnly = false;
    this.epcView = false;
    this.selectedSAPBands = '';
    this.filterEPCStatus = "";

    if (this.sapMultiSelect != undefined) {
      this.sapMultiSelect.reset();
    }

    this.energyDashboardFilter = false;
    this.getAllAssets(this.assetList);
  }

  orderBy(orderBy) {
    if (orderBy == this.assetList.OrderBy && this.assetList.OrderType == 'Ascending') {
      this.assetList.OrderType = 'Descending';
    } else {
      this.assetList.OrderType = 'Ascending';
    }
    this.assetList.OrderBy = orderBy;
    this.assetList.CurrentPage = 0;
    this.getAllAssets(this.assetList);
  }

  getHierarchyTypeList() {
    this.propSecGrpService.getHierarchyTypeList().subscribe(
      data => {
        if (data && data.isSuccess) {
          this.visitedHierarchy = [];
          this.hiearchyTypeLists = data.data;
          if (this.printHiearchy != undefined) {
            this.openHiearchyLiver(this.printHiearchy);
          }
        }
      }
    )
  }

  openHiearchyLiver(data) {
    if (data != undefined) {
      for (let item of data) {
        //$('#' + item.assetId).attr("checked", "checked");
        this.visitedHierarchy[item.assetId] = item.assetId;
        if (item.childLayers != undefined) {
          this.openHiearchyLiver(item.childLayers);
        }
      };
    }
  }


  getHiearchyTree(hiearchyType = null) {
    if (this.selectedHiearchyType) {
      this.hierarchyLevels = [];
      this.visitedHierarchy = [];
      this.propSecGrpService.getHierarchyAllLevel(this.selectedHiearchyType).subscribe(
        data => {
          this.hierarchyLevels = data;

        }
      )
    }
  }

  setHiearchyValues() {
    if (this.selectedHiearchyType && this.selectedhierarchyLevel) {
      this.propSecGrpService.hierarchyStructureForAsset(this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedhierarchyLevel.actualParentId).subscribe(
        data => {
          this.printHiearchy = data;
          this.assetList.HierarchyTypeCode = this.selectedHiearchyType;
          this.assetList.OwnerAssetId = this.selectedhierarchyLevel.assetId;
          this.resetAssetList();
          this.getAllAssets(this.assetList);
          this.closeHiearchyWindow();
        }
      )
    }

  }


  clearPropSec() {
    this.printHiearchy = [];
    this.assetList.HierarchyTypeCode = '';
    this.assetList.OwnerAssetId = '';
    this.resetAssetList();
    this.getAllAssets(this.assetList);
  }

  resetAssetList() {
    this.selectedAsset = [];
    this.assetId = '';
    this.assetList.CurrentPage = 0;
    this.assetList.OrderBy = 'ASSID';
    this.assetList.OrderType = 'Ascending';
  }

  selectHiearchy(event: any, hiearchyLevel) {
    this.selectedhierarchyLevel = hiearchyLevel;
    //let path = event.path;
    let ancestorElm = this.findAncestor(event.target, 'tree');
    //console.log(ancestorElm.className);
    this.selectedhierarchyLevel.actualParentId = ancestorElm.className;
    // if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    //   //console.log('fire')
    // } else {
    //   //console.log('else')
    // }
    //console.log(event);
    // for (let i in path) {
    //   if (path[i].classList.contains('tree')) {
    //     this.selectedhierarchyLevel.actualParentId = path[+i - 1].className;
    //     break;
    //   }
    // }
    //console.log(this.selectedhierarchyLevel);
  }

  findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.parentElement.classList.contains(cls));
    return el;
  }

  public openHiearchyWindow() {
    $('.portalwBlurtab').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
  }

  public closeHiearchyWindow() {
    $('.portalwBlurtab').removeClass('ovrlay');
    this.hiearchyWindow = false;
  }

  openTabWindow(tabname, asset) {
    $('.portalwBlurtab').addClass('ovrlay');
    this.assetId = asset.assetId;
    this.selectedAsset = asset;
    this.tabName = tabname;
    this.tabWindow = true;
    this.loaderService.hide();
    this.loaderService.pageHide();
  }

  closeTabWindow($event) {
    this.tabWindow = $event;
    $('.portalwBlurtab').removeClass('ovrlay');

    this.subs.add(
      this.assetAttributeService.getAssetTabsList(this.currentUser.userId).subscribe(
        tabData => {
          this.tabsData = tabData;
        }
      )
    )
  }

  openSearchBar() {
    var scrollTop = $('.layout-container').height();
    $('.search-container').show();
    $('.search-container').css('height', scrollTop);
    if ($('.search-container').hasClass('dismiss')) {
      $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
    }
  }

  closeSearchBar() {
    if ($('.search-container').hasClass('selectedcs')) {
      $('.search-container').removeClass('selectedcs').addClass('dismiss');
      $('.search-container').animate({ width: 'toggle' });
    }
  }

  exportToExcel(fileExt, rowSelection = null): void {
    let fileName = 'Asset-List.' + fileExt;
    let ignore = [];
    let label: any = {
      'type': 'Type',
      'assetId': 'Asset ID',
      'address': 'Address',
      'postCode': 'Postcode',
      'status': 'Status',
    }

    if (this.asbestosColumn) {
      let asbestoslbl: any = {
        'asbestosCount': 'No Asbestos',
        'presumed': 'Presumed',
        'stronglypresumed': 'Strongly Presumed',
        'identified': 'Identified',
        'highestMaterialRisk': 'Highest Material Risk',
        'highestPriorityRisk': 'Highest Priority Risk',
        'highestTotalRisk': 'Highest Total Risk',
        'hsenotifiable': 'HSE Notify'
      }
      label = { ...label, ...asbestoslbl };
    }

    if (this.serviceColumn) {
      let servicePortalLbl: any = {
        'primaryJobs': 'Primary Jobs',
        'completedJobs': 'Complete Jobs',
        'cancelledJobs': 'Cancelled Jobs',
        'overdueJobs': 'Overdue Jobs',
        'pastDeadline': 'Past Deadline Jobs',
      }
      label = { ...label, ...servicePortalLbl };
    }

    if (this.epcView) {
      let energyPortalLbl: any = {
        'epcStatus': 'EPC Status',
        'sap': 'SAP',
        'sapBand': 'SAP Band',
        'ei': 'EI',
        'eiBand': 'EI Band',
        'lodgeDate': 'Lodged Date',
        'expiryDate': 'Expiry Date',
        'scheduledDate': 'Scheduled Date',
        'surveyStatus': 'Survey Status',
        'surveyDate': 'Survey Date',
        'supName': 'Survey Project',
        'subName': 'Survey Batch',
      }
      label = { ...label, ...energyPortalLbl };
    }


    if (this.assetList.SimCompliance != '') {
      let complianceLbl: any = {
        'compliance': 'Compliance'
      }
      label = { ...label, ...complianceLbl };
    }

    if (rowSelection != null) {
      if (this.selectedAssestsExport.length == 0) {
        this.alertService.error("Please select asset to export.")
        return
      }
      const exportData = this.selectedAssestsExport;
      this.helper.exportAsExcelFile(exportData, 'Asset-List', label)
    } else {
      this.assetAttributeService.getExportAssets(this.assetList).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.helper.exportAsExcelFile(data.data, 'Asset-List', label)
          }
        }
      )
    }

    // if (fileExt == 'xlsx') {
    //   this.helper.exportAsExcelFile(exportData, 'Asset-List', label)
    // } else if (fileExt == 'html') {
    //   this.helper.exportAsHtmlFile(exportData, fileName, label)
    // } else {
    //   this.helper.exportToCsv(fileName, exportData, ignore, label);
    // }

  }

  // printIndividualAssetReport() {
  //   if (this.selectedAsset != undefined) {
  //     this.individualAssetReport = true;
  //   } else {
  //     this.alertService.error('Please select one asset first.');
  //   }

  //   //this.router.navigate(['/pdf']);
  // }

  // closeIndividualAssetReport($event){
  //   this.individualAssetReport = $event;
  // }

  // showAsbestosColumn(value) {
  //   this.loaderService.show();
  //   this.asbestosColumn = (value == 'false') ? true : false;
  //   let comp = this;
  //   setTimeout(function () { comp.loaderService.hide(); }, 1000);
  // }

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

  checkAssetStatus(val, key) {
    this.attributeLists[key].status = (val == 'A' || val == 'Active') ? 'Active' : 'Inactive';
    return this.attributeLists[key].status;
  }


  // track asset table grid
  trackByFunction(index, item) {
    return index;
  }

  getSystemDefaultDate() {
    this.subs.add(
      this.servicePortalService.GetSystemDefaultDate().subscribe(
        data => {
          if (data.isSuccess) {
            let startDate: any = this.helper.ngbDatepickerFormat(data.data.startDate);
            let endDate: any = this.helper.ngbDatepickerFormat(data.data.endDate);
            startDate = `${startDate.year}-${this.helper.zeorBeforeSingleDigit(startDate.month)}-${this.helper.zeorBeforeSingleDigit(startDate.day)}`;
            endDate = `${endDate.year}-${this.helper.zeorBeforeSingleDigit(endDate.month)}-${this.helper.zeorBeforeSingleDigit(endDate.day)}`;
            this.servicePortalService.getServiceTypeFilter(startDate, endDate).subscribe(
              data => {
                if (data.isSuccess) {
                  this.serviceTypes = data.data;
                  if (this.serviceTypes != undefined) {
                    this.serviceTypes.unshift({ key: '', value: '' })
                  }
                }
              }
            )
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


  checkRendartable() {
    let ua = window.navigator.userAgent;
    let IExplorerAgent = ua.indexOf("MSIE") > -1 || ua.indexOf("rv:") > -1;
    //console.log(IExplorerAgent);
    // console.log(ua);
    if (!IExplorerAgent) {
      setTimeout(() => {
        $('#assetTbl').on('scroll', () => {
          $("#assetTbl tbody").css({ 'overflow-y': 'hidden' });
          setTimeout(() => {
            $("#assetTbl tbody").css({ 'overflow-y': 'scroll' });
          }, 1000);

          $("#assetTbl > *").width($("#assetTbl").width() + $("#assetTbl").scrollLeft());
          this.chRef.markForCheck();
        });
      }, 5);
      this.chRef.markForCheck();
    } else {


      setTimeout(() => {
        $(".assetGrid").css("maxWidth", "100%");
        $(".assetGrid").css({ 'overflow-x': 'auto' });
        $('#assetTbl').on('scroll', () => {
          $("#assetTbl tbody").css({ 'overflow-y': 'hidden' });
          setTimeout(() => {
            $("#assetTbl tbody").css({ 'overflow-y': 'scroll' });
            this.chRef.markForCheck();
          }, 1000);


          $("#assetTbl > *").width($("#assetTbl").width() + $("#assetTbl").scrollLeft());
          this.chRef.markForCheck();
        });
      }, 5);


    }

  }


  openRetrieveEPCWindow(asset) {
    this.selectedAsset = asset;
    $('.portalwBlur').addClass('ovrlay');
    this.epcStatus = asset.epcStatus;
    this.assetId = asset.assetId;
    this.retrieveWindow = true;
  }


  closeRetrieveEPCWindow($event) {
    this.retrieveWindow = false;
    var isItRetrieved: boolean = $event;
    $('.portalwBlur').removeClass('ovrlay');
    if (isItRetrieved) {
      this.selectedAsset.epcStatus = "Lodged EPC";
      this.openTabWindow("epc", this.selectedAsset);
    }
  }

  sapBandsChanged(currentValues) {
    this.selectedSAPBands = currentValues;
    this.filterAssetTable(currentValues, "sapBands");

  }

  filterChange(filterValues) {

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
