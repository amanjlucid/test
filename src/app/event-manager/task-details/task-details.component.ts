import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService } from '../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

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
      logic: "or",
      filters: []
    }
  }
  tempstate: State = {
    skip: 0,
    sort: [],
    group: [{ field: 'busAreaDesc' }],
    filter: {
      logic: "or",
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

  constructor(
    private eventManagerService: EventManagerService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.setSelectableSettings();
    this.getEventData();

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
                    //this.alertService.error("You have no access to configuration")
                    this.router.navigate(['/dashboard']);
                  }
                }
              }
            )
          }
          // let moduleList = ["Edit","Event Dashboard","Event Manager Portal Access","Manage Business Areas","Manage Emails","Manage Event Types","Manage Notification Groups","Manage User Events","Notify","Parameters"];
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
            this.taskDetails = data.data;
            this.taskDetailsTemp = Object.assign([], data.data);
            
            // this.taskDetailsTemp = data.data.slice(this.state.skip, 30) // remove it
            // this.taskDetailsTemp =  Object.assign([], this.taskDetails);  // remove it

            this.gridView = process(this.taskDetailsTemp, this.state);
            this.loading = false;
            // this.gridView.total = this.gridView.data.length
            // console.log(this.gridView)

          }
        }
      )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    // this.resetGrid()
    this.state.group = groups;
    // this.tempstate.group = groups
    setTimeout(() => {
      this.gridView = process(this.taskDetailsTemp, this.state);
      // this.taskDetails = this.gridView.data;
      // this.gridView.total = this.gridView.data.length
    }, 100);
  }


  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.taskDetailsTemp, this.state);
    // this.tempstate.sort = sort;
    // this.tempstate.skip = 0;
    // this.tempstate.group = []
    // let tempData: any = process(this.taskDetailsTemp, this.tempstate);


    // this.state.sort = sort;
    // this.state.skip = 0;

    // if (this.state.group.length > 0) {
    //   this.tempstate.group = this.state.group;
    //   this.gridView = process(tempData.data, this.tempstate);
    //   this.taskDetails = this.gridView.data;
    //   this.gridView.total = this.gridView.data.length
    // } else {
    //   this.gridView = process(tempData.data, this.state);
    //   this.taskDetails = tempData.data;
    //   this.gridView.total = tempData.total
    // }

  }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.taskDetailsTemp, this.state);

    // this.resetGrid()
    // this.tempstate.filter = filter;
    // this.tempstate.group = [];
    // let tempData = process(this.taskDetailsTemp, this.tempstate);

    // this.state.filter = filter;
    // if (this.state.group.length > 0) {
    //   this.tempstate.group = this.state.group;
    //   setTimeout(() => {
    //     this.gridView = process(tempData.data, this.tempstate);
    //     this.taskDetails = this.gridView.data;
    //     this.gridView.total = this.gridView.data.length
    //   }, 200);
    // } else {
    //   setTimeout(() => {
    //     this.gridView = process(tempData.data, this.state);
    //     this.taskDetails = tempData.data;
    //     this.gridView.total = tempData.total
    //   }, 200);
    // }

    // this.taskDetails = tempData.data;
    // this.renderGrid(tempData, 200)
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (this.mySelection.length > 0) {
      this.selectedEvent = this.taskDetails.filter(x => this.mySelection.indexOf(x.eventTypeCode) !== -1);

      if (this.selectedEvent.length == 1) {
        if (this.touchtime == 0) {
          // set first click
          this.touchtime = new Date().getTime();
        } else {
          // compare first click to this click and see if they occurred within double click threshold
          if (((new Date().getTime()) - this.touchtime) < 400) {
            if (columnIndex == 1) {
              this.openParamsWindow();
              // if ((this.selectedEvent.eventParamCount > 0 && this.selectedEvent.eventParamEmptyCount == 0) || (this.selectedEvent.eventParamCount > 0 && this.selectedEvent.eventParamEmptyCount > 0)) {

              // }
            } else if (columnIndex == 2) {
              this.opneNotifyWindow();
            } else {
              this.editEventMethod();
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
    if (this.selectedEvent.length > 0) {
      let req = [];
      let checkManual = false;
      for (let eve of this.selectedEvent) {
        if (eve.eventTypeStatus == "S") {
          checkManual = true
        } else {
          req.push(this.eventManagerService.runEvent(eve.eventTypeSequence, this.currentUser.userId));
        }

      }

      if (checkManual) {
        this.alertService.error("System events cannot run manually.")
        return
      }


      this.alertService.success(`${this.selectedEvent.length} task(s) running in background.`);

      forkJoin(req).subscribe(
        data => {
          this.alertService.destroyAlert();
          if (data.length > 0) {
            let runevents: any = data;
            // console.log(runevents);
            let successStr = [];
            for (let runevent in runevents) {
              let rowStr = runevents[runevent].data > 1 ? "rows" : "row";
              successStr.push(` ${this.selectedEvent[runevent].eventTypeCode} : ${this.selectedEvent[runevent].eventTypeName} : ${runevents[runevent].data} ${rowStr} identified.`);
              // if (runevents[runevent].isSuccess && runevents[runevent].data >= 0) {
              //   // successStr += `${this.selectedEvent[runevent].eventTypeCode} : ${this.selectedEvent[runevent].eventTypeName}   ${runevents[runevent].data} rows identified.,`;
              // }
            }

            setTimeout(() => {
              this.alertService.success(successStr.toString(), true, 1000000);
            }, 1000);

          }

        }
      )
    }
  }

  copyEvent() {
    if (this.selectedEvent.length > 0) {
      let req: any = [];
      for (let selectedEve of this.selectedEvent) {
        if ((selectedEve.eventTypeStatus != "S") || (selectedEve.eventTypeStatus == "S" && !this.validRundate(selectedEve.eventNextRunDate))) {
          req.push(this.eventManagerService.copyEvent(selectedEve.eventTypeSequence, this.currentUser.userId));
        }

      }

      forkJoin(req).subscribe(
        res => {
          this.getEventData();
          this.alertService.success("Task Copied Successfully.")
        },
        err => {
          this.alertService.error(err);
        }
      )

    }
  }

  public openConfirmationDialog() {
    if (this.selectedEvent.length > 0) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Are you sure you want to delete the event ?')
        .then((confirmed) => (confirmed) ? this.deleteEvent() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error('Please select one record');
    }

  }


  deleteEvent() {
    if (this.selectedEvent.length > 0) {
      let req: any = [];
      for (let selectedEve of this.selectedEvent) {
        if (selectedEve.eventTypeUpdatedBy == this.currentUser.userId) {
          req.push(this.eventManagerService.deleteEvent(selectedEve.eventTypeSequence, this.currentUser.userId));
        }
      }

      this.subs.add(
        forkJoin(req).subscribe(
          res => {
            this.getEventData();
            this.alertService.success("Task Deleted Successfully.")
          },
          err => {
            this.alertService.error(err);
          }
        )
      )
    }

  }

  editEventMethod() {
    $('.taskDetails').addClass('ovrlay');
    this.editEvent = true;
  }

  closeEditEvent($event) {
    this.getEventData();
    $('.taskDetails').removeClass('ovrlay');
    this.editEvent = $event;
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




}
