import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubSink } from 'subsink';
import { SharedService, ServicePortalService, LoaderService, AlertService, HelperService } from '../../_services'

@Component({
  selector: 'app-service-edit-notepad',
  templateUrl: './service-edit-notepad.component.html',
  styleUrls: ['./service-edit-notepad.component.css']
})
export class ServiceEditNotepadComponent implements OnInit {
  @Input() servicingDetails: any;
  @Input() editNotePad: boolean;
  @Input() selectedNotepad: any;
  @Output() closeEditAttachment = new EventEmitter<boolean>();
  formModelValue: any = {};
  subs = new SubSink();
  formErrors = {
    description: { maxLength: false }
  };
  currentUser: any;

  constructor(
    private servicePortalService: ServicePortalService,
    private alertService: AlertService,
    private dataShareService: SharedService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.formModelValue.description = this.selectedNotepad.ntptexT2;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeEditAttachmentFunction() {
    this.editNotePad = false;
    this.closeEditAttachment.emit(this.editNotePad);
  }

  updateAttachmentDetail(attachmentForm: NgForm) {
    const descriptionControl = attachmentForm.controls['description'];
    if (descriptionControl.value.length > 1024) {
      descriptionControl.setErrors({ maxLength: true });
      this.formErrors.description['maxLength'] = true;
    } else {
      descriptionControl.setErrors(null);
      this.formErrors.description['maxLength'] = false;
    }

    if (attachmentForm.invalid) {
      return;
    }

    let editSelectedDescriptionParams = this.selectedNotepad;
    editSelectedDescriptionParams.ntptexT2 = this.formModelValue.description;
    delete editSelectedDescriptionParams.description;
    delete editSelectedDescriptionParams.mimetype;
    delete editSelectedDescriptionParams.openinline;

    this.subs.add(
      this.servicePortalService.UpdateServiceNotepadAttachmentDescription(editSelectedDescriptionParams).subscribe(
        data => {
          if (data.isSuccess) {
            this.closeEditAttachmentFunction();
            const notepadParams = {
              Assid: this.servicingDetails.assid,
              Userid: this.currentUser.userId,
              ASJNumber: this.servicingDetails.job_Number,
            }
            this.servicePortalService.GetServiceJobNotepadsForAsset(notepadParams).subscribe(
              data => {
                if (data.isSuccess) {
                  this.loaderService.pageHide();
                  this.dataShareService.changeServiceNotepadAttachment(data.data);
                } else {
                  this.alertService.error(data.message);
                }
              }
            )
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

  }


}
