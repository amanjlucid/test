import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataResult, process, State, SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { AssetAttributeService, AlertService, SharedService, ServicePortalService, ConfirmationDialogService, HelperService } from '../../_services'
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-service-service-notepads',
  templateUrl: './service-service-notepads.component.html',
  styleUrls: ['./service-service-notepads.component.css']
})
export class ServiceServiceNotepadsComponent implements OnInit {
  readonly: boolean = true;
  subs = new SubSink();
  gridView: DataResult;
  @Input() servicingDetails: any;
  @Output() closeServiceDetailsWin = new EventEmitter<boolean>();
  filter: CompositeFilterDescriptor;
  multiple = false;
  allowUnsort = true;
  state: State = {
    skip: 0,
    sort: [{
      field: 'description',
      dir: 'asc'
    }],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  currentUser: any;
  notepadListData: any;
  selectedNotepad: any;
  uploadAttachment: boolean = false;
  notesDetails: boolean = false;
  notesTitle: string = "";
  notesImagePath: SafeResourceUrl;
  editNotePad: boolean = false;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private servicePortalService: ServicePortalService,
    private helper: HelperService,// used in html
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private _sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const notepadParams = {
      Assid: this.servicingDetails.assid,
      Userid: this.currentUser.userId,
      ASJNumber: this.servicingDetails.job_Number,
    }

    this.subs.add(
      this.sharedService.serviceNotepadAttachment.subscribe(
        data => {
          this.notepadListData = data;
          this.gridView = process(this.notepadListData, this.state);
        }
      )
    )
    this.getNotepadlist(notepadParams);

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.notepadListData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.notepadListData, this.state);
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedNotepad = dataItem;
  }

  getNotepadlist(params) {
    this.subs.add(
      this.servicePortalService.GetServiceJobNotepadsForAsset(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.sharedService.changeServiceNotepadAttachment(data.data);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  removeNotepadAttachment() {
    const removeNotepadParams = {
      assid: this.selectedNotepad.assid,
      jobNumber: this.servicingDetails.job_Number,
      sequenceNumber: this.selectedNotepad.ntpsequence
    }
    this.subs.add(
      this.servicePortalService.RemoveNotepadAttachment(removeNotepadParams).subscribe(
        data => {
          if (data.isSuccess) {
            this.selectedNotepad = undefined;
            const notepadParams = {
              Assid: this.servicingDetails.assid,
              Userid: this.currentUser.userId,
              ASJNumber: this.servicingDetails.job_Number,
            }
            this.getNotepadlist(notepadParams);
          } else {
            this.alertService.error(data.message);
          }

        }
      )
    )
  }

  openConfirmationDialog() {
    if (this.selectedNotepad != undefined) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Delete notepad item ?')
        .then((confirmed) => (confirmed) ? this.removeNotepadAttachment() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error('Please select one record.');
    }
  }

  viewNotepadAttachment() {
    if (this.selectedNotepad != undefined) {
      if (this.selectedNotepad.ntplinktype == 'P') {
        $('.notepadOverlay').addClass('ovrlay');
        let lnk = this.selectedNotepad.ntplink;
        this.subs.add(
          this.assetAttributeService.getNotepadImage(this.selectedNotepad.ntptype, this.selectedNotepad.assid, this.selectedNotepad.ntpgenericcodE2, this.selectedNotepad.ntpsequence).subscribe(
            data => {
              this.notesDetails = true;
              this.notesTitle = "View Notepad Image...";
              this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
                'data:image/jpg;base64,' + data);
            }
          )
        )

      } else if (this.selectedNotepad.ntplinktype == 'N') {
        $('.notepadOverlay').addClass('ovrlay');
        this.notesTitle = "View Notepad Note...";
        this.notesDetails = true;
      } else if (this.selectedNotepad.ntplinktype == 'L') {
        let lnk = this.selectedNotepad.ntplink;

        let fileExt = lnk.substring(lnk.lastIndexOf(".") + 1).toLowerCase();
        this.assetAttributeService.getMimeType(fileExt).subscribe(
          mimedata => {
            if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                this.assetAttributeService.getNotepadFile(this.selectedNotepad.ntptype, this.selectedNotepad.assid, this.selectedNotepad.ntpgenericcodE2, this.selectedNotepad.ntpsequence).subscribe(
                  filedata => {
                    if (mimedata.data.openWindow)
                    {
                      var byteCharacters = atob(filedata);
                      var byteNumbers = new Array(byteCharacters.length);
                      for (var i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      var byteArray = new Uint8Array(byteNumbers);
                      var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                      var fileURL = URL.createObjectURL(file);
                      let newPdfWindow =window.open(fileURL);

                      // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                      // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                      // let iframeEnd = "'><\/iframe>";
                      // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                      // newPdfWindow.document.title = this.selectedNotes.fileName;
                    }
                    else
                    {
                      linkSource = linkSource + filedata;
                      const downloadLink = document.createElement("a");
                      const fileName = this.selectedNotepad.ntptexT1;
                      downloadLink.href = linkSource;
                      downloadLink.download = fileName;
                      downloadLink.click();
                    }
                  }
                )
              }
              else{
                this.alertService.error("This file format is not supported.");
              }
          }
        )

      } else if (this.selectedNotepad.ntplinktype == 'I') {
        let url: string = '';
        if (!/^http[s]?:\/\//.test(this.selectedNotepad.ntplink)) {
          url += 'http://';
        }
        url += this.selectedNotepad.ntplink;
        window.open(url, '_blank');
      }

    } else {
      this.alertService.error('Please select one record.');
    }
  }


  closeNotesDetails() {
    this.notesDetails = false;
    //this.selectedNotepad = undefined;
    $('.notepadOverlay').removeClass('ovrlay');
  }

  editNotepadAttachment() {
    if (this.selectedNotepad != undefined) {
      this.editNotePad = true;
      $('.notepadOverlay').addClass('ovrlay');
    } else {
      this.alertService.error('Please select one record.');
    }
  }

  closeEditAttachment($event) {
    this.selectedNotepad = undefined;
    this.editNotePad = $event;
    $('.notepadOverlay').removeClass('ovrlay');
  }

  closeServiceDetailWindow() {
    this.closeServiceDetailsWin.emit(false);
  }

  addNotepadAttachment() {
    $('.notepadOverlay').addClass('ovrlay');
    this.uploadAttachment = true;
  }

  closeNotepadAttachment($event) {
    this.selectedNotepad = undefined;
    this.uploadAttachment = $event;
    $('.notepadOverlay').removeClass('ovrlay');
  }



}
