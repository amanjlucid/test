import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SubSink } from 'subsink';
import { HnsDefinitionModel } from '../../_models'
import { AssetAttributeService, AlertService, HnsPortalService, ConfirmationDialogService, SharedService, HelperService } from 'src/app/_services';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { appConfig } from '../../app.config';


declare var $: any;

@Component({
  selector: 'app-hns-definitions',
  templateUrl: './hns-definitions.component.html',
  styleUrls: ['./hns-definitions.component.css']
})

export class HnsDefinitionsComponent implements OnInit, OnDestroy {
  subs = new SubSink(); // to unsubscribe services
  gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  tempState: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  definitionGridModel: HnsDefinitionModel = {
    textString: "",
    activeStatus: 'Y',
    inactiveStatus: 'N',
    allStatus: 'N'
  }

  searchTerm$ = new Subject<string>();
  filterDropDown = [{ valid: "Y", val: "Yes" }, { valid: "N", val: "No" }];
  inUserFilterDrpDwn = [{ hasinuse: "Y", val: "Yes" }, { hasinuse: "N", val: "No" }];
  statusFilterDrpDwn = [{ hasstatus: "A", val: "Active" }, { hasstatus: "I", val: "Inactive" }];
  bandsFilterDrpDwn = [{ bandsYN: "Y", val: "Yes" }, { bandsYN: "N", val: "No" }];
  scoringFilterDrpDwn = [{ hasscoring: 0, val: "None" }, { hasscoring: 1, val: "Scoring Rules" }, { hasscoring: 2, val: "Risk Matrix" }];
  pageSize = 25;
  definitionListsData: any;
  definitionTempData: any;
  gridChunkedData: any = [];
  actualDefinitionListData: any;
  definitionFormOpen: boolean = false;
  selectedDefinition: any;
  definitionFormMode: string = "new";
  touchtime = 0;
  definitionDetailIsTrue: boolean = false;
  openPriorityList: boolean = false;
  openBudgetList: boolean = false;
  openScoringBand: boolean = false;
  openSeverityList: boolean = false;
  openProbabilityList: boolean = false;
  currentUser: any;
  loading: boolean = false;
  hnsPermission: any = [];
  activeInactive: any = "active";
  contextMenus = ['Copy'];

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private hnsService: HnsPortalService,
    private confirmationDialogService: ConfirmationDialogService,
    private http: HttpClient,
    private sharedService: SharedService,
    private helper: HelperService
  ) { }

  ngOnInit() {

    //update notification on top
    this.helper.updateNotificationOnTop();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.definitionGridModel.textString = searchTerm;
          this.getHealtSafetyDefinatonList(this.definitionGridModel);
        })
    )

    this.getHealtSafetyDefinatonList(this.definitionGridModel);

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
          if (this.hnsPermission.indexOf("Inactivate") !== -1) {
            this.contextMenus.splice(0, 0, "Inactivate");
          }

          if (this.hnsPermission.indexOf("Activate") !== -1) {
            this.contextMenus.splice(0, 0, "Activate");
          }

          // if (this.hnsPermission.includes("Inactivate")) {
          //   this.contextMenus.splice(0, 0, "Inactivate");//['Activate', 'Inactivate', 'Copy']
          // }

          // if (this.hnsPermission.includes("Activate")) {
          //   this.contextMenus.splice(0, 0, "Activate");//['Activate', 'Copy']
          // }

          // if (this.hnsPermission.includes("Inactivate") == false && this.hnsPermission.includes("Activate") == false) {
          //   this.contextMenus = ['Copy']
          // }
          
        }
      )
    )


  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public distinctPrimitive(fieldName: string): any {
    return distinct(this.definitionListsData, fieldName).map(item => item[fieldName]);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.state.skip = 0;
    this.gridView = process(this.definitionTempData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.tempState.filter = filter;
    let tempGrid: any = [];
    this.resetGrid()
    if (filter['filters'].length > 0) {
      if (!("filters" in filter['filters'][0])) {
        tempGrid = process(this.definitionListsData, this.tempState);
        this.definitionTempData = tempGrid.data;
        this.renderGrid(tempGrid);
      } else if ("field" in filter['filters'][0]['filters'][0]) {
        tempGrid = process(this.definitionListsData, this.tempState);
        this.definitionTempData = tempGrid.data;
        this.renderGrid(tempGrid);
        //this.gridView = process(this.definitionListsData, this.state);
      } else {
        // console.log('no');
      }
    } else {
      tempGrid = process(this.definitionListsData, this.tempState);
      this.definitionTempData = tempGrid.data;
      this.renderGrid(tempGrid);

    }

  }

  filterGrid(filter: CompositeFilterDescriptor) {
    this.state.filter = filter;
    this.tempState.filter = filter;
    this.resetGrid()
    let tempGrid = process(this.definitionListsData, this.tempState);
    this.definitionTempData = tempGrid.data;
    this.renderGrid(tempGrid);
    //this.gridView = process(this.definitionTempData, this.state);
    //console.log(this.gridView);
  }

  renderGrid(tempGrid: any) {
    setTimeout(() => {
      this.gridView = process(tempGrid.data, this.state)
      // this.gridView = {
      //   data: tempGrid.data,
      //   total: tempGrid.total
      // };
    }, 20);
  }


  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedDefinition = dataItem;
    if (columnIndex > 1) {
      this.openDefinitionDetailPopUp(dataItem)
    }
  }

  search($event) {
    this.searchTerm$.next($event.target.value);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.definitionTempData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.definitionTempData.length
    };
  }

  public onSelect({ dataItem, item }): void {
    if (item == "Activate" || item == "Inactivate") {
      let status: string = "";
      if (item == "Activate") {
        status = "A";
      } else if (item == "Inactivate") {
        status = "I";
      }
      const statusParams = {
        hasCode: dataItem.hascode,
        hasVersion: dataItem.hasversion,
        status: status,
      }
      this.hnsService.changeStatus(statusParams).subscribe(
        data => {
          if (data.isSuccess) {
            this.getHealtSafetyDefinatonList(this.definitionGridModel);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    }

  }


  getHealtSafetyDefinatonList(definitionGridModel: any) {
    this.subs.add(
      this.hnsService.getHealtSafetyDefinatonList(definitionGridModel).subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            this.resetGrid()
            this.definitionListsData = data.data;
            this.definitionTempData = Object.assign([], data.data);
            this.gridView = process(this.definitionListsData, this.state)
          } else {
            this.alertService.error(data.message);
          }
        },
        err => {
          this.alertService.error(err);
        }
      )
    )
  }

  setStatus(st: string) {
    this.gridView.data = [];
    this.definitionGridModel.allStatus = "N";
    this.definitionGridModel.activeStatus = "N";
    this.definitionGridModel.inactiveStatus = "N";
    if (st == "all") {
      this.definitionGridModel.allStatus = "Y";
    } else if (st == "active") {
      this.definitionGridModel.activeStatus = "Y";
    } else if (st == "inactive") {
      this.definitionGridModel.inactiveStatus = "Y";
    }
    this.getHealtSafetyDefinatonList(this.definitionGridModel);

  }

  openHnsForm(formMode: string) {
    if (formMode != "new" && this.selectedDefinition == undefined) {
      return
    }

    this.definitionFormMode = formMode;
    $('.difinitionOverlay').addClass('ovrlay');
    this.definitionFormOpen = true;

  }

  closeDefinitionForm($event: boolean) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    $('.difinitionOverlay').removeClass('ovrlay');
    this.definitionFormOpen = $event;
  }

  reloadGrid($event: boolean) {
    if ($event) {
      this.gridView.data = [];
      this.gridView.total = 0;
      this.getHealtSafetyDefinatonList(this.definitionGridModel);
    }
  }

  resetGrid() {
    this.state.skip = 0;
    //this.gridView = process([], this.state)//empty grid
  }


  public openConfirmationDialog(obj: any) {
    if (obj.hasinuse == "Y") {
      this.alertService.error("This record is in use.");
      return
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteDefinition(obj) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));

  }

  deleteDefinition(defObj: any) {
    this.subs.add(
      this.hnsService.deleteDefinition(defObj).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Definition deleted successfully.");
            this.gridView.data = [];
            this.getHealtSafetyDefinatonList(this.definitionGridModel);
          } else {
            this.alertService.error(data.message);
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      )
    )
  }


  openDefinitionDetailPopUp(dataItem, clickEv = false) {
    if (clickEv) {
      $('.difinitionOverlay').addClass('ovrlay');
      this.selectedDefinition = dataItem;
      this.definitionDetailIsTrue = true;
    } else {
      if (this.touchtime == 0) {
        // set first click
        this.touchtime = new Date().getTime();
      } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (((new Date().getTime()) - this.touchtime) < 400) {
          // double click occurred
          $('.difinitionOverlay').addClass('ovrlay');
          this.selectedDefinition = dataItem;
          this.definitionDetailIsTrue = true;
          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }
    }

  }

  closeDefinitionDetail($event) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.definitionDetailIsTrue = $event;
    $('.difinitionOverlay').removeClass('ovrlay');
  }

  public async priorityList() {
    if (this.selectedDefinition.hasscoring == 2) {
      let riskMatrixScore: any = await this.http.get(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetMaxRiskMatrixForScore?hasCode=${this.selectedDefinition.hascode}&hasVersion=${this.selectedDefinition.hasversion}`).toPromise();
      if (riskMatrixScore.isSuccess) {
        if (riskMatrixScore.data.maxscore == 0 && riskMatrixScore.data.maxscore == 0) {
          this.alertService.error("There appears to be no Severity and Probability Codes set up for this definition. Please set them up before attempting to set up the Priority Codes");
          return
        }
      } else {
        this.alertService.error(riskMatrixScore.message);
        return
      }
    }

    this.openPriorityList = true;
    $('.difinitionOverlay').addClass('ovrlay');
  }

  closePriorityList($event) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.openPriorityList = $event;
    $('.difinitionOverlay').removeClass('ovrlay');
  }

  budgetList() {
    this.openBudgetList = true;
    $('.difinitionOverlay').addClass('ovrlay');
  }

  closeBudgetList($event) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.openBudgetList = $event;
    $('.difinitionOverlay').removeClass('ovrlay');
  }

  scoringBands($event) {
    if (this.selectedDefinition != undefined) {
      if (this.selectedDefinition.hasscoring != 1) {
        $event.preventDefault();
        return
      }
      this.openScoringBand = true;
      $('.difinitionOverlay').addClass('ovrlay');
    }
  }

  closeScoringBands($event) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.openScoringBand = $event;
    $('.difinitionOverlay').removeClass('ovrlay');
  }


  openSeverityListMethod() {
    this.openSeverityList = true;
    $('.difinitionOverlay').addClass('ovrlay');
  }

  closeSeverityList($event) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.openSeverityList = $event;
    $('.difinitionOverlay').removeClass('ovrlay');
  }

  openProbabilityListMethod() {
    this.openProbabilityList = true;
    $('.difinitionOverlay').addClass('ovrlay');
  }

  closeProbabilityList($event) {
    this.getHealtSafetyDefinatonList(this.definitionGridModel);
    this.openProbabilityList = $event;
    $('.difinitionOverlay').removeClass('ovrlay');
  }

  recalculateScores() {
    if (this.selectedDefinition.hasscoring == 1) {
      const params = { hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion, modifiedby: this.currentUser.userId }
      this.subs.add(
        this.hnsService.recalculateScore(params).subscribe(
          data => {
            if (data.isSuccess) {
              this.alertService.success(`Scores recalculated for Definition (${this.selectedDefinition.hasname} Version ${this.selectedDefinition.hasversion})`);
            } else {
              this.alertService.error(data.message);
            }
          }
        )
      )
    }
  }

  report(dependencies) {
    if (this.selectedDefinition != undefined) {
      const params = { hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion, Dependency: dependencies };
      this.subs.add(
        this.hnsService.report(params).subscribe(
          filedata => {

            let fileExt = "pdf";
            this.assetAttributeService.getMimeType(fileExt).subscribe(
              mimedata => {
                if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                    var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                        if (mimedata.data.openWindow)
                        {
                          var byteCharacters = atob(filedata);
                          var byteNumbers = new Array(byteCharacters.length);
                          for (var i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          var byteArray = new Uint8Array(byteNumbers);
                          var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                          var fileURL = URL.createObjectURL(file);
                          let newPdfWindow =window.open(fileURL);
      
                          // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                          // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                          // let iframeEnd = "'><\/iframe>";
                          // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                          // newPdfWindow.document.title = this.selectedNotes.fileName;
                        }
                        else
                        {
                          linkSource = linkSource + filedata;
                          const downloadLink = document.createElement("a");
                          const fileName = "Report";
                          downloadLink.href = linkSource;
                          downloadLink.download = fileName;
                          downloadLink.click();
                        }
                  }
                  else{
                    this.alertService.error("This file format is not supported.");
                  }
              }
            )
          },
          error => {
            this.alertService.error(error);
          }
        )
      )
    }
  }

  triggerLi(event) {
    $(event.srcElement).closest('tr').click();
  }



}
