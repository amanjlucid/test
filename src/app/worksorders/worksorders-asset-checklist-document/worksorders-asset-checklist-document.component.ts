import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, AssetAttributeService, ConfirmationDialogService, HelperService, LoaderService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-worksorders-asset-checklist-document',
  templateUrl: './worksorders-asset-checklist-document.component.html',
  styleUrls: ['./worksorders-asset-checklist-document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetChecklistDocumentComponent implements OnInit {
  @ViewChild('addDoc') input;
  @Input() checklistDocWindow: boolean = false;
  @Input() selectedChecklist: any;
  @Output() closeAssetchecklistDocEvent = new EventEmitter<boolean>();
  title = 'Documents for Works Order Asset Checklist item';
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
  gridView: DataResult;
  gridData: any;
  selectedDoc: any
  showEditDoc: boolean = false
  uploadAttachment: boolean = false;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  readonly = true;
  worksOrderData: any;
  programmeData: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperServie: HelperService,
    private sharedService: SharedService,
    private loaderService: LoaderService,
    private worksorderManagementService: WorksorderManagementService,
    private assetAttributeService: AssetAttributeService,


  ) { }

  ngOnInit(): void {
    this.worksOrderDetailPageData();
    this.getDocumentData();
  }

  worksOrderDetailPageData() {
    const intWOSEQUENCE = this.selectedChecklist[0].wosequence;

    this.subs.add(
      this.worksorderManagementService.getWorksOrderByWOsequence(intWOSEQUENCE).subscribe(
        data => {
          if (data.isSuccess) {
            this.worksOrderData = data.data;
            this.worksorderManagementService.getWorkProgrammesByWprsequence(data.data.wprsequence).subscribe(
              prdata => {
                if (prdata.isSuccess) this.programmeData = prdata.data[0]
                else this.alertService.error(prdata.message)
                this.chRef.detectChanges();
              },
              err => this.alertService.error(err)
            )
          }
          else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )

  }

  getDocumentData() {
    this.selectedDoc = undefined;
    const Assid_WOPSequence_CheckSurcde = `${this.selectedChecklist[0].assid}-${this.selectedChecklist[0].wopsequence}-${this.selectedChecklist[0].wochecksurcde}`;
    const woseq = this.selectedChecklist[0].wosequence;

    this.subs.add(
      this.worksorderManagementService.getWOPAssetChecklistDoc(woseq, Assid_WOPSequence_CheckSurcde).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
          } else this.alertService.error(data.message)
          this.chRef.detectChanges();
        }
      )
    )
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.gridData, this.state);
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedDoc = dataItem;
  }

  closeChecklistDoc() {
    this.checklistDocWindow = false;
    this.closeAssetchecklistDocEvent.emit(this.checklistDocWindow);
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openEditDoc() {
    if (this.selectedDoc) {
      this.showEditDoc = true;
      $('.docOvrlay').addClass('ovrlay');
    }
  }

  closeEditDoc(event) {
    this.showEditDoc = event;
    $('.docOvrlay').removeClass('ovrlay');
    this.getDocumentData();

  }


  closeAttachment($event) {
    $('.docOvrlay').removeClass('ovrlay');
    this.uploadAttachment = $event
  }

  uploadImage(imageFor) {
    $('.docOvrlay').addClass('ovrlay');
    this.uploadAttachment = true

  }

  public openConfirmationDialog() {
    if (this.selectedDoc) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.removeDocument() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    }
  }



  removeDocument() {
    if (this.selectedDoc) {
      const checklistdata = this.selectedChecklist[0];
      let params = {
        WOSEQUENCE: checklistdata.wosequence,
        ASSID: checklistdata.assid,
        WOPSEQUENCE: checklistdata.wopsequence,
        CHECKSURCDE: checklistdata.wochecksurcde,
        NTPSEQUENCE: this.selectedDoc.ntpsequence,
        UserId: this.currentUser.userId
      }
      this.subs.add(
        this.worksorderManagementService.removeWorksOrderAssetChecklistDocument(params).subscribe(
          data => {
            if (data.isSuccess) {
              this.alertService.success("Document deleted successfully.");
              this.getDocumentData();
            } else {
              this.alertService.error(data.message);
            }
          }
        )
      )
    }
  }

  complete($event) {
    // this.getDocumentData();
  }

  viewDocument() {
    if (this.selectedDoc) {
      this.loaderService.pageShow()
      let param = {
        "sessionId": "",
        "userId": this.currentUser.userId,
        "requestType": "",
        "requestParameter": this.selectedDoc.filename
      }


      this.subs.add(
        this.worksorderManagementService.viewDoc(param).subscribe(
          data => {
            console.log(data);
            this.loaderService.pageHide()

            if (data.isSuccess && data.data && data.data.length > 0) {
              let baseStr = data.data;
              const fileName = `${this.selectedDoc.description}`;
              let fileExt = "pdf";
              this.assetAttributeService.getMimeType(fileExt).subscribe(
                mimedata => {
                  if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                    var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                    if (mimedata.data.openWindow) {
                      var byteCharacters = atob(baseStr);
                      var byteNumbers = new Array(byteCharacters.length);
                      for (var i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      var byteArray = new Uint8Array(byteNumbers);
                      var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                      var fileURL = URL.createObjectURL(file);
                      let newPdfWindow = window.open(fileURL);

                      // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                      // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                      // let iframeEnd = "'><\/iframe>";
                      // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                      // newPdfWindow.document.title = this.selectedNotes.fileName;
                    }
                    else {
                      linkSource = linkSource + baseStr;
                      const downloadLink = document.createElement("a");
                      downloadLink.href = linkSource;
                      downloadLink.download = fileName;
                      downloadLink.click();
                    }
                  }
                  else {
                    this.alertService.error("This file format is not supported.");
                  }
                }
              )
            } else {
              this.alertService.error(data.message);
            }

          },
          error => {
            this.loaderService.pageHide()
            this.alertService.error(error)
          }
        )
      )
    } else {
      this.alertService.error("Please select one record first")
    }
  }


  addDocument() {
    $('#addDoc').trigger('click');
  }

  onFileChange(event){
    const file = event.target.files;
  }

}
