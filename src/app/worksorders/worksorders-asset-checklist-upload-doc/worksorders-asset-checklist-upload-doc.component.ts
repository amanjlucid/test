import { Component, OnInit, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SubSink } from 'subsink';
import { AlertService, LoaderService, WorksorderManagementService } from '../../_services'

@Component({
  selector: 'app-worksorders-asset-checklist-upload-doc',
  templateUrl: './worksorders-asset-checklist-upload-doc.component.html',
  styleUrls: ['./worksorders-asset-checklist-upload-doc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetChecklistUploadDocComponent implements OnInit {

  @Input() uploadAttachment: any;
  @Input() selectedChecklist: any;
  @Output() closeAttachment = new EventEmitter<boolean>();
  @Output() complete = new EventEmitter<boolean>();
  form: FormGroup;
  error: string;
  uploadResponse = { status: '', message: 0, filePath: '' };
  uploadObj: any = { image: [], message: '' };
  subs = new SubSink();
  filesToUpload: Array<File> = [];

  errors: Array<string> = [];
  dragAreaClass: string = 'dragarea';
  fileExt: string = "JPG, GIF, PNG, PDF";
  maxFiles: number = 5;
  maxSize: number = 5; // 5MB
  uploadStatus = false;
  currentUser: any;
  // systemValues: any;
  filePath: any

  @HostListener('dragover', ['$event']) onDragOver(event) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }

  @HostListener('dragenter', ['$event']) onDragEnter(event) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }

  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }

  @HostListener('drop', ['$event']) onDrop(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
    event.stopPropagation();
    let files = event.dataTransfer.files;
    // this.uploadFile(files);
  }

  constructor(
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // console.log(this.selectedChecklist)
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getPath();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getPath() {
    this.subs.add(
      this.worksorderManagementService.getListOfSystemValuesByCode().subscribe(
        data => {
          if (data.isSuccess) {
            this.filePath = data.data[0]._text;
          } else {
            this.alertService.error(data.message);
          }
          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }


  onFileChange(event) {
    this.uploadFile(event.target.files)
  }

  closeUploadAttachment() {
    this.uploadAttachment = false;
    this.closeAttachment.emit(this.uploadAttachment);
  }

  uploadFile(files) {
    this.errors = []; // Clear error
    this.uploadObj = { image: [], message: '' };
    this.uploadResponse = { status: '', message: 0, filePath: '' };

    // debugger
    if (files.length > 0 && (!this.isValidFiles(files))) {
      this.uploadStatus = false;
      this.chRef.detectChanges();
      return;
    }

    if (files.length > 0) {
      let uploadMsg = '';
      if (files.length == 1) {
        uploadMsg = `${files.length} file is`
      } else if (files.length > 1) {
        uploadMsg = `${files.length} files are`
      }
      this.uploadObj.message = `${uploadMsg} uploading...`;

      // this.uploadResponse.message = '0';
      $('.progress-bar').css({ 'background-color': '#ffffff' });
      $('.progress-bar').css({ 'width': '' }).attr('aria-valuenow', 0);

      let averageUploadedPercent = Math.round(parseFloat('100') / parseFloat(files.length));
      let checkUploadPercent = 0;
      let uploadedFile = 0;

      // document upload

      for (let file of files) {
        this.uploadObj.image.push(file);
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('WO_FILEPATH', this.filePath);
        formData.append('WO_LEVEL', '2');
        formData.append('WO_SEQNO', this.selectedChecklist.wosequence);
        formData.append('WOP_SEQNO', this.selectedChecklist.wopsequence);
        formData.append('ASSID', this.selectedChecklist.assid);
        formData.append('CHECKSURCDE', this.selectedChecklist.wochecksurcde);
        formData.append('CurrentUser', this.currentUser.userId);

        this.loaderService.pageShow();

        let httpres = this.worksorderManagementService.workOrderUploadDocument(formData).subscribe(
          data => {
            uploadedFile++;
            checkUploadPercent += averageUploadedPercent;
            if (checkUploadPercent > 95) {
              checkUploadPercent = 100;

            }
            this.uploadResponse.message = checkUploadPercent
            // console.log(this.uploadResponse)

            if (uploadedFile == files.length) {
              this.uploadObj.message = `${uploadMsg} uploaded.`;

              this.loaderService.pageHide();
              this.complete.emit(true);
            }
          },
          error => {
            this.loaderService.pageHide();
            this.alertService.error(error);
          });
      }


    }
  }


  getWidth(val) {
    if (val.message != undefined && val.message != null) {
      return val.message + "%";
    }
  }

  onSubmit() { }

  private isValidFiles(files) {
    // Check Number of files
    if (files.length > this.maxFiles) {
      this.errors.push("Error: At a time you can upload only " + this.maxFiles + " files");
      return;
    }
    this.isValidFileExtension(files);
    return this.errors.length === 0;
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
        this.errors.push("Error (Extension): " + files[i].name);
      }
      // Check file size
      this.isValidFileSize(files[i]);
    }
  }

  private isValidFileSize(file) {
    let fileSizeinMB = file.size / (1024 * 1000);
    let size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
    if (size > this.maxSize)
      this.errors.push("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
  }

}
