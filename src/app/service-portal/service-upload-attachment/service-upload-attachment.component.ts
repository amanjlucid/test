import { Component, OnInit, Input, Output, EventEmitter, Injectable, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { HelperService, ServicePortalService, AlertService, LoaderService, SharedService } from '../../_services'

@Component({
  selector: 'app-service-upload-attachment',
  templateUrl: './service-upload-attachment.component.html',
  styleUrls: ['./service-upload-attachment.component.css']
})
export class ServiceUploadAttachmentComponent implements OnInit {
  @Input() uploadAttachment: any;
  @Input() servicingDetails: any;
  @Output() closeNotepadAttachment = new EventEmitter<boolean>();
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
  fileExt: string = "JPG, GIF, PNG, PDF, JPEG";
  maxFiles: number = 5;
  maxSize: number = 5; // 5MB
  uploadStatus = false;
  currentUser: any;
  sesCode: any = ["Select Service Stage"];
  uploadFiles: boolean = false;
  selectedSesCode: any;

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
    this.uploadFile(files);
  }

  constructor(
    private servicePortalService: ServicePortalService,
    private alertService: AlertService,
    private helper: HelperService,
    private formBuilder: FormBuilder,
    private dataShareService: SharedService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.GetNotepadSesCodeList(this.servicingDetails.service_Type_Code);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  checkSescode(val) {
    this.selectedSesCode = val;
    if (val != "Select Sescode") {
      this.checkSesCodeExistsForNotepad(val, this.servicingDetails.service_Type_Code);
    }
  }

  GetNotepadSesCodeList(serviceTypeCode) {
    this.subs.add(
      this.servicePortalService.GetNotepadSesCodeList(serviceTypeCode).subscribe(
        data => {
          if (data.isSuccess) {
            const sesCode = data.data;
            if (sesCode.length > 0) {
              sesCode.map(s => this.sesCode.push(s.sescode));
            }
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  checkSesCodeExistsForNotepad(sescode, serviceTypeCode:string) {
    this.subs.add(
      this.servicePortalService.CheckSesCodeExistsForNotepad(sescode, serviceTypeCode).subscribe(
        data => {
          if (data.isSuccess) {
            const sesRsp = data.data;
            this.uploadFiles = (sesRsp == "Success") ? true : false;
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  onFileChange(event) {
    this.uploadFile(event.target.files)
  }

  closeUploadAttachment() {
    this.uploadAttachment = false;
    this.closeNotepadAttachment.emit(this.uploadAttachment);
  }

  uploadFile(files) {
    this.errors = []; // Clear error
    this.uploadObj = { image: [], message: '' };
    this.uploadResponse = { status: '', message: 0, filePath: '' };

    if (files.length > 0 && (!this.isValidFiles(files))) {
      this.uploadStatus = false;
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
      for (let file of files) {
        this.uploadObj.image.push(file);
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('Assid', encodeURIComponent(this.servicingDetails.assid));
        formData.append('JobNumber', this.servicingDetails.job_Number);
        formData.append('SesCode', this.selectedSesCode);
        formData.append('Description', '');

        this.loaderService.pageShow();
        let httpres = this.servicePortalService.AddServiceNotepadAttachment(formData).subscribe(
          data => {
            uploadedFile++;
            checkUploadPercent += averageUploadedPercent;
            if (checkUploadPercent > 95)
              checkUploadPercent = 100;
            this.uploadResponse.message = checkUploadPercent

            if (uploadedFile == files.length) {
              this.uploadObj.message = `${uploadMsg} uploaded.`;
              const notepadParams = {
                Assid: this.servicingDetails.assid,
                Userid: this.currentUser.userId,
                ASJNumber: this.servicingDetails.job_Number,
              }

              this.subs.add(
                this.servicePortalService.GetServiceJobNotepadsForAsset(notepadParams).subscribe(
                  data => {
                    if (data.isSuccess) {
                      this.loaderService.pageHide();
                      this.dataShareService.changeServiceNotepadAttachment(data.data);
                    } else {
                      this.alertService.error(data.message);
                    }
                  }
                )
              )
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
    var extensions = (this.fileExt.split(','))
      .map(function (x) { return x.toLocaleUpperCase().trim() });
    for (var i = 0; i < files.length; i++) {
      // Get file extension
      var ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
      // Check the extension exists
      var exists = extensions.includes(ext);
      if (!exists) {
        this.errors.push("Error (Extension): " + files[i].name);
      }
      // Check file size
      this.isValidFileSize(files[i]);
    }
  }

  private isValidFileSize(file) {
    var fileSizeinMB = file.size / (1024 * 1000);
    var size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
    if (size > this.maxSize)
      this.errors.push("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
  }

}
