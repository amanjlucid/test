import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, AssetAttributeService, ConfirmationDialogService, HelperService, LoaderService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { combineLatest, forkJoin } from 'rxjs';
import { GridComponent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-wo-document-list',
  templateUrl: './wo-document-list.component.html',
  styleUrls: ['./wo-document-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoDocumentListComponent implements OnInit {
  @ViewChild('addDoc') input;
  @Input() documentWindow: boolean = false;
  @Input() selectedWorksOrder: any;

  @Output() closeDocument = new EventEmitter<boolean>();
  title = 'Documents for Works Order';
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
  errors: string[];
  fileExt: string = "JPG, GIF, PNG, PDF";
  maxSize: number = 5; // 5MB
  filePath;
  loading = true;
  worksOrderAccess: any = [];
  userType: any = [];
  @ViewChild(GridComponent) grid: GridComponent;


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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    // console.log(this.selectedWorksOrder);
    this.requiredPageData();

    this.subs.add(
      this.worksorderManagementService.getListOfSystemValuesByCode().subscribe(
        data => {
          if (data.isSuccess) {
            this.filePath = data.data[0]._text;
          } else {
            this.alertService.error(data.message);
          }
        },
        err => this.alertService.error(err)
      )
    )

    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          // console.log(data);
          this.userType = data[2][0];
          this.worksOrderAccess = data[0]
        }
      )
    )

    this.getDocumentData();

  }

  requiredPageData() {
    const { wprsequence, wosequence } = this.selectedWorksOrder;
    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorkProgrammesByWprsequence(wprsequence),
        this.worksorderManagementService.getWorksOrderByWOsequence(wosequence),
      ]).subscribe(
        data => {
          const programmeData = data[0];
          const worksOrderData = data[1];
          if (programmeData.isSuccess) this.programmeData = programmeData.data[0];
          if (worksOrderData.isSuccess) this.worksOrderData = worksOrderData.data;
          this.chRef.detectChanges();
        }
      )
    )
  }

  getDocumentData() {
    const { wosequence } = this.selectedWorksOrder;
    this.subs.add(
      this.worksorderManagementService.getWEBWorksOrdersFilenameList(wosequence).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);

            setTimeout(() => {
              this.grid.autoFitColumns();
            }, 100);

          } else this.alertService.error(data.message)

          this.loading = false;
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

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedDoc = dataItem;
  }

  closeDocumentWindow() {
    this.documentWindow = false;
    this.closeDocument.emit(false);
  }



  openEditDoc() {
    if (this.selectedDoc) {
      this.showEditDoc = true;
      $('.wodocOvrlay').addClass('ovrlay');
    }
  }

  closeEditDoc(event) {
    this.showEditDoc = event;
    $('.wodocOvrlay').removeClass('ovrlay');
    this.getDocumentData();
  }


  closeAttachment($event) {
    $('.wodocOvrlay').removeClass('ovrlay');
    this.uploadAttachment = $event
  }

  uploadImage(imageFor) {
    $('.wodocOvrlay').addClass('ovrlay');
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
      const { wosequence } = this.selectedWorksOrder;
      const { ntpsequence } = this.selectedDoc;
      const { userId } = this.currentUser;
      this.subs.add(
        this.worksorderManagementService.removeWorksOrderDocument(wosequence, ntpsequence, userId).subscribe(
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
    this.getDocumentData();
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
        this.worksorderManagementService.viewWODoc(param).subscribe(
          data => {
            // console.log(data);
            this.loaderService.pageHide()

            if (data.isSuccess && data.data && data.data.length > 0) {
              let baseStr = data.data;
              const fileName = `${this.selectedDoc.description}`;

              let fileExt = this.selectedDoc.filename.substring(this.selectedDoc.filename.lastIndexOf(".") + 1).toLowerCase();

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



  private isValidFileExtension(files) {
    // Make array of file extensions
    let extensions: any;

    extensions = (this.fileExt.split(',')).map(function (x) { return x.toLocaleUpperCase().trim() });

    for (let i = 0; i < files.length; i++) {
      // Get file extension
      let ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
      // Check the extension exists
      let exists = extensions.includes(ext);
      if (!exists) {
        this.alertService.error("Error (Extension): " + files[i].name)
        return false;
      }
      // Check file size
      return this.isValidFileSize(files[i]);
    }
  }

  private isValidFileSize(file) {
    let fileSizeinMB = file.size / (1024 * 1000);
    let size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
    if (size > this.maxSize) {
      this.alertService.error("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
      return false;
    }

    return true

  }

  private validateFile(file) {
    return this.isValidFileExtension(file);
  }

  public openFileNotExistConfirmationOnAdd() {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'You cannot add a document that is outside of the Works Order Document Location directory.  Upload Document Now?')
      .then((confirmed) => (confirmed) ? $('.uploadDocBtn').trigger('click') : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }

  onFileChange(event) {
    const file = event.target.files;

    if (file.length > 0 && this.validateFile(file) == false) {
      return;
    }

    if (file.length > 0) {
      const fullFilePath = `${this.filePath}\\${file[0].name}`
      this.worksorderManagementService.attachmentExists(fullFilePath).subscribe(
        fileExist => {

          if (!fileExist.isSuccess) {
            this.openFileNotExistConfirmationOnAdd();
            return;
          }

          const formData = new FormData();

          formData.append('file', file[0], file[0].name);
          formData.append('WO_FILEPATH', this.filePath);
          formData.append('WO_LEVEL', '0');
          formData.append('WO_SEQNO', this.selectedWorksOrder.wosequence);
          formData.append('WOP_SEQNO', '0');
          formData.append('ASSID', '');
          formData.append('CHECKSURCDE', '0');
          formData.append('CurrentUser', this.currentUser.userId);

          this.worksorderManagementService.workOrderUploadDocument(formData).subscribe(
            data => {
              if (data) {
                this.getDocumentData()
              } else {
                this.alertService.error("Something went wrong, File not uploaded.")
              }
            },
            err => this.alertService.error(err)
          )

        }
      )




    }

  }

}
