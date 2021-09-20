import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { ConfirmationDialogService, AlertService, SharedService, SurveyPortalService } from '../../_services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';


@Component({
  selector: 'app-survey-cbcreport-select-image',
  templateUrl: './survey-cbcreport-select-image.component.html',
  styleUrls: ['./survey-cbcreport-select-image.component.css']
})
export class SurveyCbcreportSelectImageComponent implements OnInit {

  subs = new SubSink();

  @Input() AssetID: string
  @Output() closeCBCImage = new EventEmitter<any>();
  @Input() openCBCselectImage: boolean = false;
  @Input() surveyAssetLabel: string = "";

  gridData: any = [];
  imageData: any;
  selectedImg: any;
  currentUser: any;
  viewImage: boolean = false;
  state: State = {
    skip: 0,
    sort: [],
    take: 50,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  SelectBtnDisabled: boolean = true;
  touchtime = 0;
  openLargerImage: boolean = false;
  largerImageItem;

  constructor(
    private surveyService: SurveyPortalService ,
    private chRef: ChangeDetectorRef,
    private _sanitizer: DomSanitizer,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService,
    private sharedService: SharedService,

  ) { }

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getImageForAnswer(this.AssetID);

  }

  closeImageWin() {
    this.openCBCselectImage = false;
    this.closeCBCImage.emit(null);
  }

  getImageForAnswer(params) {
    this.subs.add(
      this.surveyService.GetListOfAssetImageNotepads(params).subscribe(
        data => {

          if (data.isSuccess && data.data)
          {

              let tempData = data.data;
              tempData.map(s => {
                s.ntpmodifiedtime = (s.ntpmodifiedtime != "") ? (s.ntpmodifiedtime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.ntpmodifiedtime, 'DD-MMM-YYYY HH:mm:ss'): '' : s.ntpmodifiedtime;
              });
              this.imageData = tempData

              this.gridData = process(this.imageData, this.state);
              this.chRef.detectChanges();
          }
        }
      )
    )
  }

  selectImageMethod() {

    this.openCBCselectImage = false;
    this.closeCBCImage.emit(this.selectedImg);

  }

  viewImageMethod() {
  //  if (this.selectedImg) {
  //    this.viewImage = true;
   //   $('.viewImageOverlay').addClass('ovrlay');
  //  }
  }

  closeViewImage($event) {

    $('.viewImageOverlay').removeClass('ovrlay');
  }

  getImg(img) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + img);
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedImg = dataItem;
    this.SelectBtnDisabled = false;
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        // double click occurred
        this.DisplayLarger(dataItem.displayImage);
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }

  }

  DisplayLarger(value)
  {
    this.largerImageItem = value;
    $('.viewImageOverlay').addClass('ovrlay');
    this.openLargerImage = true;
  }

  closeLargerImage()
  {
    $('.viewImageOverlay').removeClass('ovrlay');
    this.openLargerImage = false;
  }

}
