import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, AssetAttributeService, ConfirmationDialogService, HelperService, LoaderService, SharedService, WorksorderManagementService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { GridComponent } from '@progress/kendo-angular-grid';



@Component({
  selector: 'app-worksorders-asset-document',
  templateUrl: './worksorders-asset-document.component.html',
  styleUrls: ['./worksorders-asset-document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetDocumentComponent implements OnInit {
  @ViewChild('addDoc') input;
  @Input() assetDocWindow: boolean = false;
  @Input() selectedAsset: any;
  @Input() selectedChildRow: any
  @Output() closeAssetDocEvent = new EventEmitter<boolean>();
  title = 'Documents for Works Order Asset';
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
  initialLoadDocsCount = 0;
  initialLoad = true;
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

  ngOnInit(): void {
    // console.log(this.selectedChecklist);
    // debugger;

    var dd = this.selectedAsset;
    var ee = this.selectedChildRow;
    this.worksOrderDetailPageData();
    this.getDocumentData();

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
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          // console.log(data);
          this.userType = data[1][0];
            this.worksOrderAccess = data[0]
        }
      )
    )

    // this.subs.add(
    //   this.sharedService.worksOrdersAccess.subscribe(
    //     data => {
    //       this.worksOrderAccess = data;
    //     }
    //   )
    // )
  }

  worksOrderDetailPageData() {
    const intWOSEQUENCE = this.selectedAsset.wosequence;

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
    const Assid_WOPSequence = `${this.selectedAsset.assid}-${this.selectedAsset.wopsequence}`;
    const woseq = this.selectedAsset.wosequence;

    this.subs.add(
      this.worksorderManagementService.getWOPAssetDoc(woseq, Assid_WOPSequence).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.gridData = data.data;
            if(this.initialLoad){
              this.initialLoadDocsCount = data.data.length;
              this.initialLoad = false;
            }
            this.gridView = process(this.gridData, this.state);

            setTimeout(() => {
              this.grid.autoFitColumns();
            }, 100);

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
    this.assetDocWindow = false;
    let v = this.gridView.data.length
    this.closeAssetDocEvent.emit(this.gridView.data.length != this.initialLoadDocsCount);
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
      const checklistdata = this.selectedAsset;
      let params = {
        WOSEQUENCE: checklistdata.wosequence,
        ASSID: checklistdata.assid,
        WOPSEQUENCE: checklistdata.wopsequence,
        NTPSEQUENCE: this.selectedDoc.ntpsequence,
        UserId: this.currentUser.userId
      }
      this.subs.add(
        this.worksorderManagementService.removeWorksOrderAssetDocument(params).subscribe(
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
        this.worksorderManagementService.viewDoc(param).subscribe(
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
    // if (this.fileType != "P") {
    //   let fileExt = "PDF";
    //   extensions = (fileExt.split(',')).map(function (x) { return x.toLocaleUpperCase().trim() });
    // } else {
    //   extensions = (this.fileExt.split(',')).map(function (x) { return x.toLocaleUpperCase().trim() });
    // }
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
    // console.log(file)

    if (file.length > 0 && this.validateFile(file) == false) {
      return;
    }

    if (file.length > 0) {
      const fullFilePath = `${this.filePath}\\${file[0].name}`
      this.worksorderManagementService.attachmentExists(fullFilePath).subscribe(
        fileExist => {
          // console.log(fileExist);
          if (!fileExist.isSuccess) {
            this.openFileNotExistConfirmationOnAdd();
            return;
          }

          const formData = new FormData();

          formData.append('file', file[0], file[0].name);
          formData.append('WO_FILEPATH', this.filePath);
          formData.append('WO_LEVEL', '1');
          formData.append('WO_SEQNO', this.selectedChildRow.wosequence);
          formData.append('WOP_SEQNO', this.selectedChildRow.wopsequence);
          formData.append('ASSID', this.selectedAsset.assid);
          formData.append('CurrentUser', this.currentUser.userId);

          this.worksorderManagementService.workOrderUploadDocument(formData).subscribe(
            data => {
              // console.log(data)
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
