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
  @Input() editType = 'edit';
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

  userList: any;
  currentUser: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.selectedEvent.length > 1) {
      this.title = `Multiple Event Types (${this.selectedEvent.length})`;
    } else {
      this.title = `${this.selectedEvent[0].eventTypeName} (${this.selectedEvent[0].eventTypeCode})`;
    }


    if (this.editType == 'edit') {
      this.editEventForm = this.fb.group({
        severity: ['', [Validators.required]],
        completedays: ['', []],
        eventstatus: ['', [Validators.required]],
      })

      this.setStatusAndSevValue();
    } else if (this.editType == 'escalation') {
      this.editEventForm = this.fb.group({
        numberofdays1: ['', []],
        escalationgrp1: ['', []],
        numberofdays2: ['', []],
        escalationgrp2: ['', []],
        numberofdays3: ['', []],
        escalationgrp3: ['', []],
      })

      this.subs.add(
        this.eventmanagerService.GetListOfSecurityUserAndGroup().subscribe(
          data => {
            if (data.isSuccess) {
              this.userList = data.data;
              this.setEscValues();
              this.chRef.detectChanges();
            }
          }
        )
      )
    }

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

    if (this.editType == "edit") {
      for (let selectedEve of this.selectedEvent) {
        let params = {
          EventTypeSequence: selectedEve.eventTypeSequence,
          EventSevType: formRawVal.severity,
          EventTypeDueDays: formRawVal.completedays == "" ? 0 : formRawVal.completedays,
          EventTypeStatus: formRawVal.eventstatus,
          EventPeriod: selectedEve.eventPeriod,
          EventPeriodType: selectedEve.eventPeriodType,
          EventNextRunDate: selectedEve.eventNextRunDate,
          EventTypeUpdatedBy: this.currentUser.userId

        }
        req.push(this.eventmanagerService.updateEventStatus(params))
      }
    } else if (this.editType == "escalation") {
      for (let selectedEve of this.selectedEvent) {
        let params = {
          EventTypeSequence: selectedEve.eventTypeSequence,
          EventESCUser1: formRawVal.escalationgrp1,
          EventESCToDays1: formRawVal.numberofdays1 == "" ? 0 : formRawVal.numberofdays1,
          EventESCUser2: formRawVal.escalationgrp2,
          EventESCToDays2: formRawVal.numberofdays2 == "" ? 0 : formRawVal.numberofdays2,
          EventESCUser3: formRawVal.escalationgrp3,
          EventESCToDays3: formRawVal.numberofdays3 == "" ? 0 : formRawVal.numberofdays3,
          EventPeriod: selectedEve.eventPeriod,
          EventPeriodType: selectedEve.eventPeriodType,
          EventNextRunDate: selectedEve.eventNextRunDate,
          EventTypeUpdatedBy: this.currentUser.userId
        }
        req.push(this.eventmanagerService.updateEventEscalationLevel(params))
      }
    }

    if (req.length > 0) {
      this.subs.add(
        forkJoin(req).subscribe(
          data => {
            this.closeEditEventMethod();
          }
        )
      )
    }


  }




  setStatusAndSevValue() {
    this.checkEventStatus = true
    if (this.selectedEvent.length > 1) {
      let sev = this.selectedEvent[0].eventSevType;
      let status = this.selectedEvent[0].eventTypeStatus;
      let setStatus = true
      let setSev = true
      for (let eve of this.selectedEvent) {
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

    } else {

      if (this.selectedEvent[0].eventTypeStatus == "S") {
        this.checkEventStatus = false
      } else {
        this.checkEventStatus = true
      }

      this.editEventForm.patchValue({
        severity: this.selectedEvent[0].eventSevType,
        completedays: this.selectedEvent[0].eventTypeDueDays,
        eventstatus: this.selectedEvent[0].eventTypeStatus
      })
    }

  }

  setEscValues() {
    if (this.selectedEvent.length == 1) {
      this.editEventForm.patchValue({
        numberofdays1: this.selectedEvent[0].eventESCToDays1,
        escalationgrp1: this.selectedEvent[0].eventESCUser1,
        numberofdays2: this.selectedEvent[0].eventESCToDays2,
        escalationgrp2: this.selectedEvent[0].eventESCUser2,
        numberofdays3: this.selectedEvent[0].eventESCToDays3,
        escalationgrp3: this.selectedEvent[0].eventESCUser3,
      })
    }

  }


  // modifiedSelectedEvent($event) {
  //   this.selectedEvent = $event;
  //   this.setEventValues();
  //   this.chRef.detectChanges();
  // }


}
