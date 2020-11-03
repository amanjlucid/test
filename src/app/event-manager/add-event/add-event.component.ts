import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MustbeTodayOrGreater } from 'src/app/_helpers';


@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEventComponent implements OnInit {
  subs = new SubSink();
  @Input() addEventWin: boolean = false;
  @Input() selectedEvent: any;
  @Output() closeAddEvent = new EventEmitter<boolean>();
  @Output() modifiedSelectedEvent = new EventEmitter<any>();
  title = "Add Event Schedule";
  editEvform: FormGroup;
  formErrors: any;
  validationMessage = {
    'periodType': {
      'required': 'Period type is required.',
    },
    'periodInterval': {
      'required': 'Period interval is required.',
    },
    'nextRunDate': {
      'required': 'Next run date is required.',
      'pastdate': 'The next run date must be in the future.'
    },

  };
  submitted = false;
  currentUser: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService,
    private fb: FormBuilder,
    private helperService: HelperService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.editEvform = this.fb.group({
      periodType: ['', [Validators.required]],
      periodInterval: ['', [Validators.required]],
      nextRunDate: ['', [Validators.required, MustbeTodayOrGreater()]],

    })

    console.log(this.selectedEvent[0].eventPeriodType);
    if (this.selectedEvent.length == 1) {
      this.editEvform.patchValue({
        periodType: JSON.stringify(this.selectedEvent[0].eventPeriodType),
        periodInterval: this.selectedEvent[0].eventPeriod,
        nextRunDate: this.helperService.ngbDatepickerFormat(this.selectedEvent[0].eventNextRunDate),
      })
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
      'periodType': '',
      'periodInterval': '',
      'nextRunDate': '',

    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.editEvform);
    if (this.editEvform.invalid) {
      return;
    }

    let formRawVal = this.editEvform.getRawValue();
    let modifiedEvent = [];
    
    for (let eve of this.selectedEvent) {
      eve.eventPeriod = formRawVal.periodInterval;
      eve.eventPeriodType = formRawVal.periodType;
      eve.eventNextRunDate = this.dateFormate2(formRawVal.nextRunDate);
      modifiedEvent.push(eve);
    }

    this.modifiedSelectedEvent.emit(modifiedEvent);
    this.closeAddEventMethod();

  }

  dateFormate2(value) {
    if (value) {
      return `${value.year}-${value.month}-${value.day}`
    } else {
      return '1753-01-01 00:00:00.000';
    }

  }

  closeAddEventMethod() {
    this.addEventWin = false
    this.closeAddEvent.emit(this.addEventWin)
  }

  openCalendar(obj) {
    obj.toggle()
  }


  public openConfirmationDialog() {
    if (this.selectedEvent.length > 0) {
      let deleteMsg = 'Are you sure you want to delete the schedule for the selected event type ?';
      if (this.selectedEvent.length > 1) {
        deleteMsg = `Are you sure you want to delete the schedule for all ${this.selectedEvent.length} selected event types ?`;
      }
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', deleteMsg)
        .then((confirmed) => (confirmed) ? this.deleteSchedule() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alert.error('Please select one attachment');
    }

  }

  deleteSchedule() {
    let req: any = [];
    let modifiedEvent: any = [];
    for (let eve of this.selectedEvent) {
      eve.eventPeriod = 0;
      eve.eventNextRunDate = '';
      eve.eventLastRunDate = '';
      modifiedEvent.push(eve);
      req.push(eve.eventTypeSequence);
    }

    
    this.subs.add(
      this.eventmanagerService.deleteSchedule(req.join(), this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.modifiedSelectedEvent.emit(modifiedEvent);
            this.closeAddEventMethod();
          }
        }
      )
    )

  }


}
