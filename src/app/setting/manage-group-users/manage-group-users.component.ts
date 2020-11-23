import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService, SettingsService } from '../../_services'
import { DataStateChangeEvent, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-manage-group-users',
  templateUrl: './manage-group-users.component.html',
  styleUrls: ['./manage-group-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageGroupUsersComponent implements OnInit {

  subs = new SubSink();
  @Input() parentSelectedRow: any;
  @Output() closeEditWin = new EventEmitter<boolean>();
  @Input() editWin: any = false;
  title = "Manage Group Users";
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

  mode: any = 'multiple';
  mySelection: number[] = [];
  selectableSettings: SelectableSettings;
  allowUnsort = true;
  multiple = false;
  availableGridView: DataResult;
  assignGridView: DataResult;
  availableUser: any;
  assignUser: any
  selectedAvailableUser: any = [];
  selectedAssignedUser: any = [];
  currentUser:any;
  groupName = ''

  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private settingService: SettingsService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.groupName = this.parentSelectedRow.groupDesc;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.setSelectableSettings();
    this.loadGroupUser();
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
      checkboxOnly: false,
      mode: this.mode
    };
  }

  loadGroupUser() {
    this.subs.add(
      this.settingService.loadNotificationGroupUser(this.parentSelectedRow.groupId).subscribe(
        data => {
          console.log(data);
        }
      )
    )

    // this.subs.add(
    //   this.eventmanagerService.getAvailableUser().subscribe(
    //     avlblUserData => {
    //       let tempAvailableuser: any;
    //       let tempAssignuser: any = [];
    //       if (avlblUserData.isSuccess) {
    //         tempAvailableuser = avlblUserData.data;

    //         let req = [];
    //         for (let selectedEve of this.selectedEvent) {
    //           req.push(this.eventmanagerService.getAssignUser(selectedEve.eventTypeSequence))
    //         }

    //         this.subs.add(
    //           forkJoin(req).subscribe(
    //             assigneUserData => {
    //               let assignedUser: any = assigneUserData
    //               tempAssignuser = this.flatten(assignedUser)
    //               const distinctAssineUser = tempAssignuser.filter(
    //                 (thing, i, arr) => arr.findIndex(t => t.eventRecipient === thing.eventRecipient) === i
    //               );
    //               this.assignUser = distinctAssineUser;
    //               this.assignGridView = process(this.assignUser, this.statetwo);

    //               let tempUser = [];
    //               for (let tauser of distinctAssineUser) {
    //                 tempUser.push(tauser.eventRecipient);
    //               }

    //               let tempAvlbluser = [];
    //               for (let tavlUser of tempAvailableuser) {
    //                 if (tempUser.indexOf(tavlUser.mpusid) == -1)
    //                   tempAvlbluser.push(tavlUser);
    //               }

    //               this.availableUser = tempAvlbluser;
    //               this.availableGridView = process(this.availableUser, this.state);
    //               this.chRef.detectChanges();

    //             }
    //           )
    //         )

    //       }
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

  cellClickHandler(eve) {
    this.selectedAvailableUser = this.availableUser.filter(x => this.mySelection.indexOf(x.mpusid) !== -1)
    this.chRef.detectChanges();
  }

  cellClickHandlerForAssign(eve) {
    this.selectedAssignedUser = eve.dataItem
    // console.log(this.selectedAssignedUser);
    this.chRef.detectChanges();
  }


  closeEditWindow() {
    this.editWin = false;
    this.closeEditWin.emit(this.editWin);
  }


  saveGroup(){
    console.log(this.groupName);
    if(this.groupName == ""){
      this.alert.error("Group name is required.")
      return 
    }


  }



}
