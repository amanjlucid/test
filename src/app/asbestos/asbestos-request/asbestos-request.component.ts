import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SharedService, AsbestosService, ConfirmationDialogService, AlertService, AssetAttributeService, HelperService } from '../../_services';
import { AsbestosDetailModel, AsbestosAttachmentModel } from '../../_models'
import { DateValidator } from 'src/app/_helpers';
declare var $: any;

@Component({
  selector: 'app-asbestos-request',
  templateUrl: './asbestos-request.component.html',
  styleUrls: ['./asbestos-request.component.css']
})
export class AsbestosRequestComponent implements OnInit {
  currentUser: any;
  @Input() selectedAsbestos: any;
  @Input() disableActionBtn: boolean;
  @Input() asbestosRequest: boolean = false;
  @Output() closeAsbestosRequest = new EventEmitter<boolean>();
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  attachment: boolean = false;
  selectedAsset: any;// getting value from share data service
  asbestosRequestForm: FormGroup;
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
  disableAsbestosForm: boolean = false;
  asbestosAttachmentModel: AsbestosAttachmentModel = {};
  activeAttachments: any;
  public gridView: DataResult;
  selectedAttachment: any;
  authValidationPopup: boolean = false;
  authValidationMessage: string = '';
  requestTitle = '';
  successMsg = '';
  editDisable = false;
  constructor(
    private dataShareService: SharedService,
    private fb: FormBuilder,
    private asbestosService: AsbestosService,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService,
    private assetAttributeService: AssetAttributeService,
    private helper: HelperService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.requestTitle = this.disableActionBtn ? "Edit Request" : 'New Request';
    this.successMsg = this.disableActionBtn ? "Request successfully updated." : 'Request successfully submitted.';
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.selectedAsbestos.aaurequestuserid == this.currentUser.userId) {
      this.editDisable = false;
    } else {
      this.editDisable = true;
    }

    this.asbestosRequestForm = this.fb.group({
      action: [this.selectedAsbestos.aaudactiontype, [Validators.required]],
      completionDate: [this.setInitialDate(this.selectedAsbestos.aaudcompletiondate.trim()), [Validators.required, DateValidator()]],
      description: [this.selectedAsbestos.aauddescription],
    })


    if (this.selectedAsbestos.aaudreqstatus.trim() == 'P' || this.selectedAsbestos.aaudreqstatus.trim() == 'H' || this.selectedAsbestos.aaudreqstatus.trim() == 'R') {
      this.disableAsbestosForm = true;
    } else {
      this.disableAsbestosForm = false;
    }

    this.asbestosAttachmentModel = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
    }

    this.getActiveAttachment(this.asbestosAttachmentModel);
    this.dataShareService.sharedAsset.subscribe(data => { this.selectedAsset = data });
    this.dataShareService.asbestosAttachmentSource.subscribe(data => { this.selectedAttachment = data });
    this.dataShareService.asbestosAttachmet.subscribe(data => {
      this.activeAttachments = data;
      this.gridView = process(this.activeAttachments, this.state)
    });

  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.activeAttachments, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAttachment = dataItem;
    //console.log(this.selectedAttachment);
  }

  closeAsbestosRequestWin() {
    this.asbestosRequest = false;
    this.closeAsbestosRequest.emit(this.asbestosRequest);
  }

  getActiveAttachment(asbestosAttachmentModel) {
    this.subs.add(
      this.asbestosService.getActiveAttachment(asbestosAttachmentModel).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.activeAttachments = data.data;
            this.dataShareService.changeAsbestosAttachment(this.activeAttachments);
            this.gridView = process(this.activeAttachments, this.state)
            let selectedAttachment: any;
            this.dataShareService.changeSelectedAsbestosAttachment(selectedAttachment);
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
    this.logValidationErrors(this.asbestosRequestForm);
    if (this.asbestosRequestForm.invalid) {
      return;
    }
    let asbestosData: AsbestosDetailModel = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      strUserId: this.currentUser.userId,
      NextSequence: -1,//this.selectedAsbestos.aausequence,
      RequestCompleted: 'N',
      RequestUserId: this.currentUser.userId,
      RequestDate: new Date().toJSON(),
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
      ActionType: this.asbestosRequestForm.value.action,
      CompletionDate: this.dateISOFormat(this.asbestosRequestForm.value.completionDate),
      Description: this.asbestosRequestForm.value.description,
      AAUDREQSTATUS: 'P',
      AAUDAUTHUSERID: this.currentUser.userId,
    };

    this.subs.add(
      this.asbestosService.validateRequest(asbestosData).subscribe(
        data => {
          if (data.isSuccess && data.data == "OK") {
            this.asbestosService.submitSingleRequest(asbestosData).subscribe(
              reqData => {
                if (reqData.isSuccess) {
                  this.alertService.success(this.successMsg)
                  this.assetAttributeService.getAssetAsbestosList(this.selectedAsbestos.assid).subscribe(
                    asbestoslistData => {
                      if (asbestoslistData && asbestoslistData.isSuccess) {
                        this.dataShareService.changeAsbestos(asbestoslistData.data);
                        this.closeAsbestosRequestWin();
                      }
                    }
                  )

                } else {
                  this.alertService.error(reqData.message);
                }
              }
            )
          } else {
            this.authValidationPopup = true;
            $('.asbestosReq').addClass('ovrlay');
            this.authValidationMessage = data.data;
          }
        }
      )
      //this.asbestosService.editAsbestosRequest(asbestosData).subscribe()
    )
  }

  editRequestDesctiption() {
    if (this.editDisable) {
      this.alertService.error("You can't edit this record.")
      return
    }
    let asbestosData = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      Description: this.asbestosRequestForm.value.description,
    };

    this.subs.add(
      this.asbestosService.updateRequestDescription(asbestosData).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.assetAttributeService.getAssetAsbestosList(this.selectedAsbestos.assid).subscribe(
              data => {
                if (data && data.isSuccess) {
                  this.alertService.success(this.successMsg)
                  this.dataShareService.changeAsbestos(data.data);
                }
              }
            )
            this.closeAsbestosRequestWin();
          }
        }
      )
    )
  }

  get f() { return this.asbestosRequestForm.controls; }

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

  closeAuthValidationPopup(val) {
    this.authValidationPopup = false;
    this.closeAsbestosRequestWin();
  }

  setInitialDate(value) {
    let dateObj: any = new Date(value);
    if (dateObj.getFullYear() == 1753) {
      dateObj = new Date();
      //return ''
    }
    dateObj = dateObj.toString();
    // else {
    //   return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`
    // }
    return this.helper.ngbDatepickerFormat(dateObj);
  }

  toggleCalendar(c) {
    if (!this.disableAsbestosForm) {
      c.toggle();
    }
  }

  dateISOFormat(value) {
    var dateString   = `${value.year}-${value.month}-${value.day}`;
    return new Date(dateString).toJSON();
  }

  openAttachment() {
    $('.asbestosReq').addClass('ovrlay')
    this.attachment = true;
  }

  closeAttachment($event) {
    $('.asbestosReq').removeClass('ovrlay')
    this.attachment = $event;
  }

}
