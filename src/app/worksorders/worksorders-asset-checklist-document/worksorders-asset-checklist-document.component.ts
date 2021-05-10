import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, ConfirmationDialogService, HelperService, LoaderService, SharedService } from 'src/app/_services';


@Component({
  selector: 'app-worksorders-asset-checklist-document',
  templateUrl: './worksorders-asset-checklist-document.component.html',
  styleUrls: ['./worksorders-asset-checklist-document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetChecklistDocumentComponent implements OnInit {
  @Input() checklistDocWindow: boolean = false;
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
  worksOrderAccess = [];
  constructor(
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperServie: HelperService,
    private sharedService: SharedService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {

    this.sharedService.worksOrdersAccess.subscribe(
      data => {
        this.worksOrderAccess = data;
      }
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
    // this.getDocs(this.selectedAction.assid);

  }

  getDocs(assid) {
    // this.subs.add(
    //   this.resultSrevice.getHealthSafetyFileName(assid).subscribe(
    //     data => {
    //       //console.log(data);
    //       if (data.isSuccess) {
    //         let tempObj = Object.assign([], data.data);
    //         tempObj.map((x: any) => {
    //           x.ntpmodified = this.helperServie.formatDateTime(x.ntpmodified)
    //         })
    //         this.douments = tempObj
    //         this.gridData = process(this.douments, this.state);
    //         this.chRef.detectChanges();
    //       }
    //     }
    //   )
    // )
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
    // if (this.selectedDoc) {
    //   this.subs.add(
    //     this.resultSrevice.deleteHealthSafetyDocument(this.selectedDoc.assid, this.selectedDoc.ntpsequence).subscribe(
    //       data => {
    //         if (data.isSuccess) {
    //           this.alertService.success("Document deleted successfully.");
    //           this.getDocs(this.selectedAction.assid);
    //         } else {
    //           this.alertService.error(data.message);
    //         }
    //       }
    //     )
    //   )
    // }
  }

  complete($event) {
    // this.getDocs(this.selectedAction.assid);
  }

  viewDocument() {
    // if (this.selectedDoc) {
    //   this.loaderService.pageShow()
    //   let param = {
    //     "sessionId": "",
    //     "userId": this.currentUser.userId,
    //     "requestType": "",
    //     "requestParameter": this.selectedDoc.fileName
    //   }


    //   this.subs.add(
    //     this.resultSrevice.viewDoc(param).subscribe(
    //       data => {
    //         this.loaderService.pageHide()

    //         if (data.isSuccess && data.data && data.data.length > 0) {
    //           let baseStr = data.data;
    //           const fileName = `${this.selectedDoc.description}`;
    //           let fileExt = "pdf";
    //           this.assetAttributeService.getMimeType(fileExt).subscribe(
    //             mimedata => {
    //               if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
    //                 var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
    //                 if (mimedata.data.openWindow) {
    //                   var byteCharacters = atob(baseStr);
    //                   var byteNumbers = new Array(byteCharacters.length);
    //                   for (var i = 0; i < byteCharacters.length; i++) {
    //                     byteNumbers[i] = byteCharacters.charCodeAt(i);
    //                   }
    //                   var byteArray = new Uint8Array(byteNumbers);
    //                   var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
    //                   var fileURL = URL.createObjectURL(file);
    //                   let newPdfWindow = window.open(fileURL);

    //                   // let newPdfWindow = window.open("",this.selectedNotes.fileName);
    //                   // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
    //                   // let iframeEnd = "'><\/iframe>";
    //                   // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
    //                   // newPdfWindow.document.title = this.selectedNotes.fileName;
    //                 }
    //                 else {
    //                   linkSource = linkSource + baseStr;
    //                   const downloadLink = document.createElement("a");
    //                   downloadLink.href = linkSource;
    //                   downloadLink.download = fileName;
    //                   downloadLink.click();
    //                 }
    //               }
    //               else {
    //                 this.alertService.error("This file format is not supported.");
    //               }
    //             }
    //           )
    //         }

    //       },
    //       error => {
    //         this.loaderService.pageHide()
    //         this.alertService.error(error)
    //       }
    //     )
    //   )
    // } else {
    //   this.alertService.error("Please select one record first")
    // }
  }

}
