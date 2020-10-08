import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { HnsResultsService, ConfirmationDialogService, AlertService, SharedService, HnsPortalService } from '../../_services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hns-res-ans-image',
  templateUrl: './hns-res-ans-image.component.html',
  styleUrls: ['./hns-res-ans-image.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsResAnsImageComponent implements OnInit {
  subs = new SubSink();
  title: string = "View Images for Answer";
  @Input() selectedAction: any;
  @Input() selectedIssue: any;
  @Input() isAssessment: boolean = false;
  @Input() imageFor: string = "ans";
  @Input() rootAction: any
  @Output() closerImage = new EventEmitter<boolean>();
  @Input() showImage: boolean = false;
  uploadAttachment: boolean = false;
  gridData: any = [];
  imageDate: any;
  showUploadBtn = false;
  state: State = {
    skip: 0,
    sort: [],
    take: 30,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  selectedImg: any;
  currentUser: any;
  params1: any;
  hnsPermission: any = [];
  viewImage: boolean = false;
  showUploadNRemoveBtn: boolean = true;
  issueName: any;

  constructor(
    private resultSrevice: HnsResultsService,
    private chRef: ChangeDetectorRef,
    private _sanitizer: DomSanitizer,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private hnsPortalService: HnsPortalService
  ) { }

  ngOnInit() {
    // console.log(this.selectedIssue)
    // console.log(this.selectedIssue.length)
    // console.log(typeof this.selectedIssue)

    // console.log(this.selectedAction)
    // console.log(this.rootAction)
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.imageFor == "ans") {
      this.showUploadBtn = true
      this.title = "View Images for Answer"

    } else if (this.imageFor == "iss") {
      this.showUploadBtn = true
      this.title = "View Images for Issue"
    } else {
      this.showUploadBtn = false
      this.title = "View Images for Issue & Answer"
    }


    let action = this.selectedAction;



    let assrf = "";
    if (this.isAssessment) {
      assrf = action.hasaassessmentref == undefined ? action.assessmentRef : action.hasaassessmentref //action.assessmentRef
    } else {
      assrf = action.hasaassessmentref
    }

    let issueId: any = action.hasissueid;
    this.issueName = action.hasiissue;
    if (this.selectedIssue != undefined) {
      if (this.selectedIssue.length == undefined) {
        issueId = this.selectedIssue.hasissueid
        this.issueName = this.selectedIssue.hasiissue
        // console.log(issueId)
      }
    }


    this.params1 = {
      AssessmentRef: assrf,
      Assid: action.assid,
      Hasversion: action.hasversion,
      Hasgroupid: action.hasgroupid,
      Hasheadingid: action.hasheadingid,
      Hasquestionid: action.hasquestionid,
      Hasanswerid: action.hasanswerid,
      Hasissueid: issueId
    }

    // console.log(this.params1)


    this.isQuestionCodeOnActiveSurvey(action.hasquestioncode, action.assid)
    this.getImageForAnswer(this.params1);

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )


    if (this.rootAction.haslatestassessment != undefined && this.rootAction.haslatestassessment != null) {
      if (this.rootAction.haslatestassessment != "Y") {
        this.showUploadNRemoveBtn = false;
      }
    }

    if (this.selectedAction.hasalatestassesment != undefined && this.selectedAction.hasalatestassesment != null) {
      if (this.selectedAction.hasalatestassesment != "Y") {
        this.showUploadNRemoveBtn = false;
      }
    }

  }


  closeImageWin() {
    this.showImage = false;
    this.closerImage.emit(this.showImage)
  }

  uploadImage(imageFor) {
    $('.viewImageOverlay').addClass('ovrlay');
    this.uploadAttachment = true

  }

  closeAttachment($event) {
    $('.viewImageOverlay').removeClass('ovrlay');
    this.uploadAttachment = $event
  }

  isQuestionCodeOnActiveSurvey(hasQuestionCode, assId) {
    this.subs.add(
      this.resultSrevice.isQuestionCodeOnActiveSurvey(hasQuestionCode, assId).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess && data.data) {
            if (data.data != '') {

              // this.title = `Add/Edit Issue - ${data.data}`;
              // this.viewOnly = true;
              // this.editIssueForm.disable();
            }
            //this.chRef.detectChanges();
          }
        }
      )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridData = process(this.imageDate, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridData = process(this.imageDate, this.state);
  }

  getImageForAnswer(params) {
    this.subs.add(
      this.resultSrevice.getImageForAnswer(params).subscribe(
        data => {

          if (data.isSuccess && data.data) {
            let tempdata1 = Object.assign([], data.data);
            let tempdata: any;
            if (this.imageFor == "ans") {
              tempdata = tempdata1.filter(x => x.hasissueid == 0)
            } else if (this.imageFor == "iss") {
              tempdata = tempdata1.filter(x => x.hasissueid != 0)
            } else if (this.imageFor == "both") {
              tempdata = data.data
            }
            // console.log(tempdata)
            this.imageDate = tempdata
            this.gridData = process(this.imageDate, this.state);
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  public openConfirmationDialog() {
    if (this.selectedImg) {
      $('.k-window-wrapper').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.removeImg() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error("Please select one record.");
    }
  }


  removeImg() {
    let params = {
      Assid: this.selectedImg.assid,
      Hasversion: this.selectedImg.hasversion,
      Hasgroupid: this.selectedImg.hasgroupid,
      Hasheadingid: this.selectedImg.hasheadingid,
      Hasquestionid: this.selectedImg.hasquestionid,
      Hasanswerid: this.selectedImg.hasanswerid,
      Hasissueid: this.selectedImg.hasissueid,
      Hascode: this.selectedImg.hascode,
      NTPSequence: this.selectedImg.ntpsequence,
      AssessmentRef: this.selectedImg.hasaassessmentref,
      Userid: this.currentUser.userId
    }

    this.subs.add(
      this.resultSrevice.deleteHealthSafetyPicture(params).subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            this.getImageForAnswer(this.params1);
            this.alertService.success("Image Deleted Successfully.")
          } else {
            this.alertService.error(data.message)
          }
        }
      )
    )
  }

  viewImageMethod() {
    if (this.selectedImg) {
      this.viewImage = true;
      $('.viewImageOverlay').addClass('ovrlay');
    }
  }

  closeViewImage($event) {
    this.viewImage = $event;
    $('.viewImageOverlay').removeClass('ovrlay');
  }

  getImg(img) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + img);
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedImg = dataItem;

  }

  complete($event) {
    let action = this.selectedAction;
    let assrf: any;
    if (this.isAssessment) {
      assrf = action.hasaassessmentref == undefined ? action.assessmentRef : action.hasaassessmentref //action.assessmentRef
    } else {
      assrf = action.hasaassessmentref
    }

    let issueId: any = action.hasissueid;
    if (this.selectedIssue != undefined) {
      if (this.selectedIssue.length == undefined) {
        issueId = this.selectedIssue.hasissueid
      }
    }

    let params1 = {
      AssessmentRef: assrf,
      Assid: action.assid,
      Hasversion: action.hasversion,
      Hasgroupid: action.hasgroupid,
      Hasheadingid: action.hasheadingid,
      Hasquestionid: action.hasquestionid,
      Hasanswerid: action.hasanswerid,
      Hasissueid: issueId
    }

    this.chRef.detectChanges();
    this.getImageForAnswer(params1);
    this.sharedService.refresEidtAnsIssList(true);
    setTimeout(() => {
      this.sharedService.refresEidtAnsIssList(false);
    }, 2000);

  }




}
