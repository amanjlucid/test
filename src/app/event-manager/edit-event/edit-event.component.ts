import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
  editEventForm: FormGroup;
  formErrors: any;
  validationMessage = {
    'severity': {
      'required': 'Severity is required.',
    },

  };
  submitted = false;
  eventScheduled: any;
  checkEventStatus: any = true;
  addEventWin = false
  userList: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log(this.selectedEvent);
    if (this.selectedEvent.length > 1) {
      this.title = `Multiple Event Types (${this.selectedEvent.length})`;
    } else {
      this.title = `${this.selectedEvent[0].eventTypeName} (${this.selectedEvent[0].eventTypeCode})`;
    }

    this.editEventForm = this.fb.group({
      severity: ['', [Validators.required]],
      completedays: ['', []],
      numberofdays1: ['', []],
      escalationgrp1: ['', []],
      numberofdays2: ['', []],
      escalationgrp2: ['', []],
      numberofdays3: ['', []],
      escalationgrp3: ['', []],
      eventstatus: ['', []],
      eventschedule: ['', []]
    })


    this.subs.add(
      this.eventmanagerService.GetListOfSecurityUserAndGroup().subscribe(
        data => {
          if (data.isSuccess) {
            this.userList = data.data;
            this.setEventValues();
            this.chRef.detectChanges();
          }
        }
      )
    )



  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {

          const messages = this.validationMessage[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    })
  }

  formErrorObject() {
    this.formErrors = {
      'severity': '',

    }
  }

  closeEditEventMethod() {
    this.editEvent = false;
    this.closeEditEvent.emit(this.editEvent);
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.editEventForm);
    if (this.editEventForm.invalid) {
      return;
    }

    let formRawVal = this.editEventForm.getRawValue();

  }


  addEvent() {
    this.addEventWin = true;
    $('.addEvent').addClass('ovrlay');
  }

  closeAddEvent(event) {
    this.addEventWin = event;
    $('.addEvent').removeClass('ovrlay');
  }

  setEventValues() {
    this.eventScheduled = "Not Scheduled"
    this.checkEventStatus = true

    if (this.selectedEvent.length > 1) {
      let i = 0;
      for (let eve of this.selectedEvent) {
        i++;
        if (eve.eventPeriod != 0) {
          this.eventScheduled = `${i} of ${this.selectedEvent.length} Events Scheduled`;
        }

        if (this.checkEventStatus) {
          if (eve.eventTypeStatus == "S") {
            this.checkEventStatus = false;
          }
        }

      }

      this.editEventForm.patchValue({
        severity: '',
        eventstatus: '',
      })


    } else {

      this.editEventForm.patchValue({
        severity: this.selectedEvent[0].eventSevType,
        completedays: this.selectedEvent[0].eventTypeDueDays,
        numberofdays1: this.selectedEvent[0].eventESCToDays1,
        escalationgrp1: this.selectedEvent[0].eventESCUser1,
        numberofdays2: this.selectedEvent[0].eventESCToDays2,
        escalationgrp2: this.selectedEvent[0].eventESCUser2,
        numberofdays3: this.selectedEvent[0].eventESCToDays3,
        escalationgrp3: this.selectedEvent[0].eventESCUser3,
        eventstatus: this.selectedEvent[0].eventTypeStatus,
      })

      if (this.selectedEvent[0].eventPeriod != 0) {
        this.eventScheduled = 'Scheduled';
      }

      if (this.selectedEvent[0].eventTypeStatus == "S") {
        this.checkEventStatus = false
      } else {
        this.checkEventStatus = true
      }
    }

  }


  modifiedSelectedEvent($event) {
    this.selectedEvent = $event;
    this.setEventValues();
    this.chRef.detectChanges();
  }

}
