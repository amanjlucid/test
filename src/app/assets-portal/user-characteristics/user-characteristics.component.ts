import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AlertService, ServicePortalService, WorksorderManagementService } from 'src/app/_services';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-user-characteristics',
  templateUrl: './user-characteristics.component.html',
  styleUrls: ['./user-characteristics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserCharacteristicsComponent implements OnInit {
  subs = new SubSink();
  @Input() openUserChar: boolean = false;
  @Output() closeUserCharEvent = new EventEmitter<boolean>();
  userCharForm: FormGroup;
  windowTitle = 'Edit User Characteristics'
  chacodeListData1 = []
  chacodeListData2 = []
  chacodeListData3 = []
  submitted = false;
  formErrors: any;
  validationMessage = {
    'chacode1': {
      'required': 'Please choose a Characteristic for reporting column 1.',
    },
    'chacode2': {
      'required': 'Please choose a Characteristic for reporting column 2.',
    },
    'chacode3': {
      'required': 'Please choose a Characteristic for reporting column 3.',
    },

    'alias1': {
      'maxlength': 'Maximum length of Column Heading is 20.',
    },
    'alias2': {
      'maxlength': 'Maximum length of Column Heading is 20.',
    },
    'alias3': {
      'maxlength': 'Maximum length of Column Heading is 20.',
    },

  };
  amendedTermSave$ = new Subject<any>();
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private woService: WorksorderManagementService,
    private servicePortalService: ServicePortalService,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  ngOnInit(): void {
    this.userCharForm = this.fb.group({
      chacode1: ['', [Validators.required]],
      chacode2: ['', [Validators.required]],
      chacode3: ['', [Validators.required]],
      status1: false,
      status2: false,
      status3: false,
      alias1: ['', Validators.maxLength(20)],
      alias2: ['', Validators.maxLength(20)],
      alias3: ['', Validators.maxLength(20)],
    });


    this.subs.add(
      this.userCharForm.get('chacode1').valueChanges.subscribe(
        val => {
          const findCharCode = this.chacodeListData1.find(x => x.chacode == val);
          if (findCharCode) {
            this.userCharForm.patchValue({ alias1: findCharCode.chaname })
          }
        }
      ),

      this.userCharForm.get('chacode2').valueChanges.subscribe(
        val => {
          const findCharCode = this.chacodeListData2.find(x => x.chacode == val);
          if (findCharCode) {
            this.userCharForm.patchValue({ alias2: findCharCode.chaname })
          }
        }
      ),

      this.userCharForm.get('chacode3').valueChanges.subscribe(
        val => {
          const findCharCode = this.chacodeListData3.find(x => x.chacode == val);
          if (findCharCode) {
            this.userCharForm.patchValue({ alias3: findCharCode.chaname })
          }
        }
      )
    )

    // this.getCharCode();

    this.subs.add(
      forkJoin([this.woService.getReportingCharConfigData2(''), this.servicePortalService.getUserAssetCharacteristics(this.currentUser.userId)]).subscribe(
        data => {
          const userCharData = data[0];
          const userCharSavedData = data[1];

          if (userCharData.isSuccess) {
            this.chacodeListData1 = userCharData.data.reportingCharacteristics;
            this.chacodeListData2 = userCharData.data.reportingCharacteristics;
            this.chacodeListData3 = userCharData.data.reportingCharacteristics;
          }

          if (userCharSavedData.isSuccess) {
            
            if (userCharSavedData.data.length == 0) return

            this.userCharForm.patchValue({
              chacode1: userCharSavedData.data[0].chacode,
              alias1: userCharSavedData.data[0].chaalias,
              status1: userCharSavedData.data[0].chadisp == 0 ? false : true,

              chacode2: userCharSavedData.data[1].chacode,
              alias2: userCharSavedData.data[1].chaalias,
              status2: userCharSavedData.data[1].chadisp == 0 ? false : true,

              chacode3: userCharSavedData.data[2].chacode,
              alias3: userCharSavedData.data[2].chaalias,
              status3: userCharSavedData.data[2].chadisp == 0 ? false : true,
            })
          }

        }
      )
    )


    this.subs.add(
      this.amendedTermSave$
        .pipe(
          debounceTime(1000),
        ).subscribe((val) => {
          this.findCharCode(val);
        })
    );

    this.chRef.detectChanges()
  }

  // getCharCode(search = '') {
  //   this.subs.add(
  //     this.woService.getReportingCharConfigData2(search).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           this.chacodeListData1 = data.data.reportingCharacteristics;
  //           this.chacodeListData2 = data.data.reportingCharacteristics;
  //           this.chacodeListData3 = data.data.reportingCharacteristics;
  //           this.getUserAssetCharacteristic();
  //         }
  //       }
  //     )
  //   )
  // }

  // getUserAssetCharacteristic(){
  //   this.subs.add(
  //     this.servicePortalService.getUserAssetCharacteristics(this.currentUser.userId).subscribe(
  //       data => {
  //         console.log(data)
  //       }
  //     )
  //   )
  // }

  findCharCode(obj) {
    const { search, row } = obj
    this.subs.add(
      this.woService.getReportingCharConfigData2(search).subscribe(
        data => {
          if (data.isSuccess) {
            if (row == 1) this.chacodeListData1 = data.data.reportingCharacteristics;
            if (row == 2) this.chacodeListData2 = data.data.reportingCharacteristics;
            if (row == 3) this.chacodeListData3 = data.data.reportingCharacteristics;
            this.chRef.detectChanges()
          }
        }
      )
    )
  }


  trackByChCode(index: number, item) {
    return item.chacode
  }


  formErrorObject() {
    this.formErrors = {
      'chacode1': '',
      'chacode2': '',
      'chacode3': '',
      'status1': '',
      'status2': '',
      'status3': '',
      'alias1': '',
      'alias2': '',
      'alias3': '',
    }
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {
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
    this.logValidationErrors(this.userCharForm);

    if (this.userCharForm.invalid) {
      return;
    }

    let formRawVal = this.userCharForm.getRawValue();
    console.log(formRawVal)

    const params = [
      { CHACode: formRawVal.chacode1, CHAAliase: formRawVal.alias1, CHADescription: formRawVal.alias1, CHAId: '' },
      { CHACode: formRawVal.chacode2, CHAAliase: formRawVal.alias2, CHADescription: formRawVal.alias1, CHAId: '' },
      { CHACode: formRawVal.chacode3, CHAAliase: formRawVal.alias3, CHADescription: formRawVal.alias1, CHAId: '' },

    ]


  }


  keyupevent(search, row) {
    this.amendedTermSave$.next({ search, row });
  }

  closeUserCharacteristics() {
    this.openUserChar = false;
    this.closeUserCharEvent.emit(this.openUserChar)
  }

}
