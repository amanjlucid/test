import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent, ExpandEvent } from '@progress/kendo-angular-treelist';
import { AlertService, LoaderService, ConfirmationDialogService, HelperService, WorksorderManagementService, SharedService, PropertySecurityGroupService } from '../../_services'

// import { packages_mapping,assets_data } from './package_mapping';
// import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { forkJoin } from 'rxjs';
import { WorkordersDetailModel } from 'src/app/_models';



@Component({
  selector: 'app-worksorders-details',
  templateUrl: './worksorders-details.component.html',
  styleUrls: ['./worksorders-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})


export class WorksordersDetailsComponent implements OnInit {
  printHiearchy: any;
  visitedHierarchy: any[] = [];
  hiearchyTypeLists: any;
  selectedHiearchyType: any;
  hierarchyLevels: any;
  selectedhierarchyLevel: any;
  hiearchyWindow = false;

  subs = new SubSink();
  filterToggle = true;
  readonly = true;
  worksOrderSingleData = JSON.parse(localStorage.getItem('worksOrderSingleData'));
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  workorderDetailModel: WorkordersDetailModel;

  programmeData: any;
  userSecurityByWO: any;

  loading = true;
  public selected: any[] = [];
  public filter: CompositeFilterDescriptor;
  public settings: SelectableSettings = {
    mode: 'row',
    multiple: false,
    drag: false,
    enabled: true
  };
  gridPageSize = 25;
  public apiData: any = [];
  public groupedData: any = [];
  public gridData: any = [];
  @ViewChild(TreeListComponent) public grid: TreeListComponent;
  gridHeight = 400;
  worksOrderData: any;

  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private propSecGrpService: PropertySecurityGroupService,
    private loaderService: LoaderService,
  ) { }


  ngOnInit() {

    //update notification on top
    //this.helperService.updateNotificationOnTop(); // Common service for all routing page

    //subscribe for worksorders data
    this.subs.add(
      this.sharedService.worksOrderObs.subscribe(
        data => {
          // console.log(data);
          if (data.length == 0 && !this.worksOrderSingleData) {
            this.alertService.error("Please select one work order from the works orders list");
            return
          }

          this.worksOrderDetailPageData();
          // console.log(this.worksOrderSingleData);
        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  worksOrderDetailPageData() {
    const wprsequence = this.worksOrderSingleData.wprsequence;
    const intWOSEQUENCE = this.worksOrderSingleData.wosequence;
    const userId = this.currentUser.userId;

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
        this.worksorderManagementService.GetWEBWorksOrdersUserSecurityByWorksOrders(wprsequence, intWOSEQUENCE, userId),
        this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE),
        // this.worksorderManagementService.worksOrderGetUnallocPhaseBudget(intWOSEQUENCE),
        // this.worksorderManagementService.getWorksOrderRepairingCharConfigExt(intWOSEQUENCE),
        // this.worksorderManagementService.getListOfWorksOrderChecklistForWORK(intWOSEQUENCE),
      ]).subscribe(
        data => {
          console.log(data)
          const programmeData = data[0];
          const userSecurityByWO = data[1];
          const worksOrderData = data[2];

          // const repairingChar = data[3];
          // const checkListForWO = data[4];
          // const phaseBudget = data[5];

          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];

          if (userSecurityByWO.isSuccess) this.userSecurityByWO = userSecurityByWO.data[0];

          if (worksOrderData.isSuccess) {
            this.worksOrderData = worksOrderData.data;
            this.setInitialValueForWOdetailModel();
          }

          this.getWorkDetails()

        }
      )
    )
  }

  getWorkDetails() {
    this.subs.add(
      this.worksorderManagementService.getWorkOrderDetails(this.workorderDetailModel).subscribe(
        data => {
          console.log(data);
          // if (data.isSuccess) {
          //   let gridData = [];
          //   this.apiData = [...data.data];
          //   let tempData = [...data.data];
          //   let groupBywprsequence = tempData.reduce((r, a) => {
          //     r[a.wprsequence] = [...r[a.wprsequence] || [], a];
          //     return r;
          //   }, {});

          //   this.groupedData = [...groupBywprsequence];

          //   //Find parent and Set parent id in each row
          //   tempData.forEach((value, index) => {
          //     if (value.treelevel == 1) {
          //       value.parentId = null;
          //       value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}`;
          //       gridData.push(value)
          //     }

          //     if (value.treelevel == 2) {
          //       const parent = groupBywprsequence[value.wprsequence].find(x => x.treelevel == 1 && x.wprsequence == value.wprsequence);
          //       if (parent) {
          //         value.parentId = `${parent.wopsequence}${parent.wosequence}${parent.wprsequence}`;
          //         value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}`;
          //         gridData.push(value)
          //       }

          //     }

          //     if (value.treelevel == 3) {
          //       const parent = groupBywprsequence[value.wprsequence].find(x => x.treelevel == 2 && x.wprsequence == value.wprsequence && x.wosequence == value.wosequence);
          //       if (parent) {
          //         value.parentId = `${parent.wopsequence}${parent.wosequence}${parent.wprsequence}`;
          //         value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}`;
          //         gridData.push(value)
          //       }
          //     }

          //   })

          //   setTimeout(() => {
          //     this.gridData = [...gridData];
          //     this.loading = false
          //   }, 100);

          // } else {
          //   this.alertService.error(data.message);
          //   this.loading = false
          // }
        }
      )
    )
  }

  setInitialValueForWOdetailModel() {
    this.workorderDetailModel = {
      pWOSEQUENCE: this.worksOrderData.wosequence,
      pWOPSEQUENCE: this.worksOrderData.wprsequence,
      pInitialLoad: true,
      pTREELEVEL: 0,
      pHITTYPECODE: "",
      pHSOWNASSID: "",
      pASTCONCATADDRESS: "",
      pNew: false,
      pInProgress: false,
      pPracticalCompletion: false,
      pFinalCompletion: false,
      pIssued: false,
      pAccepted: false,
      pPending: false,
      pHandover: false,
      pFromDate: "1753-01-01",
      pToDate: "1753-01-01",
      pContractor: false
    }
  }

  public onFilterChange(filter: any): void {
    this.filter = filter;
  }

  cellClickHandler($event) {
    // console.log($event)
    // console.log(this.selected)
  }

  // hierarchy function start
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
        this.visitedHierarchy[item.assetId] = item.assetId;
        if (item.childLayers != undefined) {
          this.openHiearchyLiver(item.childLayers);
        }
      }
    }
  }


  setHiearchyValues() {
    if (this.selectedHiearchyType && this.selectedhierarchyLevel) {
      this.propSecGrpService.hierarchyStructureForAsset(this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedhierarchyLevel.actualParentId).subscribe(
        data => {
          this.loaderService.pageShow();
          this.printHiearchy = data;
          // this.filterValues.hittypecode = this.selectedHiearchyType;
          // this.filterValues.hsownassid = this.selectedhierarchyLevel.assetId;
          // this.filter()

          this.closeHiearchyWindow();
        }
      )
    }

  }

  public openHiearchyWindow() {
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
  }

  public closeHiearchyWindow() {
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.hiearchyWindow = false;
    this.loaderService.pageHide();

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

  selectHiearchy(event: any, hiearchyLevel) {
    this.selectedhierarchyLevel = hiearchyLevel;
    let ancestorElm = this.findAncestor(event.target, 'tree');
    this.selectedhierarchyLevel.actualParentId = ancestorElm.className;

  }

  findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.parentElement.classList.contains(cls));
    return el;
  }

  clearPropSec() {
    this.printHiearchy = [];
    // this.filterValues.hittypecode = '';
    // this.filterValues.hsownassid = '';
    // this.sharedService.changeResultHeaderFilters(this.filterValues);
    // this.filter()
  }

  // hierarchy function end

  openElmGrpWin(action) {
    // $('.bgblur').addClass('ovrlay');
    // this.elmGrpWindow = true;
  }

  public slideToggle() {
    this.filterToggle = !this.filterToggle;
    if (this.filterToggle) this.gridHeight = 400;
    else this.gridHeight = 680;
    $('.worksorder-header').slideToggle();
  }




  // @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  // public gridData: any[] = dummydata;
  // public gridView: any[];

  // // public gridPackageData: any[] = packages_mapping;
  // // public gridPackageView: any[];

  // // public gridAssetsData: any[] = assets_data;
  // public gridAssetsView: any[];

  // state: State = {
  //   skip: 0,
  //   sort: [],
  //   group: [],
  //   filter: {
  //     logic: "or",
  //     filters: []
  //   }
  // }
  // currentUser: any;
  // public dialogOpened = false;
  // public mySelection: string[] = [];
  // public elmGrpWindow = false;
  // public assetWindow = false;
  // public addAssetFromWlWindow = false;
  // public pwanWindow = false;

  // paramPhaseTree = {
  //   "pWOSEQUENCE": 661,
  //   "pWOPSEQUENCE": 0,
  //   "pInitialLoad": 1,
  //   "pTREELEVEL": 0,
  //   "pHITTYPECODE": "",
  //   "pHSOWNASSID": "",
  //   "pASTCONCATADDRESS": "",
  //   "pNew": 0,
  //   "pInProgress": 0,
  //   "pPracticalCompletion": 0,
  //   "pFinalCompletion": 0,
  //   "pIssued": 0,
  //   "pAccepted": 0,
  //   "pPending": 0,
  //   "pHandover": 0,
  //   "pFromDate": "1753-01-01",
  //   "pToDate": "1753-01-01",
  //   "pContractor": 0
  //   };


  // ngOnInit() {
  //   this.gridView = this.gridData;
  //   this.gridPackageView = this.gridPackageData;
  //   this.gridAssetsView = this.gridAssetsData;
  //   //update notification on top

  //   this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  // }




  // getManagement(paramPhaseTree) {
  //   this.subs.add(
  //     this.worksorderManagementService.getOrderPhasetreeList(paramPhaseTree).subscribe(
  //       data => {
  //           console.log(data);

  //       }
  //     )
  //   )
  // }

  // groupChange(): void {
  // }




  // public onFilter(inputValue: string): void {
  //       this.gridView = process(this.gridData, {
  //           filter: {
  //               logic: "or",
  //               filters: [
  //                   {
  //                       field: 'full_name',
  //                       operator: 'contains',
  //                       value: inputValue
  //                   },
  //                   {
  //                       field: 'job_title',
  //                       operator: 'contains',
  //                       value: inputValue
  //                   },
  //                   {
  //                       field: 'budget',
  //                       operator: 'contains',
  //                       value: inputValue
  //                   },
  //                   {
  //                       field: 'phone',
  //                       operator: 'contains',
  //                       value: inputValue
  //                   },
  //                   {
  //                       field: 'address',
  //                       operator: 'contains',
  //                       value: inputValue
  //                   }
  //               ],
  //           }
  //       }).data;

  //       this.dataBinding.skip = 0;
  //   }


  public openPopup(action) {
    // this.dialogOpened = true;
    $('.bgblur').addClass('ovrlay');
  }

  // public openAssets(assets){

  //   if(assets == "assets"){
  //     this.assetWindow = true;
  //   }else if(assets == "work-list"){
  //     this.addAssetFromWlWindow = true;
  //   }
  //   else if(assets == "work-name"){
  //     this.pwanWindow = true;
  //   }

  //   $('.bgblur').addClass('ovrlay');
  // }

  // public closeAssets(assets){

  //   console.log(assets);

  //   if(assets == "assets"){
  //     this.assetWindow = false;
  //   }else if(assets == "work-list"){
  //     this.addAssetFromWlWindow = false;
  //   }else if(assets == "work-name"){
  //     this.pwanWindow = false;
  //   }
  //   $('.bgblur').removeClass('ovrlay');
  // }


  // public closePopup() {
  //   this.dialogOpened = false;
  //   $('.bgblur').removeClass('ovrlay');
  // }




  // closeElmGrpWin($event) {
  //   this.elmGrpWindow = false;
  //   $('.bgblur').removeClass('ovrlay');
  // }


  // ngOnDestroy() {
  //   $('.bgblur').removeClass('ovrlay');
  // }

  // public togleChild(child){
  //   let el = $(this).closest('td');

  //   el.addClass("active");
  // }





}

