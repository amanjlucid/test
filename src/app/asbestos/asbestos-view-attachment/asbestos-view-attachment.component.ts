import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetAttributeService, AlertService, AsbestosService} from '../../_services';
import { SubSink } from 'subsink';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-asbestos-view-attachment',
  templateUrl: './asbestos-view-attachment.component.html',
  styleUrls: ['./asbestos-view-attachment.component.css']
})
export class AsbestosViewAttachmentComponent implements OnInit {
  @Input() viewAttachment: boolean = false;
  @Input() selectedAsbestos: any;
  @Input() selectedAttachment: any;
  @Output() closeViewAttachment = new EventEmitter();
  subs = new SubSink();
  imagePath: any;
  openPopup:boolean = false;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private asbestosService: AsbestosService,
    private _sanitizer: DomSanitizer,
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }
  
  ngOnInit() {
    this.getAsbestosAttachmentForView();
  }

  closeViewAttacmentWin() {
    this.viewAttachment = false;
    this.openPopup = false;
    this.closeViewAttachment.emit(this.viewAttachment);
  }

  getAsbestosAttachmentForView() {
    const asbestosAttachmentModel = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
      AAUASEQUENCE: this.selectedAttachment.aauasequence
    }
    this.subs.add(
      this.asbestosService.getAsbestosAttachmentForView(asbestosAttachmentModel).subscribe(
        data => {
          //console.log(data);
          if (data && data.isSuccess && data.data.aauaattachment != null) {
            if (data.data.aauatype != 'PDF') {
              this.openPopup = true;
              this.imagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
                'data:image/png;base64,' + data.data.aauaattachment);
            } else if (data.data.aauatype == 'PDF'){

              let fileExt = "pdf";
              this.assetAttributeService.getMimeType(fileExt).subscribe(
                mimedata => {
                  if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                      var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                          if (mimedata.data.openWindow)
                          {
                            var byteCharacters = atob(data.data.aauaattachment);
                            var byteNumbers = new Array(byteCharacters.length);
                            for (var i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            var byteArray = new Uint8Array(byteNumbers);
                            var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                            var fileURL = URL.createObjectURL(file);
                            let newPdfWindow =window.open(fileURL);
                            // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                            // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                            // let iframeEnd = "'><\/iframe>";
                            // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                            // newPdfWindow.document.title = this.selectedNotes.fileName;
                          }
                          else
                          {
                            linkSource = linkSource + data.data.aauaattachment;
                            const downloadLink = document.createElement("a");
                            const fileName = this.selectedAttachment.aauaattachmentname;
                            downloadLink.href = linkSource;
                            downloadLink.download = fileName;
                            downloadLink.click();
                          }
                        

                    }
                    else{
                      this.alertService.error("This file format is not supported.");
                    }
                }
                
              )
        
              this.closeViewAttacmentWin();
            }
          } 
        }
      )
    )
  }

}
