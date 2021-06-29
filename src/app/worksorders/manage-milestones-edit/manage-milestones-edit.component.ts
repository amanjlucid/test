import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorksOrdersService, AlertService, HelperService, ConfirmationDialogService } from '../../_services'
import { firstDateIsLower, MustbeTodayOrLower, ShouldGreaterThanYesterday, SimpleDateValidator } from 'src/app/_helpers';

@Component({
  selector: 'app-manage-milestones-edit',
  templateUrl: './manage-milestones-edit.component.html',
  styleUrls: ['./manage-milestones-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ManageMilestonesEditComponent implements OnInit {
  @Input() openMilestoneEdit: boolean = false;
  @Input() singleMilestone: any;
  @Input() openMilestoneFor; // checklist, manage, phase
  @Output() closeMilestoneEditEvent = new EventEmitter<boolean>();

  subs = new SubSink(); // to unsubscribe services
  title = 'Edit Works Order Milestone';
  milestoneForm: FormGroup;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  woClientUserList: any;
  minDate: any;
  submitted = false;
  formErrors: any;
  validationMessage = {
    'startDate': {
      'required': 'Start Date is required.',
      'invalidDate': 'Start Date in dd/mm/yyyy format.',
      'futureDate': 'Start Date cannot be in the future.'
    },
    'targetDate': {
      'required': 'Target Date is required.',
      'invalidDate': 'Target Date in dd/mm/yyyy format.',
      'pastDate': 'Target Date cannot be in the past.',
      'isLower': 'Target Date must be on or after the Plan End Date.',
    },
    'completionDate': {
      'required': 'Completion Date is required.',
      'invalidDate': 'Completion Date in dd/mm/yyyy format.',
    },
    'planStartDate': {
      'required': 'Plan Start Date is required.',
      'invalidDate': 'Plan Start Date in dd/mm/yyyy format.',
    },
    'planEndDate': {
      'required': 'Plan End Date is required.',
      'invalidDate': 'Plan End Date in dd/mm/yyyy format.',
      'isLower': 'Plan End Date must be on or after the Plan Start Date.',
      'isGreaterDate': 'Plane End Date cannot be later than the Target Completion Date.'
    },

  };

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperService: HelperService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.getWorkOrderClientUserList();

    if (this.openMilestoneFor == "checklist" || this.openMilestoneFor == "phase") {
      this.milestoneForm = this.fb.group({
        resUserVal: [''],
        attReqVal: [''],
        status: [''],
        startDate: ['', [SimpleDateValidator(), MustbeTodayOrLower()]],
        targetDate: ['', [ShouldGreaterThanYesterday(), SimpleDateValidator()]],
        completionDate: ['', [SimpleDateValidator()]],
        planStartDate: ['', [SimpleDateValidator()]],
        planEndDate: ['', [SimpleDateValidator()]],
        comments: [''],
      },
        {
          validator: [
            firstDateIsLower('planEndDate', 'planStartDate'),
          ],
        });

    } else if (this.openMilestoneFor == "manage") {
      this.title = 'Edit Milestone';
      this.milestoneForm = this.fb.group({
        resUserVal: [''],
        attReqVal: [''],
      });

    }


  }


  populateAndDisableField() {
    const { wocheckspeciaL2, woresponsibleuser, womilestonecomment, womilestonestatus, womilestonestartdate, womilestoneplanstartdate, womilestoneplanenddate, womilestonetargetdate, womilestonecompletiondate } = this.singleMilestone;

    if (this.openMilestoneFor == "checklist" || this.openMilestoneFor == "phase") {
      this.milestoneForm.patchValue({
        attReqVal: wocheckspeciaL2.trim(),
        resUserVal: woresponsibleuser,
        status: womilestonestatus,
        startDate: this.helperService.ngbDatepickerFormat(womilestonestartdate),
        targetDate: this.helperService.ngbDatepickerFormat(womilestonetargetdate),
        completionDate: this.helperService.ngbDatepickerFormat(womilestonecompletiondate),
        planStartDate: this.helperService.ngbDatepickerFormat(womilestoneplanstartdate),
        planEndDate: this.helperService.ngbDatepickerFormat(womilestoneplanenddate),
        comments: womilestonecomment
      });

      this.milestoneForm.get('attReqVal').disable();
    } else {
      this.milestoneForm.patchValue({
        attReqVal: wocheckspeciaL2.trim(),
        resUserVal: woresponsibleuser,
      });
    }

    this.chRef.detectChanges();
  }


  closeMilestoneEdit() {
    this.openMilestoneEdit = false;
    this.closeMilestoneEditEvent.emit(this.openMilestoneEdit);
  }

  getWorkOrderClientUserList() {
    const { wosequence } = this.singleMilestone;
    this.subs.add(
      this.worksOrdersService.getWorkOrderClientUserNames(wosequence).subscribe(
        data => {
          if (data.isSuccess) {
            this.woClientUserList = [...data.data];
            this.populateAndDisableField();
          } else this.alertService.error(data.message);
          this.chRef.detectChanges();

        }, err => this.alertService.error(err)
      )
    )

  }


  openCalendar(obj) {
    obj.toggle()
  }


  formErrorObject() {
    this.formErrors = {
      'resUserVal': '',
      'attReqVal': '',
      'status': '',
      'startDate': '',
      'targetDate': '',
      'completionDate': '',
      'planStartDate': '',
      'planEndDate': '',
      'comments': ''
    }
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {
          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            delete abstractControl.errors['ngbDate'];
            if (Object.keys(abstractControl.errors).length == 0) {
              abstractControl.setErrors(null)
            }
          }
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

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.milestoneForm);
    
    if (this.milestoneForm.invalid) {
      return;
    }

    if (this.openMilestoneFor == "manage") {
      const formValue = this.milestoneForm.value;
      let params = {
        wosequence: this.singleMilestone.wosequence,
        wochecksurcde: this.singleMilestone.wochecksurcde,
        wocheckspecial2: formValue.attReqVal.trim(),
        worespuser: formValue.resUserVal,
        strUserId: this.currentUser.userId
      }
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', "Are you sure you want to update the Milestone '" + this.singleMilestone.wocheckname + "'")
        .then((confirmed) => {
          if (confirmed) {
            this.subs.add(
              this.worksOrdersService.updateWorksOrderMilestone(params).subscribe(
                data => {
                  if (data.isSuccess) {
                    this.closeMilestoneEdit();
                    this.alertService.success([...data.data][0].pRETURNMESSAGE);
                  } else this.alertService.error(data.message);
                  this.chRef.detectChanges();
                }, err => this.alertService.error(err)
              )
            )
          }
        }).catch(() => console.log('Attribute dismissed the dialog.'));

    } else {
      //else milestone checklist
      const formValue = this.milestoneForm.getRawValue();
      const { wocheckspeciaL1 } = this.singleMilestone;
      const { status, startDate, completionDate } = formValue;

      if (status == "New" && (startDate || completionDate)) {
        this.alertService.error("Start and Completion date must be blank when status is 'New'.");
        return;
      }

      if (status == "N/A" && (wocheckspeciaL1 == "SIGNOFF" || wocheckspeciaL1 == "RELEASE")) {
        this.alertService.error(`Milestones Checklist types '${wocheckspeciaL1}' cannot be set to 'N/A'.`);
        return;
      }

      this.updateMilestone();
    }


  }

  updateMilestone(checkProcess = "C") {
    const { wosequence, wochecksurcde, wopsequence, wocheckresp } = this.singleMilestone;
    const formValue = this.milestoneForm.getRawValue();;
    const { resUserVal, attReqVal, status, startDate, targetDate, completionDate, planStartDate, planEndDate, comments } = formValue;
    const params = {
      wosequence: wosequence,
      wopsequence: wopsequence,
      wochecksurcde: wochecksurcde,
      strStatus: status,
      strResp: wocheckresp,
      strRespUser: resUserVal,
      strComment: comments,
      StartDate: this.helperService.dateObjToString(startDate),
      TargetDate: this.helperService.dateObjToString(targetDate),
      CompDate: this.helperService.dateObjToString(completionDate),
      PlanStartDate: this.helperService.dateObjToString(planStartDate),
      PlanEndDate: this.helperService.dateObjToString(planEndDate),
      strUserId: this.currentUser.userId,
      strCheckOrProcess: checkProcess,
    }

    this.subs.add(
      this.worksOrdersService.updateMilestoneItem(params).subscribe(
        data => {
          if (data.isSuccess) {
            let resp: any;
            if (data.data[0] == undefined) {
              resp = data.data;
            } else {
              resp = data.data[0];
            }

            if (checkProcess == "C" && (resp.pRETURNSTATUS == "E" || resp.pRETURNSTATUS == "S")) {
              this.openConfirmationDialog(resp)
            } else {
              this.alertService.success(resp.pRETURNMESSAGE)
              this.closeMilestoneEdit();
            }
          }
        }
      )
    )
  }

  public openConfirmationDialog(res) {
    let checkstatus = "C";
    if (res.pRETURNSTATUS == 'S') {
      checkstatus = "P"
    }

    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${res.pRETURNMESSAGE}`)
      .then((confirmed) => {
        if (confirmed) {
          if (res.pRETURNSTATUS == 'E') return
          this.updateMilestone(checkstatus)
        }
      }).catch(() => console.log('Attribute dismissed the dialog.'));
  }


}
