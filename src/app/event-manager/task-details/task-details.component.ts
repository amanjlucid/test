import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, EventService } from '../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [{ field: 'busAreaDesc' }],
    filter: {
      logic: "and",
      filters: []
    }
  }
  tempstate: State = {
    skip: 0,
    sort: [],
    group: [{ field: 'busAreaDesc' }],
    filter: {
      logic: "and",
      filters: []
    }
  }

  allowUnsort = true;
  multiple = false;
  public gridView: DataResult;
  pageSize = 25;
  taskDetails: any;
  taskDetailsTemp: any
  selectedEvent: any = [];
  touchtime = 0;
  paramsWindow = false;
  notifyWindow = false;
  public checkboxOnly = false;
  public mode: any = 'multiple';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  currentUser: any;
  editEvent: boolean = false;
  eventPeriod = ['Daily', 'Weekly', 'Monthly'];
  loading = true
  taskSecurityList: any = [];
  editType = 'edit';
  addEventWin = false;
  checkUserEvents: boolean = true;

  constructor(
    private eventManagerService: EventManagerService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private router: Router,
    private helper: HelperService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.setSelectableSettings();
    this.getEventData();
    //update notification on top
    this.helper.updateNotificationOnTop();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
                  if (this.taskSecurityList.indexOf("Manage Event Types") == -1 || modules.indexOf("Event Manager Portal Access") == -1) {
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


  distinctPrimitive(fieldName: string): any {
    return distinct(this.taskDetails, fieldName).map(item => {
      return { val: item[fieldName], text: item[fieldName] }
    });
  }

  getEventData() {
    this.subs.add(
      this.eventManagerService.getEventTypeList().subscribe(
        data => {
          if (data.isSuccess) {

            let tempData = data.data;
            tempData.map(s => {
              s.eventLastRunDate = new Date(s.eventLastRunDate);
              s.eventNextRunDate = new Date(s.eventNextRunDate);
              s.eventTypeCreatedDate = new Date(s.eventTypeCreatedDate);
              s.eventTypeUpdatedDate = new Date(s.eventTypeUpdatedDate);
             });

            this.taskDetails = tempData;
            this.taskDetailsTemp = Object.assign([], data.data);

            // this.taskDetailsTemp = data.data.slice(this.state.skip, 30) // remove it
            // this.taskDetailsTemp =  Object.assign([], this.taskDetails);  // remove it

            this.gridView = process(this.taskDetailsTemp, this.state);
            this.loading = false;


          }
        }
      )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    setTimeout(() => {
      this.gridView = process(this.taskDetailsTemp, this.state);
    }, 100);
  }


  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.taskDetailsTemp, this.state);
  }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.taskDetailsTemp, this.state);

  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.checkUserEvents = true;
    if (this.mySelection.length > 0) {
      this.selectedEvent = this.taskDetails.filter(x => this.mySelection.indexOf(x.eventTypeCode) !== -1);
      for (let selectedEve of this.selectedEvent) {
        if (selectedEve.busAreaCode == "USER EVENT" && this.mySelection.length == 1) {
          this.checkUserEvents = true;
        } else {
          this.checkUserEvents = false;
        }
      }

      if (this.selectedEvent.length == 1) {
        if (this.touchtime == 0) {
          // set first click
          this.touchtime = new Date().getTime();
        } else {
          // compare first click to this click and see if they occurred within double click threshold
          if (((new Date().getTime()) - this.touchtime) < 400) {
            if (columnIndex == 1) {
              if(this.taskSecurityList.indexOf('Parameters') != -1){
              this.openParamsWindow();
              }
            } else if (columnIndex == 2) {
              if(this.taskSecurityList.indexOf('Notify') != -1){
              this.opneNotifyWindow();
              }
            } else {
              if(this.taskSecurityList.indexOf('Edit') != -1){
              this.editEventMethod();
            }
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

  openParamsWindow() {
    $('.taskDetails').addClass('ovrlay');
    this.paramsWindow = true;
  }

  closeEventparamWindow($event) {
    this.getEventData();
    $('.taskDetails').removeClass('ovrlay');
    this.paramsWindow = $event;
  }

  // pageChange(event: PageChangeEvent): void {
  //   this.state.skip = event.skip;
  //   this.gridView = {
  //     data: this.taskDetails.slice(this.state.skip, this.state.skip + this.pageSize),
  //     total: this.taskDetails.length
  //   };
  // }

  // resetGrid() {
  //   this.state.skip = 0;
  // }

  renderGrid(tempGrid: any, timer = 20) {
    setTimeout(() => {
      this.gridView = process(tempGrid.data, this.state)
      // this.chRef.detectChanges();
    }, timer);
  }

  opneNotifyWindow() {
    $('.taskDetails').addClass('ovrlay');
    this.notifyWindow = true;
  }

  closeNotifyWindow($event) {
    this.getEventData();
    $('.taskDetails').removeClass('ovrlay');
    this.notifyWindow = $event;
  }

  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      mode: this.mode
    };
  }

  public onSelectedKeysChange(e) {
    const len = this.mySelection.length;
  }

  runEvent() {

    if (this.taskSecurityList.indexOf('Run') == -1) {
      return
    }

    if (this.selectedEvent.length > 0) {
      let req = [];
      let eventTypeSequences: Int32Array[] = [];
      let checkManual = false;
      let InactiveSelected = false;
      for (let eve of this.selectedEvent) {
        if (eve.eventTypeStatus == "S") {
          checkManual = true
        } else {
          if (eve.eventTypeStatus != "I"){
          req.push(this.eventManagerService.runEvent(eve.eventTypeSequence, this.currentUser.userId));
            eventTypeSequences.push(eve.eventTypeSequence);
          }
          else
          {
            InactiveSelected = true
          }
        }
      }

      if (InactiveSelected) {
        this.alertService.error("In-Active events cannot be run.")
        return
      }

      if (checkManual) {
        this.alertService.error("System events cannot run manually.")
        return
      }

      let params = {
        EventTypeSequences: eventTypeSequences
      }

      this.eventManagerService.ValidateRunEvent(params).subscribe(
        data => {
          if (data.isSuccess) {
      this.alertService.success(`${this.selectedEvent.length} task(s) running in background.`);

      forkJoin(req).subscribe(
        data => {
          this.helper.updateNotificationOnTop();
          this.alertService.destroyAlert();
          if (data.length > 0) {
            let runevents: any = data;
            // console.log(runevents);
            let successStr = [];
            for (let runevent in runevents) {
              let rowStr = runevents[runevent].data > 1 ? "rows" : "row";
              if (runevents[runevent].data < 0) {
                successStr.push(` ${this.selectedEvent[runevent].eventTypeCode} : Event failed to run, check the process log for details.`);
              } else {
                successStr.push(` ${this.selectedEvent[runevent].eventTypeCode} : ${this.selectedEvent[runevent].eventTypeName} : ${runevents[runevent].data} ${rowStr} identified.`);
              }

            }

            setTimeout(() => {
              //update notification on top
              this.helper.updateNotificationOnTop();
              // this.subs.add(
              //   this.notificationService.eventSummary(this.currentUser.userId).subscribe(
              //     notification => {
              //       this.sharedService.changeUserNotification(notification.data)
              //     }
              //   )
              // )

              // alert message after task run
              this.alertService.success(successStr.toString(), true, 1000000);
            }, 1000);

          }

        }
      )
    }
          else
          {
            this.alertService.error(data.message)
          }
        }
      )
    }
  }

  copyEvent() {
    if (this.selectedEvent.length > 0) {
      let eventTypeSequences: any = [];
      for (let selectedEve of this.selectedEvent) {
        if ((selectedEve.eventTypeStatus != "S") || (selectedEve.eventTypeStatus == "S" && !this.validRundate(selectedEve.eventNextRunDate))) {
          eventTypeSequences.push(selectedEve.eventTypeSequence);
        }
      }

      this.eventManagerService.copyEvents(eventTypeSequences, this.currentUser.userId).subscribe(
                  copyResult => {
                    if (copyResult.isSuccess) {
                      this.getEventData();
                      this.alertService.success("Task Copied Successfully.")
                    } else {
                      this.alertService.error(copyResult.message)
                    }
                  },
                  err => {
                    this.alertService.error(err);
                  }
            )
                }
      }

  public openConfirmationDialog() {
    if (this.selectedEvent.length == 1) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Are you sure you want to delete the event ?')
        .then((confirmed) => (confirmed) ? this.deleteEvent() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error('Please select one record');
    }

  }


  deleteEvent() {
    if (this.selectedEvent.length == 1) {
      for (let selectedEve of this.selectedEvent) {
      this.subs.add(
              this.eventManagerService.deleteEvent(selectedEve.eventTypeSequence, this.currentUser.userId).subscribe(
              data => {
                if(data.isSuccess)
                {
            this.getEventData();
            this.alertService.success("Task Deleted Successfully.")
                }
                else
                {
                  //this.getEventData();
                  this.alertService.error("Task Not Deleted")
                }
          },
          err => {
            this.alertService.error(err);
          }
        )
      )
    }
    }
  }

  editEventMethod(editType = 'edit') {
    if (this.selectedEvent.length > 0) {
      this.editType = editType
      $('.taskDetails').addClass('ovrlay');
      this.editEvent = true;
    }

  }

  closeEditEvent($event) {
    $('.taskDetails').removeClass('ovrlay');
    this.editEvent = $event;
    this.mySelection = []
    this.selectedEvent = []
    this.getEventData();
  }

  validRundate(dateStr) {
    if (dateStr == "") {
      return false;
    }

    let date = new Date(dateStr);
    if (date.getFullYear() < 1900) {
      return false
    }

    return true;
  }

  setSeletedRow(dataItem) {
    this.mySelection = [];
    this.selectedEvent = [];
    this.mySelection.push(dataItem.eventTypeCode)
    this.selectedEvent.push(dataItem)
  }


  addEvent() {
    this.addEventWin = true;
    $('.taskDetails').addClass('ovrlay');
  }

  closeAddEvent(event) {
    $('.taskDetails').removeClass('ovrlay');
    this.addEventWin = event;
    this.mySelection = []
    this.selectedEvent = []
    this.getEventData();
  }

  dateFormatDDMMYYYY(value) {
    if (value) {
      return `${value.day}-${value.month}-${value.year}`
    } else {
      return '01-01-1753';
    }
  }

}
