import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, EventManagerService } from 'src/app/_services';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { max } from 'rxjs/operators';

@Component({
  selector: 'app-manage-event-notifier',
  templateUrl: './manage-event-notifier.component.html',
  styleUrls: ['./manage-event-notifier.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageEventNotifierComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedEvent: any;
  @Output() closeManageNotifier = new EventEmitter<boolean>();
  @Input() managenotifier: any = false;
  @Input() selectedAssignedUser: any;
  @Input() selectedAvailableUser: any;
  @Input() manageEventFormMode: any;
  @Input() assignUser: any;
  @Input() appendUser: boolean;
  @Input() replaceUser: boolean;
  title = 'Manage Event Notify User';
  manageNotifierForm: FormGroup;
  formErrors: any;
  validationMessage = {
    'notifyType': {
      'required': 'Notify type is required.',
    },

  };
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventManagerService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.manageNotifierForm = this.fb.group({
      notifyType: ['', [Validators.required]],
      sendEmail: ['', []],
      text: ['', []]
    })

    if (this.manageEventFormMode == "edit") {
      this.manageNotifierForm.patchValue({
        notifyType: this.selectedAssignedUser.eventNotifyType,
        sendEmail: this.selectedAssignedUser.eventSendMail == "N" ? false : true,
        text: this.selectedAssignedUser.eventMSGText,
      })

      this.chRef.detectChanges();
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeManageNotifierWin() {
    this.managenotifier = false;
    this.closeManageNotifier.emit(this.managenotifier);
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
      'notifyType': '',

    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.manageNotifierForm);
    if (this.manageNotifierForm.invalid) {
      return;
    }

    let formRawVal = this.manageNotifierForm.getRawValue();
   
    // console.log(this.selectedEvent)
    if (this.manageEventFormMode == "add") {
      if (this.replaceUser && this.appendUser == false) {
        let delReq = [];
        for (let event of this.selectedEvent) {
          delReq.push(this.eventService.deleteListOfEventTypeNotifyBySequenceNumber(event.eventTypeSequence))
        }

        this.subs.add(
          forkJoin(delReq).subscribe(
            data => {
              this.addAssignUser(formRawVal);
            }
          )
        )

      } else {
       
        this.addAssignUser(formRawVal);
      }
    } else {
      const params = {
        EventTypeSequence: this.selectedAssignedUser.eventTypeSequence,
        ETRSequence: this.selectedAssignedUser.etrSequence,
        EventRecipient: this.selectedAssignedUser.eventRecipient,
        EventNotifyType: formRawVal.notifyType,
        EventSendMail: formRawVal.sendEmail ? "Y" : "N",
        EventMSGText: formRawVal.text,
      }

      this.subs.add(
        this.eventService.updateListOfEventTypeNotify(params).subscribe(
          data => {
            // console.log(data)
            if (data.isSuccess) {
              // this.alertService.success("")
              this.closeManageNotifierWin();
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


  }

  addAssignUser(formRawVal) {
    let maxValue = 0;
    let req: any = [];

    for (let event of this.selectedEvent) {
      let findAssignUserBySeq = this.assignUser.filter(x => x.eventTypeSequence == event.eventTypeSequence);
     
      if (findAssignUserBySeq.length > 0) {
        maxValue = Math.max.apply(Math, findAssignUserBySeq.map(function (o) { return o.etrSequence; }))
      }

      let i = maxValue;
      for (let availableUser of this.selectedAvailableUser) {
        i = i + 1;
        const params = {
          EventTypeSequence: event.eventTypeSequence,
          ETRSequence: i,
          EventRecipient: availableUser.mpusid,
          EventNotifyType: formRawVal.notifyType,
          EventSendMail: formRawVal.sendEmail ? "Y" : "N",
          EventMSGText: formRawVal.text,
        }

        req.push(this.eventService.addListOfEventTypeNotify(params));

      }
     
    }

    this.subs.add(
      forkJoin(req).subscribe(
        res => {
          // console.log(res);
          // this.alertService.success("Event Deleted Successfully.")
          this.closeManageNotifierWin();

        },
        err => {
          this.alertService.error(err);
        }
      )
    )


  }


}
