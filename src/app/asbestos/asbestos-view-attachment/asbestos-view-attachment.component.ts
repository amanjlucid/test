import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AsbestosService} from '../../_services';
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
              const linkSource = 'data:application/pdf;base64,' + data.data.aauaattachment;
              const downloadLink = document.createElement("a");
              const fileName = this.selectedAttachment.aauaattachmentname;
              downloadLink.href = linkSource;
              downloadLink.download = fileName;
              downloadLink.click();
              this.closeViewAttacmentWin();
            }
          } 
        }
      )
    )
  }

}
