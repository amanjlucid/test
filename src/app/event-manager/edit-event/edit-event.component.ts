import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, EventManagerService, HelperService } from '../../_services'



@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditEventComponent implements OnInit {
  subs = new SubSink();
  @Input() editEvent: boolean = false;
  @Input() selectedEvent: any;
  @Output() closeEditEvent = new EventEmitter<boolean>();
  title = '';

  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    console.log(this.selectedEvent);
    if(this.selectedEvent.length > 1){
      this.title = `Multiple Event Type (${this.selectedEvent.length})`;
    } else {
      this.title = `${this.selectedEvent[0].eventTypeName} (${this.selectedEvent[0].eventTypeCode})`;
    }
  }

  closeEditEventMethod() {
    this.editEvent = false;
    this.closeEditEvent.emit(this.editEvent);
  }

}
