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



  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.setSelectableSettings();
    console.log(this.selectedEvent);
    this.selectedEvent = this.selectedEvent[0];
    this.title = this.selectedEvent.eventTypeName;
    this.getGridData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public onSelectedKeysChange(e) {
    console.log(this.mySelection)
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
      forkJoin([this.eventmanagerService.getAvailableUser(), this.eventmanagerService.getAssignUser(this.selectedEvent.eventTypeSequence)]).subscribe(
        res => {
          console.log(res);
          if (res[0].isSuccess) {
            this.availableUser = res[0].data;
            this.availableGridView = process(this.availableUser, this.state);
          }

          if (res[1].isSuccess) {
            this.assignUser = res[1].data;
            this.assignGridView = process(this.assignUser, this.statetwo);
          }

          this.chRef.detectChanges();

        }
      )
    )
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
    console.log(this.selectedAssignedUser);
    this.chRef.detectChanges();
  }


  closeNotifyWindowMethod() {
    this.notifyWindow = false;
    this.closeNotifyWindow.emit(this.notifyWindow);
  }

  add() {
    console.log(this.mySelection);
    if (this.selectedAvailableUser.length > 0) {
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
    if (this.selectedAssignedUser) {
      const params = { EventTypeSequence: this.selectedEvent.eventTypeSequence, ETRSequence: this.selectedAssignedUser.etrSequence };
      this.subs.add(
        this.eventmanagerService.deleteListOfEventTypeNotify(params).subscribe(
          data => {
            console.log(data);
            if (data.isSuccess) {
              this.getGridData();
            } else {
              this.alert.error(data.message)
            }
          },

          err => {
            this.alert.error(err);
          }
        )
      )
    }
  }

  closeManageNotifier(eve) {
    $('.manageNotifier').removeClass('ovrlay');
    this.managenotifier = eve;
    this.getGridData();
  }

}
