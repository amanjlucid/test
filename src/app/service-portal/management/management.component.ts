import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AlertService, HelperService, ServicePortalService, LoaderService, SharedService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
declare var $: any;
declare var tabelize: any;


@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ManagementComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  calendarPosition: string = "bottom";
  currentUser: any;
  mgmTable: any;
  managementFilterParam = {
    startDate: null,
    endDate: null,
    displayLevel: 'Contractor',
    displayLevelNo: 2
  }
  defaultDisplay: boolean = true;
  mgmtData: any = [];
  actualMgmtData: any;
  mgmFltrCol: any = {
    contractor: [],
    contract: [],
    serviceType: [],
  }

  mgmFilters: any = {
    contractor: [], // to check for unique value
    contract: [], // to check for unique value
    serviceType: [], // to check for unique value
    contractorObj: [],
    contractObj: [],
    serviceTypeObj: [],
  }
  public selectedItems = [];

  mgmDataByLvl: any = {};
  $mgmFltrObsr = new Subject<any>();
  loadEmptyTable: boolean = false;
  mgmGridLable = {
    levelName: 'Level Name',
    level: 'Level',
    contractor: 'Contractor',
    contract: 'Contract',
    contractStartDate: 'Contract Start Date',
    contractEndDate: 'Contract End Date',
    serviceType: 'Service Type',
    serviceTypeStartDate: 'Service Type Start Date',
    serviceTypeEndDate: 'Service Type End Date',
    serviceStage: 'Service Stage',
    totalJobs: 'Total Jobs',
    primaryNotServiced: 'Primary Not Serviced',
    servicedNotCompleted: 'Serviced Not Completed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    overDue: 'Overdue',
    deadlineOverDue: 'Deadline Overdue',
    deadlineOverDueThisWeek: 'Deadline Overdue Thisweek',
    deadlineOverDueThisMonth: 'Deadline Overdue Thismonth',
    dueThisWeek: 'Due Thisweek',
    dueThisWeekServiced: 'Due Thisweek Serviced',
    dueThisWeekCompleted: 'Due Thisweek Completed',
    dueThisMonth: 'Due Thismonth',
    dueThisMonthServiced: 'Due Thismonth Serviced',
    dueThisMonthCompleted: 'Due Thismonth Completed',
    dueNextMonth: 'Due Next Month',
    dueNextMonthServiced: 'Due Next Month Serviced',
    dueNextMonthCompleted: 'Due Next Month Completed',
    dueNext30Days: 'Due Next 30Days',
    dueNext30DaysServiced: 'Due Next30Days Serviced',
    dueNext30DaysCompleted: 'dueNext30DaysCompleted',
    servicedOnTime: 'Serviced Ontime',
    servicedLate: 'Serviced Late',
    servicedOnTimeDeadline: 'Serviced Ontime Deadline',
    servicedLateDeadline: 'Serviced Late deadline',
    servicedOnTimePercent: 'Serviced Ontime Percent',
    deadlineOnTimePercent: 'Deadline Ontime Percent'

  }
  servicePortalAccess: any = [];
  clearBtn: string = "Reset";
  public dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  checkFirstLevel: any = [];


  constructor(
    private alertService: AlertService,
    private helperService: HelperService,
    private servicePortalService: ServicePortalService,
    private chRef: ChangeDetectorRef,
    private loaderService: LoaderService,
    private sharedServie: SharedService,
    private router: Router,

  ) { }

  ngOnInit() {
    //update notification on top
    this.helperService.updateNotificationOnTop();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getMgmDateMethod();
    setTimeout(() => {
      this.subs.add(
        this.sharedServie.servicePortalObs.subscribe(data => {
          this.servicePortalAccess = data;
          setTimeout(() => {
            if (this.servicePortalAccess.indexOf('Management Tab') === -1) {
              this.router.navigate(['/dashboard'])
            }
          }, 2000);
        })
      )
    }, 1500);

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.mgmtData = [];
      this.filterMgmtTblBydate();
    }
  }

  getMgmDateMethod() {
    this.subs.add(
      this.servicePortalService.GetSystemDefaultDate().subscribe(
        data => {
          this.managementFilterParam.startDate = this.helperService.ngbDatepickerFormat(data.data.startDate);
          this.managementFilterParam.endDate = this.helperService.ngbDatepickerFormat(data.data.endDate);
          this.filterMgmtTblBydate();
        }
      )
    )
  }

  filterMgmtTblBydate() {
    let startDateObj = this.managementFilterParam.startDate;
    let endDateObj = this.managementFilterParam.endDate;
    if (startDateObj == "" || startDateObj == null) {
      this.alertService.error("Please enter start date to filter.")
      return
    } else if (endDateObj == "" || endDateObj == null) {
      this.alertService.error("Please enter end date to filter.")
      return
    } else {
      if (typeof startDateObj !== 'object') {
        this.managementFilterParam.startDate = startDateObj = this.helperService.setNgbDate2(startDateObj)
      }
      if (typeof endDateObj !== 'object') {
        this.managementFilterParam.endDate = endDateObj = this.helperService.setNgbDate2(endDateObj)
      }
      if (!this.helperService.checkValidDate(startDateObj) || !this.helperService.checkValidDate(endDateObj)) {
        this.alertService.error("Please enter valid date.");
        return
      }
    }

    let startDate = `${startDateObj.year}-${this.helperService.zeorBeforeSingleDigit(startDateObj.month)}-${this.helperService.zeorBeforeSingleDigit(startDateObj.day)}`;
    let endDate = `${endDateObj.year}-${this.helperService.zeorBeforeSingleDigit(endDateObj.month)}-${this.helperService.zeorBeforeSingleDigit(endDateObj.day)}`;
    let filterParam = { startDate: startDate, endDate: endDate, userId: this.currentUser.userId };

    this.getSIMManagementSummury(filterParam);
  }

  setDisplayLevelForManagement(val: number) {
    this.managementFilterParam.displayLevelNo = val;
    const tempObj = this.mgmtData
    this.mgmtData = [];
    // $('.expanderLvl').removeClass('expander closeExpander');
    this.loaderService.show();
    setTimeout(() => {
      this.mgmtData = tempObj;
      this.loaderService.hide();
      this.checkRendartable();
    }, 800);

    // this.loaderService.show();
    // this.managementFilterParam.displayLevelNo = val;
    // setTimeout(() => {
    //   this.mgmTable.setDisplayLevel(this.managementFilterParam.displayLevelNo);
    //   setTimeout(() => {
    //     this.loaderService.hide();
    //   }, 1500);
    // }, 400);

  }

  getlevel(level) {
    return parseFloat(level) + parseFloat("1");
  }

  getlevelId(item, index, el) {
    let lvl = parseFloat(item.levelName) + parseFloat("1");
    let cont = item.contractor == "" ? "first" : item.contractor
    let str = `${lvl}_${index}_${cont}`;
    return str;
  }

  callbackMethod(arr: any, i: any = null) {
    arr.forEach((element, k) => {
      let child = element.childLayers
      delete element.childLayers;

      // check if multiple first level exists thne empty the array
      if (element.levelName == 0) {
        this.checkFirstLevel.push(element.levelName);
        if (this.checkFirstLevel.length > 1) {
          this.mgmtData = [];
          this.mgmFilters.serviceType = [];
          this.mgmFilters.serviceTypeObj = [];
          this.mgmFilters.contractor = [];
          this.mgmFilters.contractorObj = [];
          this.mgmFilters.contract = [];
          this.mgmFilters.contractObj = [];
        }
      }

      this.mgmtData.push(element);
      if (element.serviceType != "" && this.mgmFilters.serviceType.indexOf(element.serviceType) === -1) {
        this.mgmFilters.serviceType.push(element.serviceType);
        this.mgmFilters.serviceTypeObj.push({ item_id: element.serviceType, item_text: element.serviceType })
      }

      if (element.contractor != "" && this.mgmFilters.contractor.indexOf(element.contractor) === -1) {
        this.mgmFilters.contractor.push(element.contractor);
        this.mgmFilters.contractorObj.push({ item_id: element.contractor, item_text: element.contractor })
      }

      if (element.contract != "" && this.mgmFilters.contract.indexOf(element.contract) === -1) {
        this.mgmFilters.contract.push(element.contract);
        this.mgmFilters.contractObj.push({ item_id: element.contract, item_text: element.contract })
      }

      // create group of data according to level 2 start
      if (element.levelName == 1) {
        this.mgmDataByLvl[i] = [];
        this.mgmDataByLvl[i]['data'] = [];
        this.mgmDataByLvl[i]['children'] = [];
        this.mgmDataByLvl[i]['data'] = element;
        i++;
      } else if (element.levelName != 1 && element.levelName != 0) {
        this.mgmDataByLvl[i - 1]['children'].push(element);
      }
      // create group of data according to level 2 end
      if (child) {
        this.callbackMethod(child, i);
      }
    });
  }

  getSIMManagementSummury(filterParam) {
    this.subs.add(
      this.servicePortalService.getSIMManagementSummury(filterParam).subscribe(
        data => {
          if (data.isSuccess) {
            let tempData = data.data;
            // console.log(tempData);
            this.callbackMethod(tempData, 0);
            this.actualMgmtData = this.mgmtData;
            // console.log(this.actualMgmtData);
            // console.log(this.mgmDataByLvl);
            this.checkRendartable();
            // $('table').on('scroll', function () {
            //   console.log('fsfd');
            //   $("table > *").width($("table").width() + $("table").scrollLeft());
            // });
            //console.log(this.mgmDataByLvl)
            // this.renderTable();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

  }

  checkRendartable() {
    setTimeout(() => {
      $('#mgmtTable').on('scroll', function () {
        $("#mgmtTable tbody").css({ 'overflow-y': 'hidden' });
        setTimeout(() => {
          $("#mgmtTable tbody").css({ 'overflow-y': 'scroll' });
        }, 100);
        $("#mgmtTable > *").width($("#mgmtTable").width() + $("#mgmtTable").scrollLeft());
      });
    }, 5);
    this.chRef.markForCheck();
  }

  // renderTable() {
  //   if (this.mgmtData.length > 1) {
  //     this.loaderService.show();
  //     this.loadEmptyTable = false;
  //     this.chRef.detectChanges();
  //     setTimeout(() => {
  //       this.mgmTable = $('#mgmtTable').tabelize({
  //         /*onRowClick : function(){
  //           alert('test');
  //         }*/
  //         fullRowClickable: true,
  //         onReady: function () {
  //           //console.log('ready');
  //         },
  //         onBeforeRowClick: function () {
  //           //console.log('onBeforeRowClick');
  //         },
  //         onAfterRowClick: function (d) {
  //           //console.log(d);
  //         },
  //       });

  //       if (!this.defaultDisplay) {
  //         setTimeout(() => {
  //           this.mgmTable.setDisplayLevel(this.managementFilterParam.displayLevelNo);
  //           setTimeout(() => {
  //             this.loaderService.hide();
  //           }, 1500);
  //         }, 5);
  //       } else {
  //         this.defaultDisplay = false;
  //         this.loaderService.hide();
  //       }

  //     }, 10);

  //   } else {
  //     this.loadEmptyTable = true;
  //   }
  // }


  search($event) {
    this.mgmtData = [];
    setTimeout(() => {
      this.filterMgmtTblByColumn();
    }, 500);

  }

  checkIsNull(string) {
    if (string != null && string != "") { return string.toLowerCase(); }
    return false;
  }


  filterMgmtTblByColumn() {
    this.loaderService.show();
    if (Object.keys(this.mgmDataByLvl).length > 0) {
      if (this.mgmFltrCol.contractor.length == 0 && this.mgmFltrCol.contract.length == 0 && this.mgmFltrCol.serviceType.length == 0
      ) {
        this.clearFilter();
      } else {
        let tempArr = [];
        let concateArr = [];
        for (const key in this.mgmDataByLvl) {
          if (this.mgmDataByLvl.hasOwnProperty(key)) {
            const element = this.mgmDataByLvl[key];
            if ((this.mgmFltrCol.contractor != null && this.mgmFltrCol.contractor.some(x => x.item_id == element.data.contractor))
              || (this.mgmFltrCol.contract != null && this.mgmFltrCol.contract.some(x => x.item_id == element.data.contract))
              || (this.mgmFltrCol.serviceType != null && this.mgmFltrCol.serviceType.indexOf(x => x.item_id == element.data.serviceType))
            ) {
              tempArr.push(element);
              continue;
            } else {
              if (element.children.length > 0) {
                for (const childrenKey in element.children) {
                  if (element.children.hasOwnProperty(childrenKey)) {
                    const childElement = element.children[childrenKey];
                    if ((this.mgmFltrCol.contractor != null && this.mgmFltrCol.contractor.some(x => x.item_id == childElement.contractor))
                      || (this.mgmFltrCol.contract != null && this.mgmFltrCol.contract.some(x => x.item_id == childElement.contract))
                      || (this.mgmFltrCol.serviceType != null && this.mgmFltrCol.serviceType.some(x => x.item_id == childElement.serviceType))
                    ) {
                      tempArr.push(element);
                      break;
                    }
                  }
                }
              }
            }
          }
        }




        if (tempArr.length > 0) {
          concateArr.push(this.actualMgmtData[0]);
        }

        tempArr.forEach(temEl => {
          concateArr.push(temEl.data);
          temEl.children.forEach(childEl => {
            concateArr.push(childEl);
          });
        });

        this.mgmtData = concateArr;
        this.checkRendartable();
      }

      setTimeout(() => {
        //this.renderTable();
        this.loaderService.hide();
      }, 500);
    }

  }

  // filterChildren(data, filters) {
  //   let levelGrp = [];
  //   if ((this.mgmFltrCol.contractor != null && this.mgmFltrCol.contractor.indexOf(data.data.contractor) !== -1) && this.mgmFltrCol.contract == null && this.mgmFltrCol.serviceType == null) {
  //     levelGrp.push(data.data);
  //   }

  //   for (const childrenKey in data.children) {
  //     if (data.children.hasOwnProperty(childrenKey)) {
  //       const childElement = data.children[childrenKey];
  //     }
  //   }

  //   // if ((this.mgmFltrCol.contractor != null && this.mgmFltrCol.contractor.indexOf(element.data.contractor) !== -1)
  //   //   || (this.mgmFltrCol.contract != null && this.mgmFltrCol.contract.indexOf(element.data.contract) !== -1)
  //   //   || (this.mgmFltrCol.serviceType != null && this.mgmFltrCol.serviceType.indexOf(element.data.serviceType) !== -1)

  //   // ) {
  //   //   tempArr.push(element);
  //   //   continue;
  //   // }


  // }

  exportToExcel(fileExt, rowSelection = null): void {
    const exportData = this.mgmtData;
    this.helperService.exportAsExcelFile(exportData, 'Management', this.mgmGridLable)
  }

  exportView() {
    let tempArr = [];
    let comp = this;
    $("#mgmtTable").find('tr').each(function () {
      let $row = $(this);
      if (!$row.hasClass('header')) {
        let index = $row.data('index');
        if (index === 0) {
          if (comp.mgmtData[parseInt(index)] != undefined) {
            console.log(2)
            tempArr.push(comp.mgmtData[parseInt(index)]);
          }
        } else {
          if ($row.css('display') != 'none') {
            tempArr.push(comp.mgmtData[parseInt(index)]);
          }
        }
      }
    });
    
    this.helperService.exportAsExcelFile(tempArr, 'Management', this.mgmGridLable)
  }

  // exportView() {
  //   let tempArr = [];
  //   let comp = this;
  //   $("#mgmtTable").find('tr').each(function () {
  //     let $row = $(this);
  //     let $prevRow = $(this).prev("tr");
  //     if (!$row.hasClass('header')) {
  //       let index = $row.data('index');
  //       if (index === 0) {
  //         if (comp.mgmtData[parseInt(index)] != undefined) {
  //           tempArr.push(comp.mgmtData[parseInt(index)]);
  //         }
  //       } else {
  //         let currLvl = $row.data('level');
  //         let prevLvl = parseInt(currLvl) - 1;
  //         let $closestParentLvl = $row.prevAll("tr.l" + prevLvl + ":first");
  //         if ($row.hasClass("expanded") || $closestParentLvl.hasClass("expanded")) {
  //           tempArr.push(comp.mgmtData[parseInt(index)]);
  //         }
  //       }
  //       //console.log($row.data('index'))
  //     }
  //   });
  //   this.helperService.exportAsExcelFile(tempArr, 'Management', this.mgmGridLable)
  //   //console.log(tempArr);
  // }

  clearFilter() {
    this.mgmtData = [];
    this.mgmFltrCol = {
      contractor: [],
      contract: [],
      serviceType: [],
    }
    this.loaderService.show();
    setTimeout(() => {
      this.mgmtData = this.actualMgmtData;
      this.checkRendartable();
      //this.renderTable();
      this.loaderService.hide();
    }, 200);

    // setTimeout(() => {
    //   this.loaderService.hide();
    // }, 1500);
  }

  clearDateFilter() {
    this.managementFilterParam.startDate = null;
    this.managementFilterParam.endDate = null;
    this.mgmtData = [];
    setTimeout(() => {
      this.getMgmDateMethod();
      // const dateFilter = { startDate: this.managementFilterParam.startDate, endDate: this.managementFilterParam.endDate, userId: this.currentUser.userId };
      // this.getSIMManagementSummury(dateFilter);
    }, 200);
  }

  gotoAsset(item: any) {
    let startDateObj = this.managementFilterParam.startDate;
    let endDateObj = this.managementFilterParam.endDate;
    let startDate = `${startDateObj.year}-${this.helperService.zeorBeforeSingleDigit(startDateObj.month)}-${this.helperService.zeorBeforeSingleDigit(startDateObj.day)}`;
    let endDate = `${endDateObj.year}-${this.helperService.zeorBeforeSingleDigit(endDateObj.month)}-${this.helperService.zeorBeforeSingleDigit(endDateObj.day)}`;
    let startDateTime = new Date(startDate);
    let endDateTime = new Date(endDate);

    const assetFilterObj = {
      setCode: item.setCode,
      conCode: item.conCode,
      secoCode: item.secoCode,
      sesCode: item.sesCode,
      contractor: item.contractor,
      contract: item.contract,
      serviceType: item.serviceType,
      serviceStage: item.serviceStage,
      startDate: startDateTime,
      endDate: endDateTime
    }

    localStorage.setItem('assetFilterObj', JSON.stringify(assetFilterObj));
    let url = `${window.location.origin}/rowanwood/asset-list?servicing=true`;
    //let url = `${window.location.origin}/asset-list?servicing=true`; // for local
    window.open(url, "_blank");
  }


  public onItemSelect(item: any) {
    //console.log(item, this.mgmFltrCol.contractor);
    //this.selectedUsersToMail.push(item);
  }

  public onSelectAll(items: any) {
    //this.selectedUsersToMail = items;
  }

  public onItemDeSelect(item: any) {
    //this.selectedUsersToMail = this.selectedUsersToMail.filter(x => x.item_id != item.item_id);
  }

  public onItemDeSelectAll(items: any) {
    //this.selectedUsersToMail = items;
  }


  openSearchBar() {
    let scrollTop = $('.layout-container').height();
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

  trackByFunction(index, item) {
    return index;
  }

  setStyles(lvlNo: number, elm) {
    if (this.managementFilterParam.displayLevelNo == 1) {
      if (lvlNo == 0) {
        return { 'display': '' }
      } else {
        return { 'display': 'none' }
      }
    } else if (this.managementFilterParam.displayLevelNo == 2) {
      if (lvlNo == 0 || lvlNo == 1) {
        return { 'display': '' }
      } else {
        return { 'display': 'none' }
      }
    } else if (this.managementFilterParam.displayLevelNo == 3) {
      if (lvlNo == 0 || lvlNo == 1 || lvlNo == 2) {
        return { 'display': '' }
      } else {
        return { 'display': 'none' }
      }
    } else if (this.managementFilterParam.displayLevelNo == 4) {
      if (lvlNo == 0 || lvlNo == 1 || lvlNo == 2 || lvlNo == 3) {
        return { 'display': '' }
      } else {
        return { 'display': 'none' }
      }
    } else if (this.managementFilterParam.displayLevelNo == 5) {
      return { 'display': '' }
    }

  }


  getClass(lvlNo: number) {
    if (lvlNo == 4) {
      return "string";
    }

    if (this.managementFilterParam.displayLevelNo == 1) {
      return false;
    } else if (this.managementFilterParam.displayLevelNo == 2) {
      if (lvlNo == 0) {
        return true;
      } else {
        return false;
      }
    } else if (this.managementFilterParam.displayLevelNo == 3) {
      if (lvlNo == 0 || lvlNo == 1) {
        return true;
      } else {
        return false;
      }
    } else if (this.managementFilterParam.displayLevelNo == 4) {
      if (lvlNo == 0 || lvlNo == 1 || lvlNo == 2) {
        return true;
      } else {
        return false;
      }
    } else if (this.managementFilterParam.displayLevelNo == 5) {
      return true;
    }
  }

  getExpanderStyle(lvlNo: number) {
    if (lvlNo == 0) {
      return { 'margin-left': '10px' }
    } else if (lvlNo == 1) {
      return { 'margin-left': '30px' }
    } else if (lvlNo == 2) {
      return { 'margin-left': '60px' }
    } else if (lvlNo == 3) {
      return { 'margin-left': '90px' }
    } else if (lvlNo == 4) {
      return { 'margin-left': '120px' }
    }
  }

  expandChild(elem: any) {
    const tr = $(elem);
    const currentLvl = $(elem).attr('data-level');
    const expanderLvl = $(elem).find('.expanderLvl')
    if ($(elem).find('.expander').length == 1) {
      expanderLvl.removeClass('expander')
      expanderLvl.addClass('closeExpander')
      this.showNextLvl(tr, currentLvl, false);
    } else {
      expanderLvl.removeClass('closeExpander')
      expanderLvl.addClass('expander')
      this.showNextLvl(tr, currentLvl, true);
    }

  }

  showNextLvl(elm, currentLvl, show) {
    const nextLvl = parseFloat(currentLvl) + parseFloat('1');
    const nextElm = elm.next('tr');
    const expanderLvl = $(elm).find('.expanderLvl')
    const thislvl = $(elm).attr('data-level');
    if (nextElm.attr('data-level') > currentLvl) {
      if (nextElm.attr('data-level') == nextLvl) {
        if (show) {
          //nextElm.show();
          nextElm.css({ 'display': '' })
        } else {
          //nextElm.hide();
          if (thislvl != 5) {
            expanderLvl.removeClass('expander')
            expanderLvl.addClass('closeExpander')
          }
          nextElm.css({ 'display': 'none' })
        }
        this.showNextLvl(nextElm, currentLvl, show)
      } else {
        if (thislvl != 5) {
          expanderLvl.removeClass('expander')
          expanderLvl.addClass('closeExpander')
        }
        nextElm.css({ 'display': 'none' })
        this.showNextLvl(nextElm, currentLvl, show)
      }
    } else {
      return false;
    }
  }


}
