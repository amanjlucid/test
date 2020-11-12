import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, EventManagerService, HelperService } from '../../_services'


@Component({
  selector: 'app-user-event-task-details',
  templateUrl: './user-event-task-details.component.html',
  styleUrls: ['./user-event-task-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEventTaskDetailsComponent implements OnInit {
  subs = new SubSink();
  @Input() taskDetails: boolean = false
  @Input() selectedEvent: any
  @Output() closeTaskDetails = new EventEmitter<boolean>();
  title = 'Task Details';
  comments: any = '';
  currentUser: any;
  taskData: boolean = false;
  selectedEventList:any;

  constructor(
    private chRef: ChangeDetectorRef,
    private eventManagerService: EventManagerService,
    private alertService: AlertService,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.selectedEventList = Object.assign([], this.selectedEvent);
    this.selectedEvent = this.selectedEvent[0]
    this.comments = this.selectedEvent.eventComments;

    this.markViewd(this.selectedEvent.eventSequence, this.currentUser.userId);
    this.userEventByseq(this.selectedEvent.eventSequence, this.currentUser.userId);


    setTimeout(() => {
      this.chRef.detectChanges();
    }, 300);
  }

  closeWindow() {
    this.taskDetails = false;
    this.closeTaskDetails.emit(this.taskDetails);
  }

  markViewd(seq, userId) {
    this.subs.add(
      this.eventManagerService.markViewed(seq, userId).subscribe(
        data => {
          // console.log(data);
        }
      )
    )
  }

  userEventByseq(seq, userId) {
    this.subs.add(
      this.eventManagerService.getListOfUserEventBySequence(seq, userId).subscribe(
        data => {
          // console.log(data);
        }
      )
    )
  }


  processedEvent(obj) {
    const a = (obj.eventProcessedCount / obj.eventRowCount) * 100;
    return Math.round(a);
    //((dataItem.eventProcessedCount/dataItem.eventRowCount) * 100) | roundOff 
  }

  saveComment() {
    let params = {
      EventSequence: this.selectedEvent.eventSequence,
      EventComments: this.comments,
      EventUpdatedBy: this.currentUser.userId,
      EventUpdateDate: new Date()
    }

    this.subs.add(
      this.eventManagerService.UpdateListOfUserEvent(params).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.alertService.success("Comments updated successfully")
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

  exportData() {
    this.subs.add(
      this.eventManagerService.getListOfUserEventBySequence(this.selectedEvent.eventSequence, this.currentUser.userId).subscribe(
        data => {

          if (data.isSuccess) {
            let fileExt = 'xlsx'
            if (data.data.length != undefined && data.data.length > 0) {
              let tempData = data.data;
              let label = {
                'eventSequence': 'Seq',
                'busareaName': 'Business Area',
                'eventTypeCode': 'Code',
                'eventTypeDesc': 'Event',
                'eventRowCount': 'Record(s)',
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

              this.helperService.exportAsExcelFile(tempData, 'User Events', label)

            } else {
              alert('There is no record to import');
            }
          }
        }
      )

    )
  }


  openTaskData() {
    if (this.selectedEventList.length > 0) {
      $('.eventtaskDetail').addClass('ovrlay');
      this.taskData = true;
    } else {
      this.alertService.error("Please select atleast one row first.")
    }
  }


  closeTaskData(eve) {
    $('.eventtaskDetail').removeClass('ovrlay');
    this.taskData = eve;
  }

}
