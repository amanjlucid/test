import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { DataStateChangeEvent, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotifyComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedEvent: any;
  @Output() closeNotifyWindow = new EventEmitter<boolean>();
  @Input() notifyWindow: any = false;
  title = "";
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  statetwo: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  public checkboxOnly = false;
  public mode: any = 'multiple';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  allowUnsort = true;
  multiple = false;
  public availableGridView: DataResult;
  public assignGridView: DataResult;
  availableUser: any;
  assignUser: any
  selectedAvailableUser: any = [];
  selectedAssignedUser: any = [];
  managenotifier: boolean = false;
  manageEventFormMode = 'add';
  appendUser = true;
  replaceUser = false;


  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.setSelectableSettings();
    this.title = `${this.selectedEvent.length} Tasks Selected`//this.selectedEvent.eventTypeName;


    // this.selectedEvent = this.selectedEvent[0];

    this.getGridData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public onSelectedKeysChange(e) {
    // console.log(this.mySelection)
    const len = this.mySelection.length;
  }

  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      mode: this.mode
    };
  }

  getGridData() {

    this.subs.add(
      this.eventmanagerService.getAvailableUser().subscribe(
        avlblUserData => {
          let tempAvailableuser: any;
          let tempAssignuser: any = [];
          if (avlblUserData.isSuccess) {
            tempAvailableuser = avlblUserData.data;

            let req = [];
            for (let selectedEve of this.selectedEvent) {
              req.push(this.eventmanagerService.getAssignUser(selectedEve.eventTypeSequence))
            }

            this.subs.add(
              forkJoin(req).subscribe(
                assigneUserData => {
                  let assignedUser: any = assigneUserData
                  tempAssignuser = this.flatten(assignedUser)
                  const distinctAssineUser = tempAssignuser.filter(
                    (thing, i, arr) => arr.findIndex(t => t.eventRecipient === thing.eventRecipient) === i
                  );
                  this.assignUser = distinctAssineUser;
                  this.assignGridView = process(this.assignUser, this.statetwo);

                  let tempUser = [];
                  for (let tauser of distinctAssineUser) {
                    tempUser.push(tauser.eventRecipient);
                  }

                  let tempAvlbluser = [];
                  for (let tavlUser of tempAvailableuser) {
                    if (tempUser.indexOf(tavlUser.mpusid) == -1)
                      tempAvlbluser.push(tavlUser);
                  }

                  this.availableUser = tempAvlbluser;
                  this.availableGridView = process(this.availableUser, this.state);
                  this.chRef.detectChanges();

                }
              )
            )

          }
        }
      )
    )



    // this.subs.add(
    //   forkJoin([this.eventmanagerService.getAvailableUser(), this.eventmanagerService.getAssignUser(this.selectedEvent.eventTypeSequence)]).subscribe(
    //     res => {

    //       let tempAvailableuser: any;
    //       let tempAssignuser: any
    //       if (res[0].isSuccess) {
    //         tempAvailableuser = res[0].data;

    //       }

    //       if (res[1].isSuccess) {
    //         tempAssignuser = res[1].data
    //         this.assignUser = res[1].data;
    //         this.assignGridView = process(this.assignUser, this.statetwo);
    //       }

    //       let tempUser = [];
    //       for (let tauser of tempAssignuser) {
    //         tempUser.push(tauser.eventRecipient);
    //       }

    //       let tempAvlbluser = [];
    //       for (let tavlUser of tempAvailableuser) {
    //         if (tempUser.indexOf(tavlUser.mpusid) == -1)
    //           tempAvlbluser.push(tavlUser);
    //       }

    //       this.availableUser = tempAvlbluser;
    //       this.availableGridView = process(this.availableUser, this.state);


    //       this.chRef.detectChanges();

    //     }
    //   )
    // )




  }

  flatten(arr) {
    let flat = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].isSuccess) (
        flat = flat.concat(arr[i].data)
      )
    }
    return flat;
  }

  public dataStateChangeForAvailableUser(state: DataStateChangeEvent): void {
    this.state = state;
    this.availableGridView = process(this.availableUser, this.state);
  }

  public dataStateChangeForAssignUser(state: DataStateChangeEvent): void {
    this.statetwo = state;
    this.assignGridView = process(this.assignUser, this.statetwo);
  }

  public cellClickHandler(eve) {
    this.selectedAvailableUser = this.availableUser.filter(x => this.mySelection.indexOf(x.mpusid) !== -1)
    this.chRef.detectChanges();
  }

  cellClickHandlerForAssign(eve) {
    this.selectedAssignedUser = eve.dataItem
    // console.log(this.selectedAssignedUser);
    this.chRef.detectChanges();
  }


  closeNotifyWindowMethod() {
    this.notifyWindow = false;
    this.closeNotifyWindow.emit(this.notifyWindow);
  }

  add() {
    // console.log(this.mySelection);
    if (this.selectedAvailableUser.length > 0) {
      if (this.selectedAvailableUser.length > 1) {
        if (this.appendUser == false && this.replaceUser == false) {
          this.alert.error("Please select one value between append user and replace user.")
          return;
        }
      }

      this.manageEventFormMode = 'add';
      $('.manageNotifier').addClass('ovrlay');
      this.managenotifier = true;
    }

  }

  details() {
    if (this.selectedAssignedUser.length > 0) {
      this.manageEventFormMode = "edit";
      $('.manageNotifier').addClass('ovrlay');
      this.managenotifier = true;
    }
  }

  removeNotifyUser() {
    if (this.selectedEvent.length > 0) {
      if (this.selectedAssignedUser.length > 0) {
        let req = [];
        for (let eve of this.selectedEvent) {
          const params = { EventTypeSequence: eve.eventTypeSequence, ETRSequence: this.selectedAssignedUser.etrSequence };
          req.push(this.eventmanagerService.deleteListOfEventTypeNotify(params));
        }

        this.subs.add(
          forkJoin(req).subscribe(
            data => {
              console.log(data);
              this.getGridData();
            }
          )
        )

      }
    }

  }

  closeManageNotifier(eve) {
    $('.manageNotifier').removeClass('ovrlay');
    this.managenotifier = eve;
    this.getGridData();
  }

  changeUserSetting($event, val) {
    if (val == "replace") {
      this.replaceUser = !this.replaceUser;
      this.appendUser = false;
    } else {
      this.appendUser = !this.appendUser;
      this.replaceUser = false;
    }

    this.chRef.detectChanges();

  }

}
