import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorksorderManagementService, AlertService, HelperService, LoaderService } from '../../_services'
import { ShouldGreaterThanYesterday, SimpleDateValidator } from 'src/app/_helpers';

@Component({
  selector: 'app-no-access',
  templateUrl: './no-access.component.html',
  styleUrls: ['./no-access.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoAccessComponent implements OnInit {
  @Input() noaccessWindow: boolean = false;
  @Input() selectedChecklistsingleItem: any;
  @Output() closeNoAccessWinEvent = new EventEmitter<boolean>();
  @Output() refreshChecklist = new EventEmitter<boolean>();
  title = 'No Access Window';

  subs = new SubSink();
  submitted = false;
  formErrors: any;
  noAccessForm: FormGroup;
  validationMessage = {
    'asset': {
      'required': 'Asset is required.',
    },
    'noaccessdate': {
      'required': 'No Access Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
    },
    'comment': {
      'required': 'Comment is required.',
    },
    'nextaccessdate': {
      'required': 'Next Access Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'pastDate': 'Next Access Date cannot be in the past.'
    }
  };
  minDate: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private alertService: AlertService,
    private workOrderProgrammeService: WorksorderManagementService,
    private helperService: HelperService,
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {
    this.noAccessForm = this.fb.group({
      asset: [{ value: '', disabled: true }, [Validators.required]],
      noaccessdate: ['', [Validators.required, SimpleDateValidator()]],
      comment: ['', [Validators.required]],
      nextaccessdate: ['', [Validators.required, ShouldGreaterThanYesterday(), SimpleDateValidator()]]
    });

    // get asset address
    const { assid } = this.selectedChecklistsingleItem;
    this.subs.add(
      this.workOrderProgrammeService.getAssetAddressByAsset(assid).subscribe(
        data => {
          if (data.isSuccess) {
            const { assid, astconcataddress } = data.data[0];
            this.noAccessForm.patchValue({
              asset: `${assid} - ${astconcataddress}`,
              noaccessdate: this.minDate
            });
          } else this.alertService.error(data.message)
        }
      )
    )



  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  closeNoAccessWindow() {
    this.noaccessWindow = false;
    this.closeNoAccessWinEvent.emit(this.noaccessWindow);
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

  formErrorObject() {
    this.formErrors = {
      'asset': '',
      'noaccessdate': '',
      'comment': '',
      'nextaccessdate': '',
    }
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.noAccessForm);

    this.chRef.detectChanges();

    if (this.noAccessForm.invalid) {
      return;
    }


    const { wosequence, wochecksurcde, wopsequence, assid, wostagesurcde } = this.selectedChecklistsingleItem;

    let formRawVal = this.noAccessForm.getRawValue();
    let params: any = {}
    params.WOSEQUENCE = wosequence;
    params.WOPSEQUENCE = wopsequence;
    params.ASSID = assid;
    params.WOStageCode = wostagesurcde;
    params.WOCheckCode = wochecksurcde;
    params.NoAccessDate = this.helperService.dateObjToString(formRawVal.noaccessdate);
    params.Comment = formRawVal.comment;
    params.NextAccessDate = this.helperService.dateObjToString(formRawVal.nextaccessdate);
    params.UserId = this.currentUser.userId;

    this.subs.add(
      this.workOrderProgrammeService.insertNoAccessRecord(params).subscribe(
        data => {
          if (data.isSuccess) {
            const { pRETURNSTATUS, pRETURNMESSAGE } = data.data[0];
            if (pRETURNSTATUS == "S") {
              this.alertService.success(pRETURNMESSAGE);
              this.closeNoAccessWindow()
              this.refreshChecklist.emit(true)
            }
          } else this.alertService.error("Something went wrong.")
        }, err => this.alertService.error(err)
      )
    )

  }

  openCalendar(obj) {
    obj.toggle()
  }

}
