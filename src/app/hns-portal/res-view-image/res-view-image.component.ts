import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { HnsResultsService } from '../../_services'

@Component({
  selector: 'app-res-view-image',
  templateUrl: './res-view-image.component.html',
  styleUrls: ['./res-view-image.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ResViewImageComponent implements OnInit {
  @Input() imageData: any
  @Input() viewImage: boolean = false;
  @Output() closeViewImage = new EventEmitter<boolean>();
  title = "View Image";
  imageStr: any;

  constructor(
    private _sanitizer: DomSanitizer,
    private hnsService: HnsResultsService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getBinaryFileStreamDirect(this.imageData.ntplink)
  }

  closeViewImageMethod() {
    this.viewImage = false;
    this.closeViewImage.emit(this.viewImage);
  }

  getImg(img) {
    //console.log(img)
    if (img) {
      return this._sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + img);
    }
  }

  getBinaryFileStreamDirect(filename) {
    this.hnsService.GetBinaryFileStreamDirect(filename).subscribe(
      data => {
        if (data.isSuccess) {
          this.imageStr = data.data;
          this.chRef.detectChanges();
        }
      }
    )
  }


}
