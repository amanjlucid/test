import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent, RowClassArgs } from '@progress/kendo-angular-treelist';
import { AlertService, LoaderService, ConfirmationDialogService, HelperService, WorksorderManagementService, SharedService, PropertySecurityGroupService, AuthenticationService } from '../../_services'
import { combineLatest, forkJoin } from 'rxjs';
import { WorkordersDetailModel } from 'src/app/_models';
import { appConfig } from '../../app.config';


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
  filterToggle = false;
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
    multiple: true,
    drag: false,
    enabled: true
  };
  gridPageSize = 25;

  public groupedData: any = [];
  public gridData: any = [];
  @ViewChild(TreeListComponent) public grid: TreeListComponent;
  gridHeight = 680;
  worksOrderData: any;

  assetchecklistWindow = false;
  selectedChildRow: any;
  selectedParentRow: any;
  selectedRow: any;
  actualSelectedRow: any;

  newPhasewindow = false;
  phaseFormMode = 'new';

  packageMappingWindow = false;

  addAssetWindow = false;
  addAssetWorklistWindow = false;

  assetDetailWindow = false;
  treelevel = 2;
  worksOrderAccess = [];
  worksOrderUsrAccess = [];
  woFormWindow = false;
  phaseBudgetAvailable: any = 0;
  touchtime = 0;

  addWorkFrom: string;

  columnLocked: boolean = true;
  userType: any = [];

  mousePositioin: any = 0;
  moveAsset: boolean = false;
  phaseChecklist = false;

  selectedAssetList: any = [];

  chooseDateWindow = false;
  chooseDateType = 'status';

  selectedDate: any;
  actionType = 'single';

  openAssetRemoveReason = false;
  reason = '';

  constructor(
    private sharedService: SharedService,
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private propSecGrpService: PropertySecurityGroupService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private autService: AuthenticationService,
  ) { }


  ngOnInit() {
    // console.log(this.worksOrderSingleData)
    /**
     * update notification on top
     * Common service for all routing page
     **/
    this.helperService.updateNotificationOnTop();

    this.helperService.getWorkOrderSecurity(this.worksOrderSingleData.wosequence);
    this.helperService.getUserTypeWithWOAndWp(this.worksOrderSingleData.wosequence, this.worksOrderSingleData.wprsequence)

    //subscribe for work order security access
    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          // console.log(data);
          this.worksOrderUsrAccess = data[0];
          this.worksOrderAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    //subscribe for worksorders data when coming from works order
    this.subs.add(
      this.sharedService.worksOrderObs.subscribe(
        data => {
          if (data.length == 0 && !this.worksOrderSingleData) {
            this.alertService.error("Please select one work order from the works orders list");
            this.loading = false;
            return
          }

          this.worksOrderDetailPageData();

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

        this.worksorderManagementService.worksOrderGetUnallocPhaseBudget(intWOSEQUENCE),
        this.worksorderManagementService.getWorksOrderRepairingCharConfigExt(intWOSEQUENCE),
        this.worksorderManagementService.getListOfWorksOrderChecklistForWORK(intWOSEQUENCE),
      ]).subscribe(
        data => {
          // console.log(data)
          const programmeData = data[0];
          const userSecurityByWO = data[1];
          const worksOrderData = data[2];
          this.phaseBudgetAvailable = data[3].data;

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
          // console.log(data);
          if (data.isSuccess) {
            let gridData = [];
            let tempData = [...data.data];

            //Find parent and Set parent id in each row wopsequence
            tempData.forEach((value, index) => {
              if (value.treelevel == 2) {
                value.parentId = null
                value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}${this.helperService.replaceAll(value.assid, " ", "")}`;
                value.parentData = JSON.stringify(value);
                const valueWithDateObj = this.addDateObjectFields(value, ['targetdate', 'woacompletiondate', 'planstartdate', 'planenddate']); //Converting date object for filter from grid
                gridData.push(valueWithDateObj);

              }

              if (value.treelevel == 3) {
                const parent = tempData.find(x => x.treelevel == 2 && x.wprsequence == value.wprsequence && x.wosequence == value.wosequence && x.wopsequence == value.wopsequence);
                if (parent) {
                  value.parentId = `${parent.wopsequence}${parent.wosequence}${parent.wprsequence}${this.helperService.replaceAll(parent.assid, " ", "")}`;
                  value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}${this.helperService.replaceAll(value.assid, " ", "")}${index}`;


                  //  let Form = JSON.stringify(this.myForm.value);


                  value.parentData = JSON.stringify(parent);
                  value.assid = value.assid;

                  const valueWithDateObj = this.addDateObjectFields(value, ['targetdate', 'woacompletiondate', 'planstartdate', 'planenddate']); //Converting date object for filter from grid
                  gridData.push(valueWithDateObj);
                }
              }

            })

            setTimeout(() => {
              this.gridData = [...gridData];
              this.loading = false;
              this.chRef.detectChanges();
            }, 10);

          } else {
            this.alertService.error(data.message);
            this.loading = false
          }
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

  rowCallback(context: RowClassArgs) {
    if (context.dataItem.treelevel == 1) {
      return { level1: true, }
    }
    if (context.dataItem.treelevel == 2) {
      return { level2: true, }
    }
    if (context.dataItem.treelevel == 3) {
      return { level3: true, }
    }
  }

  onFilterChange(filter: any): void {
    this.filter = filter;
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (columnIndex > 0) {
      if (this.touchtime == 0) {
        this.touchtime = new Date().getTime();
      } else {

        if (((new Date().getTime()) - this.touchtime) < 400) {
          setTimeout(() => {
            if (dataItem.treelevel == 2) {
              //open asset detail window
              if (this.worksOrderAccess.indexOf('Asset Details') != -1 || this.worksOrderUsrAccess.indexOf('Asset Details') != -1) {
                // this.openAssetDetail(dataItem)
              }

            } else if (dataItem.treelevel == 3) {
              //open asset checklist window
              if (this.worksOrderAccess.indexOf('Asset Checklist') != -1 || this.worksOrderUsrAccess.indexOf('Asset Checklist') != -1) {
                this.openAssetChecklist(dataItem)
              }

            }
          }, 200);

          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }

      }


    }
    // console.log(this.selected);
    // console.log(dataItem)

  }

  addDateObjectFields(obj, fieldsArr: Array<any>) {
    if (fieldsArr.length > 0) {
      fieldsArr.forEach(element => {
        if (obj[element] != undefined) {
          obj[element + 'obj'] = obj[element] != "" ? new Date(obj[element]) : '';
        }
      });
    }

    return obj;
  }

  //####################### hierarchy function start ####################################//
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
          this.workorderDetailModel.pHITTYPECODE = this.selectedHiearchyType;
          this.workorderDetailModel.pHSOWNASSID = this.selectedhierarchyLevel.assetId;
          this.getWorkDetails()

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
      this.subs.add(
        this.propSecGrpService.getHierarchyAllLevel(this.selectedHiearchyType).subscribe(
          data => {
            this.hierarchyLevels = data;
          }
        )
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
    this.workorderDetailModel.pHITTYPECODE = '';
    this.workorderDetailModel.pHSOWNASSID = '';
    this.getWorkDetails()

  }

  //##################### hierarchy function end ######################################//

  slideToggle() {
    this.filterToggle = !this.filterToggle;
    $('.worksorder-header').slideToggle();
    if (this.filterToggle) {
      this.gridHeight = 370;
    } else {
      setTimeout(() => {
        this.gridHeight = 680;
      }, 500);
    }
  }


  openAssetChecklist(item) {
    this.selectedChildRow = item;
    this.assetchecklistWindow = true;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }

  closeAssetchecklistEvent(eve) {
    this.assetchecklistWindow = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.refreshGrid(true)
  }

  openNewphase(mode, item = null) {
    if (mode == 'edit') {
      this.selectedParentRow = item
    }
    this.phaseFormMode = mode
    this.newPhasewindow = true;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }

  closeNewphaseEvent(eve) {
    this.newPhasewindow = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.refreshGrid(true)
  }

  openPackageMappingWindow() {
    this.packageMappingWindow = true;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }

  cloasePackageMappingWindow(eve) {
    this.packageMappingWindow = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
  }

  openConfirmationDialog(item) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `Delete Phase?`)
      .then((confirmed) => (confirmed) ? this.deletePhase(item) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  refreshGrid(eve) {
    if (eve) this.worksOrderDetailPageData();
  }

  deletePhase(item) {
    let params = {
      WOSEQUENCE: item.wosequence,
      WOPSEQUENCE: item.wopsequence,
      UserId: this.currentUser.userId,
      CheckProcess: 'P'
    }

    this.subs.add(
      this.worksorderManagementService.deletePhase(params).subscribe(
        data => {
          if (data.isSuccess && data.data == "S") {
            this.alertService.success(data.message);
            this.refreshGrid(true);
          } else {
            this.alertService.error(data.message);
          }
        },
        err => this.alertService.error(err)
      )
    )
  }

  moveWorksOrderDetailRow(move, item) {
    this.subs.add(
      this.worksorderManagementService.phaseUpDown(item.wosequence, item.wopsequence, move).subscribe(
        data => {
          if (data.isSuccess) this.refreshGrid(true);
        },
        err => this.alertService.error(err)
      )
    )
  }

  openAddAssetWorkOrders(workOrderType, item) {
    this.actualSelectedRow = item;
    this.addAssetWindow = true;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }


  closeAddAssetWindow(eve) {
    this.addAssetWindow = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.refreshGrid(true)
  }

  openAddAssetWorkOrdersList(item, workOrderType) {
    if (item.treelevel == 3 && item.wostatus != "New") {
      return
    }


    this.addWorkFrom = workOrderType;
    this.actualSelectedRow = item;
    this.addAssetWorklistWindow = true;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }


  closeAddAssetWorkordersListWindow(eve) {
    this.addAssetWorklistWindow = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.refreshGrid(true)
  }

  openAssetDetail(item) {
    this.assetDetailWindow = true;
    this.selectedRow = item;
    this.selectedParentRow = item;
    this.treelevel = 2;

    //  this.worksOrderData
    //  console.log('selectedParentRow ' + JSON.stringify(this.selectedParentRow));

    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }


  openAssetDetailChild(item) {
    this.assetDetailWindow = true;
    this.selectedChildRow = item;
    this.selectedRow = item;
    this.treelevel = 3;


    this.selectedParentRow = JSON.parse(item.parentData);

    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }


  openActualAssetDetails(item) {

    this.autService.validateAssetIDDeepLinkParameters(this.currentUser.userId, item.assid).subscribe(
      data => {
        if (data.validated) {
          const siteUrl = `${appConfig.appUrl}/asset-list?assetid=${encodeURIComponent(item.assid)}`; // UAT
          // const siteUrl = `http://localhost:4200/asset-list?assetid=${item.assid}`;
          window.open(siteUrl, "_blank");

        } else {
          const errMsg = `${data.errorCode} : ${data.errorMessage}`
          this.alertService.error(errMsg);
        }
      }
    )

    // $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }



  closeAssetDetailWindow(eve) {
    this.assetDetailWindow = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.refreshGrid(true)
  }

  redirectToWorksOrderEdit() {
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
    this.woFormWindow = true;

  }

  closeWoFormWin($event) {
    this.woFormWindow = $event;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    this.worksOrderDetailPageData();
  }



  assetAction(item = null, type, selection = "multiple", checkOrProcess = 'C') {
    this.chooseDateType = type;
    this.actionType = selection;

    let params: any = {};
    let callApi: any;

    if (selection == "single") {

      if (this.selected.length > 1) {
        this.alertService.error("Please select single record.")
        return
      }

      if (item.treelevel == 2) {
        this.alertService.error("You must select some Assets.")
        return
      }

      params.WOSEQUENCE = item.wosequence;
      params.WOPSEQUENCE = item.wopsequence;
      params.strASSID = [item.assid];

      if (type != "REMOVE") {
        params.concateAddress = item.woname;
      }

    } else {

      let selectedKeyArr = this.selected.map(x => { return x.itemKey });
      let assetData = this.gridData.filter(x => selectedKeyArr.includes(x.id) && x.treelevel == 3);

      if (assetData.length == 0) {
        this.alertService.error("You must select some Assets.")
        return
      }

      let assetIdArr = [];
      for (const asset of assetData) {
        assetIdArr.push(asset.assid)
      }

      params.strASSID = assetIdArr;
      params.WOSEQUENCE = assetData[0].wosequence;
      params.WOPSEQUENCE = assetData[0].wopsequence;
      // params.concateAddress = this.selectedChildRow.woname;
    }

    params.strUserId = this.currentUser.userId;
    params.strCheckOrProcess = checkOrProcess;


    if (type == "RELEASE") {
      callApi = this.worksorderManagementService.worksOrderReleaseAsset(params);
    } else if (type == "ACCEPT") {
      callApi = this.worksorderManagementService.worksOrderAcceptAsset(params);
    } else if (type == "ISSUE") {
      params.UserName = this.currentUser.userName;
      callApi = this.worksorderManagementService.worksOrderIssueAsset(params);
    }


    //####################
    else if (type == "HY") {
      // params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Yesterday')
      callApi = this.worksorderManagementService.worksOrderHandoverAsset(params);
    }

    else if (type == "HT") {
      // params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Today')
      callApi = this.worksorderManagementService.worksOrderHandoverAsset(params);
    }

    else if (type == "HCD") {
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
      callApi = this.worksorderManagementService.worksOrderHandoverAsset(params);
    }

    else if (type == "SOY") {
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Yesterday')
      callApi = this.worksorderManagementService.worksOrderAssetSignOff(params);
    }

    else if (type == "SOT") {
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.getDateString('Today')
      callApi = this.worksorderManagementService.worksOrderAssetSignOff(params);
    }

    else if (type == "SOCD") {
      params.UserName = this.currentUser.userName;
      params.dtDate = this.helperService.dateObjToString(this.selectedDate.selectedDate);
      callApi = this.worksorderManagementService.worksOrderAssetSignOff(params);
    }

    else if (type == "REMOVE") {
      params.strReason = this.reason;
      callApi = this.worksorderManagementService.worksOrderRemoveAsset(params);
    }

    else if (type == "CANCEL") {
      params.strRefusalReason = this.reason;
      callApi = this.worksorderManagementService.worksOrderCancelAsset(params);
    }
    //############


    this.subs.add(
      callApi.subscribe(
        data => {
          if (!data.isSuccess) {
            this.alertService.error(data.message);
            return
          }

          let resp: any;
          if (data.data[0] == undefined) {
            resp = data.data;
          } else {
            resp = data.data[0];
          }

          if (checkOrProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
            this.openConfirmationDialogAction({ item, type, selection }, resp)
          } else {
            this.alertService.success(resp.pRETURNMESSAGE)
            this.worksOrderDetailPageData();
          }

        }
      )
    )


  }


  openConfirmationDialogAction(obj, res) {

    const { item, type, selection } = obj;
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') {
            return
          }

          this.assetAction(item, type, selection, checkstatus);
        }

      }).catch(() => console.log('Attribute dismissed the dialog.'));
  }


  woMenuBtnSecurityAccess(menuName) {
    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    } else {
      return this.worksOrderUsrAccess.indexOf(menuName) != -1
    }

  }

  lockUnlockColumn() {
    this.columnLocked = !this.columnLocked;
  }


  getMouseroverEve(eve) {
    this.mousePositioin = { x: eve.pageX, y: eve.pageY };
  }

  setSeletedRow(dataItem, event) {
    // console.log(event)
    if (dataItem != undefined) {
      setTimeout(() => {
        let att = $('.selectedWodBar' + dataItem.id)[0].getAttribute("x-placement");
        if (att == "bottom-start" && this.mousePositioin.y > 600) {
          $('.selectedWodBar' + dataItem.id).css({ "top": "-116px", "left": "22px" })
        }

      }, 50);

    }

  }


  moveAssets(item = null) {
    this.selectedAssetList = [];

    if (item == null) {
      let selectedKeyArr = this.selected.map(x => { return x.itemKey });
      this.selectedAssetList = this.gridData.filter(x => selectedKeyArr.includes(x.id) && x.treelevel == 3);
    } else {
      this.selectedAssetList = [item];
    }

    if (this.selectedAssetList.length == 0) {
      this.alertService.error("Please select one asset.");
      return;
    }

    $('.worksOrderDetailOvrlay').addClass('ovrlay');
    this.moveAsset = true;

  }

  closeMoveAsset(eve) {
    this.moveAsset = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    // this.selectedRow = undefined;
  }


  openPhaseChecklist(item) {
    this.actualSelectedRow = item;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
    this.phaseChecklist = true;
  }

  closePhaseChecklist(eve) {
    this.phaseChecklist = eve;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
    // this.selectedRow = undefined;
  }


  closeChooseDate(event) {
    this.chooseDateWindow = event;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
  }

  selectedDateEvent(event) {
    this.selectedDate = event;
    this.assetAction(this.actualSelectedRow, this.chooseDateType, this.actionType, "C")
    // if (this.actionType == "multiple") {
    //   if (this.chooseDateType == "HCD") {

    //   }
    // }

  }


  openChooseDate(action = "single", type, item = null) {
    this.actionType = action;
    this.chooseDateType = type;
    this.chooseDateWindow = true;
    this.actualSelectedRow = item;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
    this.chRef.detectChanges();
  }


  openRemoveReasonPanel(action = "single", type, item = null) {
    this.actionType = action;
    this.chooseDateType = type;
    this.openAssetRemoveReason = true;
    this.actualSelectedRow = item;
    $('.worksOrderDetailOvrlay').addClass('ovrlay');
  }

  closeReasonPanel(eve) {
    this.openAssetRemoveReason = false;
    $('.worksOrderDetailOvrlay').removeClass('ovrlay');
  }

  getReason(reason) {
    if (reason != "") {
      this.reason = reason;
      this.assetAction(this.actualSelectedRow, this.chooseDateType, this.actionType, "C")
    }
  }


}
