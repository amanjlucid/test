import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowClassArgs } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, SharedService } from '../../_services'
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})

export class TasksComponent implements OnInit {
  plannedDateModel: NgbDateStruct;
  plannedDate: { year: number, month: number };

  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  allowUnsort = true;
  multiple = false;
  gridView: DataResult;
  checkboxOnly = false;
  mode: any = 'multiple';
  mySelection: number[] = [];
  selectableSettings: SelectableSettings;
  selectedEvent: any = [];
  touchtime = 0;
  currentUser: any;
  hideComplete = true;
  assignedTome = false;
  userEventList: any
  seqIds = "";
  taskDetails: boolean = false;
  taskData: boolean = false;
  loading = true
  assignedToOther = false;
  plannedDatewindow = false;
  taskSecurityList: any = [];

  constructor(
    private eveneManagerService: EventManagerService,
    private activeRoute: ActivatedRoute,
    private alertService: AlertService,
    private helperService: HelperService,
    private calendar: NgbCalendar,
    private sharedService: SharedService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.setSelectableSettings();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.subs.add(
      this.activeRoute.queryParams.subscribe(params => {
        if (params.seq != undefined) {
          this.seqIds = params.seq;
        }
        // console.log(this.seqIds);
        this.getUserEventsList(this.currentUser.userId, this.hideComplete);

      })
    )

    // this.subs.add(
    //   this.sharedService.taskPortalSecList.subscribe(
    //     data => {
    //       this.taskSecurityList = data;
    //       // console.log(this.taskSecurityList);
    //     }
    //   )
    // )

  }


  ngAfterViewInit() {
    this.subs.add(
      this.sharedService.taskPortalSecList.subscribe(
        data => {
          this.taskSecurityList = data;
          if (this.taskSecurityList.length > 0) {
            this.sharedService.modulePermission.subscribe(
              modules => {
                if (modules.length > 0) {
                  if (this.taskSecurityList.indexOf("Manage User Events") == -1 || modules.indexOf("Event Manager Portal Access") == -1) {
                    //this.alertService.error("You have no access to configuration")
                    this.router.navigate(['/dashboard']);
                  }
                }
              }
            )
          }

        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      mode: this.mode
    };
  }

  groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    setTimeout(() => {
      this.gridView = process(this.userEventList, this.state);
    }, 100);
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.userEventList, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.userEventList, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (this.mySelection.length > 0) {
      this.selectedEvent = this.userEventList.filter(x => this.mySelection.indexOf(x.eventSequence) !== -1);

      if (this.selectedEvent.length == 1) {
        if (this.touchtime == 0) {
          // set first click
          this.touchtime = new Date().getTime();
        } else {
          // compare first click to this click and see if they occurred within double click threshold
          if (((new Date().getTime()) - this.touchtime) < 400) {
            if (columnIndex > 1) {
              this.openTaskData(dataItem, 'single')
            }

            this.touchtime = 0;
          } else {
            // not a double click so set as a new first click
            this.touchtime = new Date().getTime();
          }
        }
      }
    }
  }

  onSelectedKeysChange($event) {
    // console.log(this.mySelection)
  }

  getUserEventsList(userId, hideComplete) {
    this.subs.add(
      this.eveneManagerService.getListOfUserEventByUserId(userId, hideComplete).subscribe(
        data => {
          if (data.isSuccess) {
            // console.log(data)
            this.userEventList = data.data;
            if (this.seqIds != "") {
              let seqArr = this.seqIds.split(",");
              if (seqArr.length > 0) {
                this.userEventList = this.userEventList.filter(x => seqArr.indexOf(x.eventSequence.toString()) !== -1)
              }
            }
            this.gridView = process(this.userEventList, this.state);
            this.loading = false;
          }
        }
      )
    )
  }

  hideCompletedFilter($event) {
    this.hideComplete = !this.hideComplete;
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }

  assignedTomeFilter($event) {
    this.assignedTome = !this.assignedTome;
    if (this.assignedTome) {
      this.userEventList = this.userEventList.filter(x => {
        if (x.eventAssignUser == this.currentUser.userId || x.eventStatus == "A") {
          return x;
        }
      })

      this.gridView = process(this.userEventList, this.state);

    } else {
      this.getUserEventsList(this.currentUser.userId, this.hideComplete);
    }

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

  clearFilter() {
    this.seqIds = "";
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }

  openTaskDetails(item = null, single = null) {
    if (single == "single") {
      this.selectedEvent = [];
      this.selectedEvent.push(item)
    }

    if (this.selectedEvent.length > 0) {
      $('.taskOvrlay').addClass('ovrlay');
      this.taskDetails = true;
    } else {
      this.alertService.error("Please select atleast one row first.")
    }

  }

  closeTaskDetails(eve) {
    $('.taskOvrlay').removeClass('ovrlay');
    this.taskDetails = eve;
    this.resetSelection();
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }

  resetSelection() {
    this.mySelection = [];
    this.selectedEvent = [];
  }


  openTaskData(item = null, single = null) {
    if (single = "single") {
      this.selectedEvent = [];
      this.selectedEvent.push(item);
    }

    if (this.selectedEvent.length > 0) {
      $('.taskOvrlay').addClass('ovrlay');
      this.taskData = true;
    } else {
      this.alertService.error("Please select atleast one row first.")
    }
  }

  closeTaskData(eve) {
    $('.taskOvrlay').removeClass('ovrlay');
    this.taskData = eve;
    this.resetSelection();
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }


  setToComplete() {
    if (this.selectedEvent.length > 0) {
      if (this.selectedEvent.length == 1) {
        if (this.selectedEvent[0].eventProcessedCount != this.selectedEvent[0].eventRowCount) {
          return
        }
      }

      let failsData = [];
      let successData = [];
      let req = [];
      for (let userevent of this.selectedEvent) {
        if (userevent.eventAssignUser == this.currentUser.userId) {
          if (userevent.eventProcessedCount == userevent.eventRowCount) {
            successData.push(userevent.eventSequence);
            req.push(this.eveneManagerService.markComplete(userevent.eventSequence, this.currentUser.userId));
          } else {
            failsData.push(`Event number: ${userevent.eventSequence} has unprocessed data records and can not be completed \n`)
          }
        } else {
          if (userevent.eventAssignUser == "") {
            failsData.push(`Event number: ${userevent.eventSequence} must have been assigned before being set to complete \n`)
          } else {
            failsData.push(`Event number: ${userevent.eventSequence} can only be completed by user ${userevent.eventAssignUserName} \n`)
          }
        }
      }

      if (successData.length > 0) {
        this.subs.add(
          forkJoin(req).subscribe(
            data => {
              // console.log(data);
              this.resetSelection()
              this.alertService.success(`Task number ${successData.join(",")} updated successfully.`)
              this.getUserEventsList(this.currentUser.userId, this.hideComplete);
            }
          )
        )
      } else {
        this.alertService.error(failsData.join("\n"));
      }

    }
  }



  export() {
    if (this.userEventList.length != undefined && this.userEventList.length > 0) {
      let tempData = this.userEventList;
      let label = {
        'eventSequence': 'Seq',
        'busareaName': 'Business Area',
        'eventTypeCode': 'Code',
        'eventTypeDesc': 'Event',
        'eventRowCount': 'Record(s)',
        'eventProcessedCount': 'Processed %',
        'eventCreatedDate': 'Created',
        'eventStatusName': 'Status',
        'eventEscStatusName': 'Esc',
        'eventSevTypeName': 'Severity',
        'eventAskTypeName': 'Action',
        'eventAssignUserName': 'Assigned To',
        'eventPlannedDate': 'Planned',
        'eventCreatedBy': 'Created By',
        'eventUpdatedBy': 'Updated By',
        'eventUpdateDate': 'Updated',

      }

      this.helperService.exportAsExcelFile(tempData, 'Tasks', label)

    } else {
      alert('There is no record to import');
    }
  }


  assignToMe(item = null, single = null) {
    if (single == "single") {
      this.selectedEvent = [];
      this.selectedEvent.push(item)
    }

    if (this.selectedEvent.length > 0) {
      let failsData = [];
      let successData = [];
      let req = [];
      for (let userEvent of this.selectedEvent) {
        if (userEvent.eventAssignUser == "") {
          successData.push(userEvent.eventSequence);
          req.push(this.eveneManagerService.assignToMe(userEvent.eventSequence, this.currentUser.userId))
        } else {
          if (userEvent.eventAssignUser != "" && userEvent.eventAssignUser == this.currentUser.userId) {
            failsData.push(`Event number: ${userEvent.eventSequence} is already assigned to me \n`)
          } else if (userEvent.eventAssignUser != "" && userEvent.eventAssignUser != this.currentUser.userId) {
            failsData.push(`Event number: ${userEvent.eventSequence} has already been assigned to another user: ${userEvent.eventAssignUserName} \n`)
          }
        }
      }

      if (successData.length > 0) {
        this.subs.add(
          forkJoin(req).subscribe(
            data => {
              // console.log(data);
              this.resetSelection()
              this.alertService.success(`Task number ${successData.join(",")} updated successfully.`)
              this.getUserEventsList(this.currentUser.userId, this.hideComplete);
            }
          )
        )
      } else {
        this.alertService.error(failsData.join("\n"));
      }
    }

  }


  assignToOther(item = null, single = null) {
    if (single = "single") {
      this.selectedEvent = [];
      this.selectedEvent.push(item);
    }

    if (this.selectedEvent.length > 0) {
      this.assignedToOther = true;
      $('.taskOvrlay').addClass('ovrlay');
    } else {
      this.alertService.error("Please select atleast one row first.")
    }
  }


  closeAssignedTo($event) {
    this.assignedToOther = $event;
    $('.taskOvrlay').removeClass('ovrlay');
  }


  reloadTasks($event) {
    this.resetSelection();
    this.getUserEventsList(this.currentUser.userId, this.hideComplete);
  }

  setPlanned() {
    if (this.selectedEvent.length > 0) {
      this.plannedDatewindow = true
      this.plannedDateModel = this.calendar.getToday();
      $('.taskOvrlay').addClass('ovrlay');
    }
  }

  closePlaneedDate() {
    this.plannedDatewindow = false;
    $('.taskOvrlay').removeClass('ovrlay');
  }

  savePlannedDate(set = true) {
    if (this.selectedEvent.length > 0) {
      let plannedDate = '1753-01-01';
      if (set) {
        plannedDate = `${this.plannedDateModel.year}-${this.plannedDateModel.month}-${this.plannedDateModel.day}`;
      }

      let req = [];
      let successRecord = [];
      for (let userEvent of this.selectedEvent) {
        successRecord.push(userEvent.eventSequence)
        req.push(this.eveneManagerService.plannedDate(userEvent.eventSequence, plannedDate, this.currentUser.userId));
      }

      if (req.length > 0) {
        this.subs.add(
          forkJoin(req).subscribe(
            data => {
              // console.log(data);
              let msg = '';
              if (successRecord.length > 1) {
                msg = `Event Number ${successRecord.toString()} are updated.`;
              } else {
                msg = `Event Number ${successRecord.toString()} is updated.`;
              }

              this.alertService.success(msg);
              this.closePlaneedDate();
              this.reloadTasks(true)
            }
          )
        )
      }
    }

  }


  // roundoff(dataItem) {
  //   //((dataItem.eventProcessedCount/dataItem.eventRowCount) * 100)
  //   let input = ((dataItem.eventProcessedCount / dataItem.eventRowCount) * 100);
  //   return Math.round(input);
  // }


  rowCallback(context: RowClassArgs) {
    if (context.dataItem.eventNotifyStatus == "N") {
      return {
        taskUnreadRow: true,
      }
    } else {
      return {
        taskUnreadRow: false,
      }
    }
  }


  setSeletedRow(dataItem) {
    this.mySelection = [];
    this.selectedEvent = [];
    this.mySelection.push(dataItem.eventSequence)
    this.selectedEvent.push(dataItem)
  }




}
