import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';


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
    'eventstatus': {
      'required': 'Task Status is required.',
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
    this.editEventForm = this.fb.group({
      severity: ['', [Validators.required]],
      completedays: ['', []],
      numberofdays1: ['', []],
      escalationgrp1: ['', []],
      numberofdays2: ['', []],
      escalationgrp2: ['', []],
      numberofdays3: ['', []],
      escalationgrp3: ['', []],
      eventstatus: ['', [Validators.required]],
      eventschedule: ['', []]
    })


    if (this.selectedEvent.length > 1) {
      this.title = `Multiple Event Types (${this.selectedEvent.length})`;


    } else {
      // this.editEventForm.patchValue({
      //   eventstatus: this.selectedEvent[0].eventTypeStatus
      // })
      this.title = `${this.selectedEvent[0].eventTypeName} (${this.selectedEvent[0].eventTypeCode})`;
    }




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
      'eventstatus': ''

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
    let req = [];
    for (let selectedEve of this.selectedEvent) {
      const params = {
        EventTypeSequence: selectedEve.eventTypeSequence,
        BusAreaCode: selectedEve.busAreaCode,
        EventTypeCode: selectedEve.eventTypeCode,
        EventTypeName: selectedEve.eventTypeName,
        EventTypeDesc: selectedEve.eventTypeDesc,
        EventTypeCategory: selectedEve.eventTypeCategory,
        EventTaskType: selectedEve.eventTaskType,

        EventSevType: formRawVal.severity,
        EventSqlExt: selectedEve.eventSqlExt,

        EventESCUser1: formRawVal.escalationgrp1,
        EventESCToDays1: formRawVal.numberofdays1 == "" ? 0 : formRawVal.numberofdays1,
        EventESCUser2: formRawVal.escalationgrp2,
        EventESCToDays2: formRawVal.numberofdays2 == "" ? 0 : formRawVal.numberofdays2,
        EventESCUser3: formRawVal.escalationgrp3,
        EventESCToDays3: formRawVal.numberofdays3 == "" ? 0 : formRawVal.numberofdays3,
        EventTypeStatus: formRawVal.eventstatus,
        EventTypeDueDays: selectedEve.eventTypeDueDays,
        EventPeriodType: selectedEve.eventPeriodType,
        EventPeriod: selectedEve.eventPeriod,
        EventNextRunDate: selectedEve.eventNextRunDate

      }

      console.log(params);
      req.push(this.eventmanagerService.updateEventList(params))
    }


    this.subs.add(
      forkJoin(req).subscribe(
        data => {
          console.log(data);
          this.closeEditEventMethod();
        }
      )
    )

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
      let sev = this.selectedEvent[0].eventSevType;
      let status = this.selectedEvent[0].eventTypeStatus;
      let setStatus = true
      let setSev = true
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

        if (status != eve.eventTypeStatus) {
          setStatus = false
        }

        if (sev != eve.eventSevType) {
          setSev = false
        }

      }

      if (setSev) {
        this.editEventForm.patchValue({
          severity: this.selectedEvent[0].eventSevType
        })
      }

      if (setStatus) {
       this.editEventForm.patchValue({
          eventstatus: this.selectedEvent[0].eventTypeStatus
        })

      }

      // this.editEventForm.patchValue({
      //   severity: '',
      //   eventstatus: '',
      // })


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
