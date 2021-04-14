import { Component, OnInit, Input, Output, EventEmitter, Injectable, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsbestosService, HelperService, SharedService, LoaderService } from '../../_services'
import { SubSink } from 'subsink';
import { AsbestosAttachmentModel } from '../../_models'
import { delay } from 'rxjs/operators'

@Component({
  selector: 'app-asbestos-upload-attachment',
  templateUrl: './asbestos-upload-attachment.component.html',
  styleUrls: ['./asbestos-upload-attachment.component.css']
})

export class AsbestosUploadAttachmentComponent implements OnInit {
  @Input() uploadAttachment: boolean = false;
  @Input() selectedAsbestos: any;
  @Output() closeUploadAttachment = new EventEmitter();
  uploadSaveUrl = 'saveUrl'; // should represent an actual API endpoint
  uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
  form: FormGroup;
  error: string;
  uploadResponse = { status: '', message: 0, filePath: '' };
  uploadObj: any = { image: [], message: '' };
  subs = new SubSink();
  filesToUpload: Array<File> = [];

  errors: Array<string> = [];
  dragAreaClass: string = 'dragarea';
  projectId: number = 0;
  sectionId: number = 0;
  fileExt: string = "JPG, GIF, PNG, PDF, JPEG";
  maxFiles: number = 5;
  maxSize: number = 5; // 5MB
  uploadStatus = false;

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
    private formBuilder: FormBuilder,
    private asbestosService: AsbestosService,
    private helper: HelperService,
    private dataShareService: SharedService,
    private loaderService: LoaderService
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {
    // this.form = this.formBuilder.group({
    //   image: ['', [Validators.required]]
    // });
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
      for (let file of files) {
        this.uploadObj.image.push(file);
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('ASSID', encodeURIComponent(this.selectedAsbestos.assid));
        formData.append('AUCCODE', this.selectedAsbestos.auccode);
        formData.append('AUDCODE', this.selectedAsbestos.audcode);
        formData.append('AAUSEQUENCE', this.selectedAsbestos.aausequence);
        formData.append('ASASSEQUENCE', this.selectedAsbestos.asassequence);
        this.loaderService.pageShow();

        let httpres = this.asbestosService.uploadAttachmentTest(formData).subscribe(data => {
          uploadedFile++;
          checkUploadPercent += averageUploadedPercent;
          if (checkUploadPercent > 95)
            checkUploadPercent = 100;
          this.uploadResponse.message = checkUploadPercent

          if (uploadedFile == files.length) {
            this.uploadObj.message = `${uploadMsg} uploaded.`;
            const asbestosAttachmentModel: AsbestosAttachmentModel = {
              ASSID: encodeURIComponent(this.selectedAsbestos.assid),
              AUCCODE: this.selectedAsbestos.auccode,
              AUDCODE: this.selectedAsbestos.audcode,
              AAUSEQUENCE: this.selectedAsbestos.aausequence,
              ASASSEQUENCE: this.selectedAsbestos.asassequence,
            }
            this.asbestosService.getActiveAttachment(asbestosAttachmentModel).subscribe(
              data => {
                if (data && data.isSuccess) {
                  this.loaderService.pageHide();
                  this.dataShareService.changeAsbestosAttachment(data.data);
                }
              }
            )
          }
          //console.log(uploadedFile, files.length);

        });

        // this.subs.add(
        //   this.asbestosService.uploadAttachment(formData).pipe(delay(1000)).subscribe(
        //     (res) => {
        //       console.log(res);
        //       console.log(this.uploadResponse.message);
        //       if (res != "Unhandled event: 0" && res != 200) {
        //         $('.progress-bar').css({ 'background-color': '#e4287e' });
        //         this.uploadResponse = res

        //       }
        //       if (res == 200 && this.uploadResponse.message == '100') {
        //         this.uploadObj.message = `${uploadMsg} uploaded.`;
        //         const asbestosAttachmentModel: AsbestosAttachmentModel = {
        //           ASSID: encodeURIComponent(this.selectedAsbestos.assid),
        //           AUCCODE: this.selectedAsbestos.auccode,
        //           AUDCODE: this.selectedAsbestos.audcode,
        //           AAUSEQUENCE: this.selectedAsbestos.aausequence,
        //           ASASSEQUENCE: this.selectedAsbestos.asassequence,
        //         }
        //         this.asbestosService.getActiveAttachment(asbestosAttachmentModel).subscribe(
        //           data => {
        //             if (data && data.isSuccess) {
        //               this.loaderService.pageHide();
        //               this.dataShareService.changeAsbestosAttachment(data.data);
        //             }
        //           }
        //         )
        //       }
        //     },
        //   )
        // )

      }
    }
  }


  getWidth(val) {
    if (val.message != undefined && val.message != null) {
      return val.message + "%";
    }
  }

  onSubmit() {
    // const formData = new FormData();
    // formData.append('file', this.form.get('image').value);
    // this.asbestosService.upload(formData,1).subscribe(
    //   (res) => this.uploadResponse = res,
    //   (err) => this.error = err
    // );
  }


  closeUploadAttachmentWin() {
    this.uploadAttachment = false;
    this.closeUploadAttachment.emit(this.uploadAttachment);
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

