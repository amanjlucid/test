import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubSink } from 'subsink';
import { AsbestosService, SharedService } from '../../_services';
import { AsbestosAttachmentModel } from 'src/app/_models';

@Component({
  selector: 'app-asbestos-edit-attachment',
  templateUrl: './asbestos-edit-attachment.component.html',
  styleUrls: ['./asbestos-edit-attachment.component.css']
})
export class AsbestosEditAttachmentComponent implements OnInit {
  @Input() editAttachmentDetails: boolean = false;
  @Input() selectedAsbestos: any;
  @Input() editAttachmentArea: string = 'description';
  @Input() selectedAttachment: any;
  @Output() closeEditAttachment = new EventEmitter<boolean>();
  formModelValue: any = {};
  subs = new SubSink();
  formErrors = {
    note: { maxLength: false },
    description: { maxLength: false }
  };


  constructor(
    private asbestosService: AsbestosService,
    private dataShareService: SharedService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    //console.log(this.selectedAttachment);
    this.formModelValue.note = this.selectedAttachment.aauanote;
    this.formModelValue.description = this.selectedAttachment.aauadesc;
    this.formModelValue.status = this.selectedAttachment.aauastatus;
  
  }

  closeEditAttachmentWin() {
    this.editAttachmentDetails = false;
    this.closeEditAttachment.emit(this.editAttachmentDetails);
  }

  updateAttachmentDetail(attachmentForm: NgForm) {

    const noteControl = attachmentForm.controls['note'];
    const descriptionControl = attachmentForm.controls['description'];

    if (descriptionControl.value.length > 1024) {
      descriptionControl.setErrors({ maxLength: true });
      this.formErrors.description['maxLength'] = true;
    } else {
      descriptionControl.setErrors(null);
      this.formErrors.description['maxLength'] = false;
    }
    if (noteControl.value.length > 1024) {
      noteControl.setErrors({ maxLength: true });
      this.formErrors.note['maxLength'] = true;
    } else {
      noteControl.setErrors(null);
      this.formErrors.note['maxLength'] = false;
    }

    if (attachmentForm.invalid) {
      return;
    }

    const attachmentObj: any[] = new Array();
    attachmentObj[0] = { 'Process': 0, 'UpdateText': this.formModelValue.description }
    attachmentObj[1] = { 'Process': 1, 'UpdateText': this.formModelValue.note }
    attachmentObj[2] = { 'Process': 2, 'UpdateText': this.formModelValue.status }
    const editAttachmentModel = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
      AAUASEQUENCE: this.selectedAttachment.aauasequence,
      EditDetails: attachmentObj
    }
    this.subs.add(
      this.asbestosService.editAttachment(editAttachmentModel).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.selectedAttachment.aauanote = this.formModelValue.note;
            this.selectedAttachment.aauadesc = this.formModelValue.description;
            this.selectedAttachment.aauastatus = this.formModelValue.status;

            const asbestosAttachmentModel: AsbestosAttachmentModel = {
              ASSID: encodeURIComponent(this.selectedAsbestos.assid),
              AUCCODE: this.selectedAsbestos.auccode,
              AUDCODE: this.selectedAsbestos.audcode,
              AAUSEQUENCE: this.selectedAsbestos.aausequence,
              ASASSEQUENCE: this.selectedAsbestos.asassequence,
            }
            this.asbestosService.getActiveAttachment(asbestosAttachmentModel).subscribe(
              data => {
                if (data && data.isSuccess) {
                  this.closeEditAttachmentWin();
                  this.dataShareService.changeAsbestosAttachment(data.data);
                }
              }
            )
          }
        }
      )
    )
  }

}
