import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { SurveyPortalService, LoaderService, AlertService } from '../../_services';


@Component({
  selector: 'app-survey-cbcreport-signature-image',
  templateUrl: './survey-cbcreport-signature-image.component.html',
  styleUrls: ['./survey-cbcreport-signature-image.component.css']
})
export class SurveyCbcreportSignatureImageComponent implements OnInit {
  @Input() openSignatureImage: boolean = false;
  @Output() closeReportImages = new EventEmitter<string>();
  //@Input() uploadFooterImageLocation: any
  title = "Upload Image";
  subs = new SubSink();
  error: string;
  uploadResponse = { status: '', message: 0, filePath: '' };
  uploadObj: any = { image: [], message: '' };
  filesToUpload: Array<File> = [];
  errors: Array<string> = [];
  dragAreaClass: string = 'dragarea';
  fileExt: string = "JPG, GIF, PNG, PDF";
  maxFiles: number = 1;
  maxSize: number = 5; // 5MB
  uploadStatus = false;
  uploadedImageFileName: string = "";
  @Output() uploadedSuccessfull = new EventEmitter<boolean>();


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
    private surveyService: SurveyPortalService,
    private loaderService: LoaderService,
    private alertService: AlertService
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {

  }


  onFileChange(event) {
    this.uploadFile(event.target.files)
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
      let time = Date.now();
      for (let file of files) {
        this.uploadObj.image.push(file);
        const formData = new FormData();
        formData.append('postedFile', file, time + "_" + file.name);
       // formData.append('PropertyReportLogoLocation', this.uploadFooterImageLocation);

        let httpres = this.surveyService.UploadSignatureImage(formData).subscribe(
          data => {



            uploadedFile++;
            checkUploadPercent += averageUploadedPercent;
            if (checkUploadPercent > 95)
              checkUploadPercent = 100;
            this.uploadResponse.message = checkUploadPercent

            if (uploadedFile == files.length) {
              this.uploadObj.message = `${uploadMsg} uploaded.`;
              this.uploadedSuccessfull.emit(true);
              this.uploadedImageFileName = data.data;
              setTimeout(() => {
                this.closeUploadAttachmentWin()
              }, 100);
            }
            //console.log(uploadedFile, files.length);

          }, error => {
            this.uploadObj.image = [];
            this.uploadObj.message = '';
            this.alertService.error(error)
          });
      }
    }
  }


  getWidth(val) {
    if (val.message != undefined && val.message != null) {
      return val.message + "%";
    }
  }


  closeUploadAttachmentWin() {
    this.openSignatureImage = false;
    this.closeReportImages.emit(this.uploadedImageFileName);
  }

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
