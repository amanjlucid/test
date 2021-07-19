import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService, SharedService } from '../../_services'
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
  actualAvailabelUser: any = [];
  actualAssignUser: any = [];
  userToRemove: any = [];
  userToAppend: any = [];


  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.setSelectableSettings();
    this.title = `${this.selectedEvent.length} Tasks Selected`//this.selectedEvent.eventTypeName;
    this.subs.add(
      this.sharedService.notifyUserList.subscribe(
        data => {
          this.setAvailaleAndAssignGrid(data)
        }
      )
    )
    this.getGridData();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public onSelectedKeysChange(e) {
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
            this.actualAvailabelUser = avlblUserData.data
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
                  this.sharedService.changeNotifyUserList([tempAvailableuser, tempAssignuser])

                  //this.setAvailaleAndAssignGrid([tempAvailableuser, tempAssignuser])
                  //this.setAvailaleAndAssignGrid(tempAvailableuser, tempAssignuser)
                  // const distinctAssineUser = tempAssignuser.filter(
                  //   (thing, i, arr) => arr.findIndex(t => t.eventRecipient === thing.eventRecipient) === i
                  // );
                  // this.assignUser = distinctAssineUser;
                  // this.assignGridView = process(this.assignUser, this.statetwo);

                  // let tempUser = [];
                  // for (let tauser of distinctAssineUser) {
                  //   tempUser.push(tauser.eventRecipient);
                  // }

                  // let tempAvlbluser = [];
                  // for (let tavlUser of tempAvailableuser) {
                  //   if (tempUser.indexOf(tavlUser.mpusid) == -1)
                  //     tempAvlbluser.push(tavlUser);
                  // }

                  // this.availableUser = tempAvlbluser;
                  // this.availableGridView = process(this.availableUser, this.state);
                  // this.chRef.detectChanges();

                }
              )
            )

          }
        }
      )
    )


  }


  setAvailaleAndAssignGrid(data) {
    let availabelUser = [];
    let assignUser = [];
    if (data.length > 0) {
      availabelUser = data[0]
      assignUser = data[1]
    }

    if (assignUser.length > 0) {
      const distinctAssineUser = assignUser.filter(
        (thing, i, arr) => arr.findIndex(t => t.eventRecipient === thing.eventRecipient) === i
      );
      this.assignUser = distinctAssineUser;
    } else {
      this.assignUser = assignUser;
    }

    this.actualAssignUser = Object.assign([], this.assignUser);

    this.assignGridView = process(this.assignUser, this.statetwo);

    let tempUser = [];
    for (let tauser of this.assignUser) {
      tempUser.push(tauser.eventRecipient);
    }

    let tempAvlbluser = [];
    for (let tavlUser of availabelUser) {
      if (tempUser.indexOf(tavlUser.mpusid) == -1)
        tempAvlbluser.push(tavlUser);
    }

    this.availableUser = tempAvlbluser;
    this.availableGridView = process(this.availableUser, this.state);
    this.chRef.detectChanges();
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
    this.chRef.detectChanges();
  }


  closeNotifyWindowMethod() {
    this.notifyWindow = false;
    this.closeNotifyWindow.emit(this.notifyWindow);
    setTimeout(() => {
      this.sharedService.changeNotifyUserList([])
    }, 200);
  }

  add() {
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
    if (this.selectedAssignedUser) {
      this.manageEventFormMode = "edit";
      $('.manageNotifier').addClass('ovrlay');
      this.managenotifier = true;
    }
  }

  removeNotifyUser() {
    if (this.selectedEvent.length > 0) {
      if (this.selectedAssignedUser) {
        this.userToRemove.push(this.selectedAssignedUser);
        let assignedUser = this.assignUser.filter(x => x.eventRecipient != this.selectedAssignedUser.eventRecipient)
        this.sharedService.changeNotifyUserList([this.actualAvailabelUser, assignedUser]);
        this.userToAppend = this.userToAppend.filter(x => x.eventRecipient != this.selectedAssignedUser.eventRecipient)
        this.resetAllGridSelection()
        // let req = [];
        // for (let eve of this.selectedEvent) {
        //   const params = { EventTypeSequence: eve.eventTypeSequence, ETRSequence: this.selectedAssignedUser.etrSequence };
        //   req.push(this.eventmanagerService.deleteListOfEventTypeNotify(params));
        // }

        // this.subs.add(
        //   forkJoin(req).subscribe(
        //     data => {
        //       console.log(data);
        //       this.getGridData();
        //     }
        //   )
        // )

      }
    }

  }

  closeManageNotifier(eve) {
    $('.manageNotifier').removeClass('ovrlay');
    this.managenotifier = eve;
    this.resetAllGridSelection()
    // this.getGridData();
  }

  resetAllGridSelection() {
    this.selectedAvailableUser = [];
    this.selectedAssignedUser = [];
    this.mySelection = [];
    this.chRef.detectChanges();
  }

  changeUserSetting() {
    this.replaceUser = !this.replaceUser;
    this.appendUser = !this.appendUser;

    if (this.replaceUser) {
      const tempAssignUser = Object.assign([], this.assignUser);
      this.userToRemove = this.userToRemove.concat(tempAssignUser)
      this.assignUser = [];
      //this.assignGridView = process(this.assignUser, this.statetwo);
    } else {
      //this.assignUser = this.actualAssignUser
      // this.assignGridView = process(this.assignUser, this.statetwo);
    }
    this.sharedService.changeNotifyUserList([this.actualAvailabelUser, this.assignUser]);
    this.chRef.detectChanges();
  }


  appendUserEvent(eve) {
    this.userToAppend = this.userToAppend.concat(eve)
  }


  saveParameters() {
    let onlyUpdate = true;

    if (this.userToAppend.length > 0) {
      onlyUpdate = false;
    }

    let params = {
      selectedTasks: this.selectedEvent.map(x => {
        return { "seq": x.eventTypeSequence }
      }),
      assignuser: this.assignUser,
      replace: this.replaceUser ? true : false,
      usertoRemove: this.checkBlanckUserRmvAndAppend("remove", this.userToRemove),
      userToAppend: this.checkBlanckUserRmvAndAppend("append", this.userToAppend),
      onlyUpdate: onlyUpdate
    }

    this.subs.add(
      this.eventmanagerService.updateAssignUser(params).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.alert.success("Notification Users updated successfully");
            this.userToRemove = [];
            this.userToAppend = [];
            // this.getGridData();
            this.closeNotifyWindowMethod();
          } else {
            this.alert.error(data.message)
          }
        }
      )
    )


  }

  checkBlanckUserRmvAndAppend(type, data) {
    if (type == "append") {
      if (data.length == 0) {
        return [
          {
            "etrSequence": "",
            "eventMSGNote": "",
            "eventMSGText": "",
            "eventNotifyType": "",
            "eventNotifyTypeName": "",
            "eventRecipient": "",
            "eventRecipientName": "",
            "eventSendEmailText": "",
            "eventSendMail": "",
            "eventTypeSequence": ""
          }
        ]
      } else {
        return data
      }
    } else {
      if (data.length == 0) {
        return [
          {
            "eventTypeSequence": "",
            "etrSequence": "",
            "eventRecipient": "",
            "eventNotifyType": "",
            "eventSendMail": "",
            "eventMSGText": "",
            "eventMSGNote": "",
            "eventRecipientName": "",
            "eventSendEmailText": "",
            "eventNotifyTypeName": ""
          }
        ]
      } else {
        return data
      }
    }
  }

}
