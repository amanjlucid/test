import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, EventManagerService } from 'src/app/_services';

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
    console.log(formRawVal)

    if (this.manageEventFormMode == "add") {
      if (this.selectedEvent.length > 0) {
        // let addNotifyUser = () => {
        //   return new Promise((resolve, reject) => {
        //     for (let availableUser of this.selectedAvailableUser) {
        //       const params = {
        //         EventTypeSequence: this.selectedEvent.eventTypeSequence,
        //         ETRSequence: this.selectedEvent.eventTypeSequence,
        //         EventRecipient: availableUser.m_UerName,
        //         EventNotifyType: formRawVal.notifyType,
        //         EventSendMail: formRawVal.sendEmail ? "Y" : "N",
        //         EventMSGText: formRawVal.text,
        //       }

        //       this.eventService.addListOfEventTypeNotify(params).subscribe(
        //         async data => {
        //           await console.log(data)
        //         }
        //       )

        //     }

        //     resolve(true);

        //   })
        // }

        // addNotifyUser().then(async x => {
        //   console.log(x);
        // })

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
            console.log(data)
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


}
