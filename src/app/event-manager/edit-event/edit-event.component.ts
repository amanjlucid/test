import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { resourceLimits } from 'node:worker_threads';


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
  eventTypeSequences: Int32Array[] = [];
  userList: any[] = [];
  userIds: any[] = [];
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

    for (let selectedEve of this.selectedEvent) {
      this.eventTypeSequences.push(selectedEve.eventTypeSequence)
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
              this.userList.forEach(element => {
                this.userIds.push(element.mpusid);
              });
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

    if(this.editType == "escalation")
    {
      let message = this.validate('escalation');
      if(message != ""){
        this.alert.error(message);
        return;
      }
    }
    else{
      let message = this.validate('edit');
      if(message != ""){
        this.alert.error(message);
        return;
      }
    }

    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.editEventForm);
    if (this.editEventForm.invalid) {
      return;
    }

    this.submitted = true;
    let formRawVal = this.editEventForm.getRawValue();
    let req = [];

    if (this.editType == "edit") {

        let params = {
        EventTypeSequences: this.eventTypeSequences,
          EventSevType: formRawVal.severity,
          EventTypeDueDays: formRawVal.completedays == "" ? 0 : formRawVal.completedays,
          EventTypeStatus: formRawVal.eventstatus,
          EventTypeUpdatedBy: this.currentUser.userId

        }

      this.subs.add(
        this.eventmanagerService.updateEventStatus(params).subscribe(
          data => {
            if(data.isSuccess)
            {
              this.alert.success("Event details saved successfully")
            }
            else{
              this.alert.error("Event details not saved: " + data.message)
      }
            this.closeEditEventMethod();
          }
        )
      )

    } else if (this.editType == "escalation") {

        let params = {
        EventTypeSequences: this.eventTypeSequences,
          EventESCUser1: formRawVal.escalationgrp1,
          EventESCToDays1: formRawVal.numberofdays1 == "" ? 0 : formRawVal.numberofdays1,
          EventESCUser2: formRawVal.escalationgrp2,
          EventESCToDays2: formRawVal.numberofdays2 == "" ? 0 : formRawVal.numberofdays2,
          EventESCUser3: formRawVal.escalationgrp3,
          EventESCToDays3: formRawVal.numberofdays3 == "" ? 0 : formRawVal.numberofdays3,
          EventTypeUpdatedBy: this.currentUser.userId
        }

      this.subs.add(
        this.eventmanagerService.updateEventEscalationLevel(params).subscribe(
          data => {
            if(data.isSuccess)
            {
              this.alert.success("Escalation details saved successfully")
            }
            else{
              this.alert.error("Escalation details not saved: " + data.message)
            }
            this.closeEditEventMethod();
          }
        )
      )
    }
  }

  Level2Min(){
    return this.editEventForm.controls.numberofdays1.value + 1
  }

  Level3Min(){
    if(this.editEventForm.controls.numberofdays1.value > this.editEventForm.controls.numberofdays2.value){
      return this.editEventForm.controls.numberofdays1.value + 1
    }
    else{
      return this.editEventForm.controls.numberofdays2.value + 1
    }
  }

  validate(value)
  {
    let result = '';
    if(value == 'escalation'){
      if(this.editEventForm.controls.escalationgrp1.value != "" && this.userIds.indexOf(this.editEventForm.controls.escalationgrp1.value) == -1)
      {
        this.editEventForm.controls.escalationgrp1.setValue('');
      }
      if(this.editEventForm.controls.escalationgrp2.value != "" && this.userIds.indexOf(this.editEventForm.controls.escalationgrp2.value) == -1)
      {
        this.editEventForm.controls.escalationgrp2.setValue('');
      }
      if(this.editEventForm.controls.escalationgrp3.value != "" && this.userIds.indexOf(this.editEventForm.controls.escalationgrp3.value) == -1)
      {
        this.editEventForm.controls.escalationgrp3.setValue('');
      }

      if(this.editEventForm.controls.escalationgrp2.value != '' || this.editEventForm.controls.numberofdays2.value != '')
      {
        if(this.editEventForm.controls.escalationgrp1.value == '' || this.editEventForm.controls.numberofdays1.value == '')
        {
          result = "You must enter the details for all the preceding escalation levels"
          return result;
        }
      }
      if(this.editEventForm.controls.escalationgrp3.value != '' || this.editEventForm.controls.numberofdays3.value != '')
      {
        if(this.editEventForm.controls.escalationgrp1.value == '' || this.editEventForm.controls.numberofdays1.value == '' || this.editEventForm.controls.escalationgrp2.value == '' || this.editEventForm.controls.numberofdays2.value == '')
        {
          result = "You must enter the details for all the preceding escalation levels"
          return result;
        }
      }
      if((this.editEventForm.controls.escalationgrp1.value == '' && this.editEventForm.controls.numberofdays1.value != '') || (this.editEventForm.controls.escalationgrp1.value != '' && this.editEventForm.controls.numberofdays1.value == ''))
      {
          result = "You must enter values for both the 'Number of Days' and 'Escalation User' for Level 1"
          return result;
      }
      if((this.editEventForm.controls.escalationgrp2.value == '' && this.editEventForm.controls.numberofdays2.value != '') || (this.editEventForm.controls.escalationgrp2.value != '' && this.editEventForm.controls.numberofdays2.value == ''))
      {
          result = "You must enter values for both the 'Number of Days' and 'Escalation User' for Level 2"
          return result;
      }
      if((this.editEventForm.controls.escalationgrp3.value == '' && this.editEventForm.controls.numberofdays3.value != '') || (this.editEventForm.controls.escalationgrp3.value != '' && this.editEventForm.controls.numberofdays3.value == ''))
      {
          result = "You must enter values for both the 'Number of Days' and 'Escalation User' for Level 3"
          return result;
      }

      if(this.editEventForm.controls.numberofdays1.value != undefined && this.editEventForm.controls.numberofdays1.value > 0)
      {
        if(this.editEventForm.controls.numberofdays2.value != undefined && this.editEventForm.controls.numberofdays2.value  > 0)
        {
          if (this.editEventForm.controls.numberofdays1.value >= this.editEventForm.controls.numberofdays2.value)
          {
            result = "The escalation days for level 2 must be greater than the days for level 1"
            return result;
          }
        }
      }

      if(this.editEventForm.controls.numberofdays2.value != undefined && this.editEventForm.controls.numberofdays2.value > 0)
      {
        if(this.editEventForm.controls.numberofdays3.value != undefined && this.editEventForm.controls.numberofdays3.value  > 0)
        {
          if (this.editEventForm.controls.numberofdays2.value >= this.editEventForm.controls.numberofdays3.value)
          {
            result = "The escalation days for level 3 must be greater than the days for level 2"
            return result;
          }
        }
      }

    }
    else{
      if(this.editEventForm.controls.completedays.value > 9999){
        result = "The maximum 'Completion Within (days)' value is 9999"
        return result;
      }
    }

      return result;

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
