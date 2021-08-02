import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedService, AsbestosService, AlertService, ConfirmationDialogService } from '../../_services';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AsbestosAttachmentModel } from 'src/app/_models';
declare var $: any;

@Component({
  selector: 'app-asbestos-attachment',
  templateUrl: './asbestos-attachment.component.html',
  styleUrls: ['./asbestos-attachment.component.css']
})
export class AsbestosAttachmentComponent implements OnInit {
  @Input() attachment: boolean = false;
  @Input() selectedAsbestos: any;
  @Output() closeAttachment = new EventEmitter<boolean>();
  editAttachmentDetails: boolean = false;
  uploadAttachment: boolean = false;
  asbestosAttachmentModel: AsbestosAttachmentModel = {};
  activeAttachments: any;
  subs = new SubSink();
  public gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  editAttachmentArea: string = "description";
  selectedAttachment: any;
  viewAttachment: boolean = false;
  readonly: boolean = true;

  constructor(
    private dataShareService: SharedService,
    private asbestosService: AsbestosService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.dataShareService.asbestosAttachmentSource.subscribe(data => { this.selectedAttachment = data });
    this.dataShareService.asbestosAttachmet.subscribe(data => {
      this.activeAttachments = data;
      this.gridView = process(this.activeAttachments, this.state)
    });
    this.asbestosAttachmentModel = {
      ASSID: this.selectedAsbestos.assid,
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.activeAttachments, this.state);
  }


  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAttachment = dataItem;
    //console.log(this.selectedAttachment);
  }

  closeAsbestosAttachmenttWin() {
    this.attachment = false;
    this.closeAttachment.emit(this.attachment);
  }


  editAttachmentDetailsFunction(editArea) {
    if (this.selectedAttachment != undefined) {
      this.editAttachmentArea = editArea;
      $('.attachmentOverlay').addClass('ovrlay');
      this.editAttachmentDetails = true;
    } else {
      this.alertService.error('Please select one attachment');
    }
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

  getActiveAttachment(asbestosAttachmentModel) {
    this.subs.add(
      this.asbestosService.getActiveAttachment(asbestosAttachmentModel).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.activeAttachments = data.data;
            this.dataShareService.changeAsbestosAttachment(this.activeAttachments);
            let selectedAttachment: any;
            this.dataShareService.changeSelectedAsbestosAttachment(selectedAttachment);
          }
        }
      )
    )
  }

  closeEditAttachment($event) {
    $('.attachmentOverlay').removeClass('ovrlay');
    this.editAttachmentDetails = $event;
  }

  uploadAttachmentFunction() {
    $('.attachmentOverlay').addClass('ovrlay');
    this.uploadAttachment = true;
  }

  closeUploadAttachment($event) {
    $('.attachmentOverlay').removeClass('ovrlay');
    this.uploadAttachment = $event;
  }

  viewAttachmentFunction() {
    if (this.selectedAttachment != undefined) {
      $('.attachmentOverlay').addClass('ovrlay');
      this.viewAttachment = true;
    } else {
      this.alertService.error('Please select one attachment');
    }
  }

  closeViewAttachment($event) {
    $('.attachmentOverlay').removeClass('ovrlay');
    this.viewAttachment = $event;
  }

}
