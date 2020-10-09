import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SharedService, AsbestosService, AlertService, ConfirmationDialogService, AssetAttributeService, HelperService } from '../../_services';
import { AsbestosDetailModel, AsbestosAttachmentModel } from '../../_models'
import { DateValidator } from 'src/app/_helpers';
declare var $: any;

@Component({
  selector: 'app-asbestos-auth',
  templateUrl: './asbestos-auth.component.html',
  styleUrls: ['./asbestos-auth.component.css']
})
export class AsbestosAuthComponent implements OnInit {

  currentUser: any;
  @Input() disableActionBtn: boolean = true;
  @Input() selectedAsbestos: any;
  @Input() asbestosAuth: boolean = false;
  @Output() closeAsbestosAuth = new EventEmitter<boolean>();
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  attachment: boolean = false;
  selectedAsset: any;// getting value from share data service
  asbestosAuthForm: FormGroup;
  submitted: boolean = false;
  validationMessage = {
    'action': {
      'required': 'Action is required.',
    },
    'completionDate': {
      'required': 'Completion Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'futureDate': 'Completion Date cannot be in the future.',
    },
    'description': {
      'required': 'Description is required.',
    }
  };
  formErrors: any;
  disableAsbestosForm: boolean = true;
  asbestosAttachmentModel: AsbestosAttachmentModel = {};
  activeAttachments: any;
  public gridView: DataResult;
  selectedAttachment: any;
  editAttachmentDetails: boolean = false;
  wariningPopup: boolean = false;

  constructor(
    private dataShareService: SharedService,
    private fb: FormBuilder,
    private asbestosService: AsbestosService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private assetAttributeService: AssetAttributeService,
    private helper: HelperService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.dataShareService.sharedAsset.subscribe(data => { this.selectedAsset = data });
    this.dataShareService.asbestosAttachmet.subscribe(data => {
      this.activeAttachments = data;
      this.gridView = process(this.activeAttachments, this.state)
    });
    this.asbestosAuthForm = this.fb.group({
      action: [this.selectedAsbestos.aaudactiontype, [Validators.required]],
      completionDate: [this.setInitialDate(this.selectedAsbestos.aaudcompletiondate), [Validators.required, DateValidator()]],
      description: [this.selectedAsbestos.aauddescription],
    })

    // if (this.selectedAsbestos.aaudreqstatus.trim() == 'P' || this.selectedAsbestos.aaudreqstatus.trim() == 'H' || this.selectedAsbestos.aaudreqstatus.trim() == 'R') {
    //   this.disableAsbestosForm = true;
    // } else {
    //   this.disableAsbestosForm = false;
    // }

    this.asbestosAttachmentModel = {
      ASSID: this.selectedAsbestos.assid,
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
    }

    this.getActiveAttachment(this.asbestosAttachmentModel);

  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.activeAttachments, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAttachment = dataItem;
  }

  closeAsbestosAuthWin() {
    this.asbestosAuth = false;
    this.closeAsbestosAuth.emit(this.asbestosAuth);
  }

  getActiveAttachment(asbestosAttachmentModel) {
    this.subs.add(
      this.asbestosService.getActiveAttachment(asbestosAttachmentModel).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.activeAttachments = data.data;
            this.dataShareService.changeAsbestosAttachment(this.activeAttachments);
            this.gridView = process(this.activeAttachments, this.state)
          }
        }
      )
    )
  }

  public openConfirmationDialog() {
    if (this.selectedAttachment != undefined) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.removeAttachment() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error('Please select one attachment');
    }

  }

  removeAttachment() {
    this.asbestosAttachmentModel.AAUASEQUENCE = this.selectedAttachment.aauasequence  // set value for deleting attachment
    this.subs.add(
      this.asbestosService.removeAttachment(this.asbestosAttachmentModel).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.getActiveAttachment(this.asbestosAttachmentModel);
          }
        }
      )
    )
  }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.asbestosAuthForm);
    if (this.asbestosAuthForm.invalid) {
      return;
    }
    let asbestosData: AsbestosDetailModel = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      strUserId: this.currentUser.userId,
      NextSequence: this.selectedAsbestos.aausequence,
      RequestCompleted: 'Y',
      RequestUserId: this.currentUser.userId,
      RequestDate: new Date().toLocaleString(),
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
      ActionType: this.asbestosAuthForm.value.action,
      CompletionDate: this.dateFormate(this.asbestosAuthForm.value.completionDate),
      Description: this.asbestosAuthForm.value.description,
      AAUDREQSTATUS: 'P',
      AAUDAUTHUSERID: this.currentUser.userId,
    };
    //console.log(asbestosData);

    // this.subs.add(
    //   this.asbestosService.editAsbestosRequest(asbestosData).subscribe()
    // )



  }

  get f() { return this.asbestosAuthForm.controls; }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            delete abstractControl.errors['ngbDate'];
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
      'action': '',
      'completionDate': '',
      'description': ''
    }
  }

  editAttachmentDetailsFunction() {
    if (this.selectedAttachment != undefined) {
      $('.asbestosReq').addClass('ovrlay');
      this.editAttachmentDetails = true;
    } else {
      this.alertService.error('Please select one attachment');
    }
  }

  closeEditAttachment($event) {
    $('.asbestosReq').removeClass('ovrlay');
    this.editAttachmentDetails = $event;
  }

  setInitialDate(value) {
    let dateObj:any = new Date(value);
    if (dateObj.getFullYear() == 1753) {
      return '';
    } else {
      dateObj = dateObj.toString();
      return this.helper.ngbDatepickerFormat(dateObj);
    }
  }

  dateFormate(value) {
    return `${value.month}-${value.day}-${value.year}`
  }

  openAttachment() {
    $('.asbestosReq').addClass('ovrlay')
    this.attachment = true;
  }

  closeAttachment($event) {
    $('.asbestosReq').removeClass('ovrlay')
    this.attachment = $event;
  }

  authoriseRequest(reqAccept) {
    let successMsg = 'Request successfully authorised.';
    
    if (this.selectedAsbestos.sampleList.length > 0) {
      if (this.selectedAsbestos.sampleList[0].analysisStatusText == 'Pending') {
        this.wariningPopup = true;
        $('.asbestosReq').addClass('ovrlay');
        return;
      }
    }
    const asbestosDetails = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
      strUserId: this.currentUser.userId,
      acceptRequest: reqAccept,
      keepAttachments: reqAccept,
      ActionType: this.asbestosAuthForm.value.action,
    }

    this.subs.add(
      this.asbestosService.validateAuthorise(asbestosDetails).subscribe(
        data => {
           console.log(data)
          if (data.isSuccess && data.data == "OK") {
            this.asbestosService.submitAuthoriseWithAttachments(asbestosDetails).subscribe(
              data => {
                console.log(data);
                if (data.isSuccess) {
                  this.alertService.success(successMsg);
                  this.assetAttributeService.getAssetAsbestosList(this.selectedAsbestos.assid).subscribe(
                    data => {
                      if (data && data.isSuccess) {
                        this.dataShareService.changeAsbestos(data.data);
                      }
                    }
                  )
                  this.closeAsbestosAuthWin();
                } else {
                  this.alertService.error(data.message)
                }
              }
            )
          }
        }
      )
    )
  }

  closerWarningPopup(val = null) {
    this.wariningPopup = false;
    $('.asbestosReq').removeClass('ovrlay');
  }

  // getAssetAsbestosList() {
  //   this.subs.add(
  //     this.assetAttributeService.getAssetAsbestosList(this.selectedAsbestos.assid).subscribe(
  //       data => {
  //         if (data && data.isSuccess) {
  //           this.dataShareService.changeAsbestos(data.data);
  //         }
  //       }
  //     )
  //   )
  // }

}
