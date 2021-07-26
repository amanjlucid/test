import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, AssetAttributeService, ConfirmationDialogService, HelperService, LoaderService, SharedService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { GridComponent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-milestones-document-list',
  templateUrl: './milestones-document-list.component.html',
  styleUrls: ['./milestones-document-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MilestonesDocumentListComponent implements OnInit {
  @ViewChild('addDoc') input;
  @Input() documentWindow: boolean = false;
  @Input() selectedMilestoneInp: any;
  @Output() closeDocument = new EventEmitter<boolean>();
  title = 'Milestone Documents';
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
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  // worksOrderAccess = [];
  // worksOrderUsrAccess: any = [];
  // userType: any = [];
  loading = true;
  @ViewChild(GridComponent) grid: GridComponent;
  filePath;
  showEditDoc = false;
  errors: string[];
  fileExt: string = "JPG, GIF, PNG, PDF";
  maxSize: number = 5; // 5MB
  description: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private helperServie: HelperService,
    // private sharedService: SharedService,
    private loaderService: LoaderService,
    private worksOrderService: WorksOrdersService,
    private assetAttributeService: AssetAttributeService,
    private worksorderManagementService: WorksorderManagementService,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    // this.subs.add(
    //   combineLatest([
    //     this.sharedService.woUserSecObs,
    //     this.sharedService.worksOrdersAccess,
    //     this.sharedService.userTypeObs
    //   ]).subscribe(
    //     data => {
    //       this.worksOrderAccess = data[0];
    //       this.worksOrderUsrAccess = data[1];
    //       this.userType = data[2][0];
    //     }
    //   )
    // )

    this.subs.add(
      this.worksorderManagementService.getListOfSystemValuesByCode().subscribe(
        data => {
          if (data.isSuccess) this.filePath = data.data[0]._text;
          else this.alertService.error(data.message);
        }, err => this.alertService.error(err)
      )
    )

    this.getMilestoneDocuments();
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.gridData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.gridData, this.state);
  }

  cellClickHandler({ dataItem }) {
    this.selectedDoc = dataItem;
  }

  closeDocumentWindow() {
    this.documentWindow = false;
    this.closeDocument.emit(false);
  }

  getMilestoneDocuments() {
    const { wosequence, wopsequence, wochecksurcde } = this.selectedMilestoneInp;
    this.subs.add(
      this.worksOrderService.getWEBWorksOrdersMiletoneFilenameList(wosequence, `${wopsequence}_${wochecksurcde}`).subscribe(
        data => {
          if (data.isSuccess) {
            this.gridData = data.data;
            this.gridView = process(this.gridData, this.state);
            setTimeout(() => { this.grid.autoFitColumns(); }, 100);
          } else this.alertService.error(data.message)
          this.loading = false;
          this.chRef.detectChanges();
        }, err => this.alertService.error(err)
      )
    )
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
                  else this.alertService.error("This file format is not supported.");
                }
              )
            } else this.alertService.error(data.message);

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


  addDocument() {
    $('#addDoc').trigger('click');
  }

  onFileChange(event) {
    const file = event.target.files;

    if (file.length > 0 && this.validateFile(file) == false) return;

    if (file.length > 0) {
      const fullFilePath = `${this.filePath}\\${file[0].name}`
      this.worksorderManagementService.attachmentExists(fullFilePath).subscribe(
        fileExist => {

          if (!fileExist.isSuccess) {
            this.openFileNotExistConfirmationOnAdd();
            return;
          }

          const { wosequence, wocheckname, wopsequence, wochecksurcde } = this.selectedMilestoneInp;

          const formData = new FormData();
          formData.append('file', file[0], file[0].name);
          formData.append('WOSequence', wosequence);
          formData.append('WOPandCHECK', `${wopsequence}_${wochecksurcde}`);
          formData.append('MILESTONE', wocheckname);
          formData.append('PathAndFilename', fullFilePath);
          formData.append('Description', file[0].name);
          formData.append('WO_FILEPATH', this.filePath);
          formData.append('CurrentUser', this.currentUser.userId);

          this.worksOrderService.workOrderMileStoneUploadDocument(formData).subscribe(
            data => {
              if (data) this.getMilestoneDocuments()
              else this.alertService.error("Something went wrong, File not uploaded.")
            }, err => this.alertService.error(err)
          )

        }
      )

    }

  }


  openFileNotExistConfirmationOnAdd() {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', 'You cannot add a document that is outside of the Works Order Document Location directory.  Upload Document Now?')
      .then((confirmed) => (confirmed) ? $('.uploadDocBtn').trigger('click') : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  openConfirmationDialog() {
    if (this.selectedDoc) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.removeDocument() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    }
  }


  removeDocument() {
    if (this.selectedDoc) {
      const { wosequence, wocheckname, wopsequence, wochecksurcde } = this.selectedMilestoneInp;
      const params = {
        WOSEQUENCE: wosequence,
        WOPandCHECK: `${wopsequence}_${wochecksurcde}`,
        MILESTONE: wocheckname,
        NTPSEQUENCE: this.selectedDoc.ntpsequence,
        UserId: this.currentUser.userId
      }

      this.subs.add(
        this.worksOrderService.removeWorksOrderMilestoneDocument(params).subscribe(
          data => {
            if (data.isSuccess) {
              this.alertService.success("Document deleted successfully.");
              this.getMilestoneDocuments();
            } else this.alertService.error(data.message);
          }, err => this.alertService.error(err)
        )
      )
    }
  }

  openEditDoc() {
    if (this.selectedDoc) {
      this.showEditDoc = true;
      this.description = this.selectedDoc.description
      $('.wodocOvrlay').addClass('ovrlay');
      this.chRef.detectChanges();
    }
  }

  closeEditDoc() {
    this.showEditDoc = false;
    $('.wodocOvrlay').removeClass('ovrlay');
    this.getMilestoneDocuments();
  }


  updateDescription() {
    //update doc description 
    const { wosequence, wocheckname, wopsequence, wochecksurcde } = this.selectedMilestoneInp;

    let params = {
      WOSEQUENCE: wosequence,
      WOPandCHECK: `${wopsequence}_${wochecksurcde}`,
      MILESTONE: wocheckname,
      NTPSEQUENCE: this.selectedDoc.ntpsequence,
      Description: this.description,
      UserId: this.currentUser.userId

    }

    this.subs.add(
      this.worksOrderService.updateWorksOrderMilestoneDocument(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Description updated successfully.")
            this.closeEditDoc()
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )

    )


  }

}
