import { Component, OnInit, Input, Output, EventEmitter, Injectable, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HelperService, HnsResultsService, AlertService, LoaderService, SharedService } from '../../_services'

@Component({
  selector: 'app-worksorders-asset-checklist-upload-doc',
  templateUrl: './worksorders-asset-checklist-upload-doc.component.html',
  styleUrls: ['./worksorders-asset-checklist-upload-doc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetChecklistUploadDocComponent implements OnInit {

  @Input() uploadAttachment: any;
  @Input() selectedChecklist: any;
  @Input() isAssessment: boolean = false;
  @Input() imageFor: string = "ans";
  @Input() rootAction: any = [];
  @Output() closeAttachment = new EventEmitter<boolean>();
  @Input() fileType: any = "P";
  @Output() complete = new EventEmitter<boolean>();
  @Input() selectedIssue: any;
  //uploadSaveUrl = 'saveUrl'; // should represent an actual API endpoint
  //uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
  form: FormGroup;
  error: string;
  uploadResponse = { status: '', message: 0, filePath: '' };
  uploadObj: any = { image: [], message: '' };
  subs = new SubSink();
  filesToUpload: Array<File> = [];

  errors: Array<string> = [];
  dragAreaClass: string = 'dragarea';
  //projectId: number = 0;
  //sectionId: number = 0;
  fileExt: string = "JPG, GIF, PNG";
  maxFiles: number = 5;
  maxSize: number = 5; // 5MB
  uploadStatus = false;
  currentUser: any;
  systemValues: any;
  // sesCode: any = ["Select Service Stage"];

  // selectedSesCode: any;

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
    private resultService: HnsResultsService,
    private alertService: AlertService,
    private helper: HelperService,
    private formBuilder: FormBuilder,
    private dataShareService: SharedService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(this.imageFor);
    // console.log(this.fileType)
    this.getPath()
    //this.GetNotepadSesCodeList(this.servicingDetails.service_Type_Code);
    // console.log(this.selectedAction.hasissueid)
    // console.log(this.selectedAction)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getPath() {
    let path = this.fileType == "P" ? "IMAGELOCAL" : "HSDOCSLOCN";
    this.subs.add(
      this.resultService.getSystemValues(path).subscribe(
        data => {
          //console.log(data)
          if (data.isSuccess) {
            this.systemValues = data.data[0];
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  onFileChange(event) {
    //this.uploadFile(event.target.files)
  }

  closeUploadAttachment() {
    this.uploadAttachment = false;
    this.closeAttachment.emit(this.uploadAttachment);
  }

  // uploadFile(files) {
  //   this.errors = []; // Clear error
  //   this.uploadObj = { image: [], message: '' };
  //   this.uploadResponse = { status: '', message: 0, filePath: '' };

  //   if (files.length > 0 && (!this.isValidFiles(files))) {
  //     this.uploadStatus = false;
  //     return;
  //   }

  //   if (files.length > 0) {
  //     let uploadMsg = '';
  //     if (files.length == 1) {
  //       uploadMsg = `${files.length} file is`
  //     } else if (files.length > 1) {
  //       uploadMsg = `${files.length} files are`
  //     }
  //     this.uploadObj.message = `${uploadMsg} uploading...`;

  //     // this.uploadResponse.message = '0';
  //     $('.progress-bar').css({ 'background-color': '#ffffff' });
  //     $('.progress-bar').css({ 'width': '' }).attr('aria-valuenow', 0);

  //     let averageUploadedPercent = Math.round(parseFloat('100') / parseFloat(files.length));
  //     let checkUploadPercent = 0;
  //     let uploadedFile = 0;

  //     if (this.fileType == "P") {
  //       let issueId: any = 0;
  //       if (this.imageFor != "ans") {
  //         if (this.selectedIssue != undefined) {
  //           if (this.selectedIssue.length == undefined) {
  //             issueId = this.selectedIssue.hasissueid
  //           } else {
  //             issueId = this.selectedAction.hasissueid
  //           }
  //         } else {
  //           issueId = this.selectedAction.hasissueid
  //         }
  //       }
  //       //let issueId = (this.imageFor == "ans") ? 0 : (this.selectedIssue) ? this.selectedIssue.hasissueid : this.selectedAction.hasissueid;

  //       let assrf: any;
  //       if (this.isAssessment) {
  //         assrf = this.selectedAction.hasaassessmentref == undefined ? this.selectedAction.assessmentRef : this.selectedAction.hasaassessmentref //action.assessmentRef
  //       } else {
  //         assrf = this.selectedAction.hasaassessmentref
  //       }


  //       for (let file of files) {
  //         this.uploadObj.image.push(file);
  //         const formData = new FormData();
  //         formData.append('file', file, file.name);

  //         formData.append('DOCFILEPATH', this.systemValues._text);
  //         formData.append('DOCTYPE', this.fileType);
  //         formData.append('ASSID', this.selectedAction.assid);
  //         formData.append('UserId', this.currentUser.userId);
  //         formData.append('HASCODE', this.selectedAction.hascode);
  //         formData.append('HASVERSION', this.selectedAction.hasversion);
  //         formData.append('HASGROUPID', this.selectedAction.hasgroupid);
  //         formData.append('HASHEADINGID', this.selectedAction.hasheadingid);
  //         formData.append('HASQUESTIONID', this.selectedAction.hasquestionid);
  //         formData.append('HASANSWERID', this.selectedAction.hasanswerid);
  //         formData.append('HASISSUEID', issueId);
  //         formData.append('HASASSREF', assrf);

  //         // console.log(formData)
  //         this.loaderService.pageShow();
  //         let httpres = this.resultService.uploadImagesandDocuments(formData).subscribe(
  //           data => {
  //             uploadedFile++;
  //             checkUploadPercent += averageUploadedPercent;
  //             if (checkUploadPercent > 95) {
  //               checkUploadPercent = 100;

  //             }
  //             this.uploadResponse.message = checkUploadPercent
  //             // console.log(this.uploadResponse)

  //             if (uploadedFile == files.length) {
  //               this.uploadObj.message = `${uploadMsg} uploaded.`;

  //               this.loaderService.pageHide();
  //               this.complete.emit(true);
  //             }
  //           },
  //           error => {
  //             this.loaderService.pageHide();
  //             this.alertService.error(error);
  //           });
  //       }
  //     } else {

  //       // document upload

  //       for (let file of files) {
  //         this.uploadObj.image.push(file);
  //         const formData = new FormData();
  //         formData.append('file', file, file.name);

  //         formData.append('DOCFILEPATH', this.systemValues._text);
  //         formData.append('DOCTYPE', this.fileType);
  //         formData.append('ASSID', this.selectedAction.assid);
  //         formData.append('UserId', this.currentUser.userId);

  //         this.loaderService.pageShow();
  //         let httpres = this.resultService.uploadImagesandDocuments(formData).subscribe(
  //           data => {
  //             uploadedFile++;
  //             checkUploadPercent += averageUploadedPercent;
  //             if (checkUploadPercent > 95) {
  //               checkUploadPercent = 100;

  //             }
  //             this.uploadResponse.message = checkUploadPercent
  //             // console.log(this.uploadResponse)

  //             if (uploadedFile == files.length) {
  //               this.uploadObj.message = `${uploadMsg} uploaded.`;

  //               this.loaderService.pageHide();
  //               this.complete.emit(true);
  //             }
  //           },
  //           error => {
  //             this.loaderService.pageHide();
  //             this.alertService.error(error);
  //           });
  //       }
  //     }


  //   }
  // }


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
    if (this.fileType != "P") {
      let fileExt = "PDF";
      extensions = (fileExt.split(',')).map(function (x) { return x.toLocaleUpperCase().trim() });
    } else {
      extensions = (this.fileExt.split(',')).map(function (x) { return x.toLocaleUpperCase().trim() });
    }

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
