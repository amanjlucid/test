import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService, AlertService, HelperService, SurveyPortalService, AssetAttributeService } from 'src/app/_services';
import { SurveyProjectSettingsModel, SurveyCbcReport } from '../../_models';
import { onlyImageType } from '../../_helpers';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { timeStamp } from 'console';

@Component({
  selector: 'app-survey-cbcreport',
  templateUrl: './survey-cbcreport.component.html',
  styleUrls: ['./survey-cbcreport.component.css']
})
export class SurveyCbcreportComponent implements OnInit {

  subs = new SubSink(); // to unsubscribe services
  cbcReportForm: FormGroup;
  currentUser;
  selectedProject;
  selectedAsset;
  surveyProjectLabel: string;
  surveyAssetLabel: string;
  surveyDateLabel: string;
  FrontPageSelected: boolean = false;
  SignatureSelected: boolean = false;
  SitePlanSelected: boolean = false;
  CertificateSelected: boolean = false;
  frontPageImage;
  signatureImage;
  previewDisabled: boolean = true;
  generateDisabled: boolean = true;
  samplesComplete: boolean = false;
  openPDFList: boolean = false;
  openImageList: boolean = false;
  selectPDFType: string = "";
  CertificateSeq: number = 0;
  SitePlanSeq: number = 0;
  FrontPageSeq: number = 0;
  SignatureSeq: number = 0;
  reportModel: SurveyCbcReport;
  openSignatureImage = false;
  uploadSignatureImageLocation: any


  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private surveyService: SurveyPortalService,
    private assetAttributeService: AssetAttributeService,
    private router: Router,
    private _sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedProject = JSON.parse(sessionStorage.getItem('SurvProj'));
    this.selectedAsset = JSON.parse(sessionStorage.getItem('SurvAsset'));
    this.surveyProjectLabel = this.selectedProject.SupCode + ' - ' + this.selectedProject.SupName;
    this.surveyAssetLabel = this.selectedAsset.Assid + ' - Address: ' + this.selectedAsset.Address;
    this.surveyDateLabel = this.selectedAsset.SurveyDate;
    this.samplesComplete = this.selectedAsset.SamplesComplete;
    this.cbcReportForm = this.fb.group({
      cement: [false],
      tiles: [false],
      board: [false],
      material: [false],
      coatings: [false],
      frontPageText: [''],
      signatureText: [''],
      sitePlanText: [''],
      certificateText: [''],
    });

  }

  get f() { return this.cbcReportForm.controls; }

  getImg(img) {
    //console.log(img)
    return this._sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + img);

  }


  /*
  onFileChange(event) {
    this.uploadFile(event.target.files)
  }

  uploadFile(files)
  {
    if (files.length > 0) {
      for (let file of files) {
      //  this.cbcReportForm.controls.signatureImage.setValue(file);
        this.cbcReportForm.controls.signatureText.setValue(file.name);
        this.SignatureSelected = true;
      }
    }
  }
*/


  openUploadImagePopup() {
    //this.uploadFooterImageLocation = this.settingsForm.getRawValue().imagelocal;
    this.openSignatureImage = true;
    $('.portalwBlur').addClass('ovrlay');
  }

  closeSignatureImage($event) {
    this.openSignatureImage = false;
    if ($event != undefined && $event != '')
    {
      this.cbcReportForm.controls.signatureText.setValue($event);
      this.getSignatureImage($event);
      this.SignatureSelected = true;
    }
    $('.portalwBlur').removeClass('ovrlay');
  }

  uploadedSuccessfull(eve) {
    if (eve) {
     // this.SignatureSelected = true;
    }
  }

  getSignatureImage(val)
  {
    this.subs.add(
      this.surveyService.GetSignatureImage(val).subscribe(
        data => {
          if (data.isSuccess)
          {
            this.signatureImage = data.data;
            this.SignatureSelected = true;
          }
        }
      )
    )
  }


  runReport(preview: boolean)
  {

    let reportModel = new SurveyCbcReport();
    reportModel.User = this.currentUser.userId;
    reportModel.SupCode = this.selectedProject.SupCode;
    reportModel.Assid = this.selectedAsset.Assid;
    reportModel.Signature = this.signatureImage;
    reportModel.Photo_NTPSEQUENCE = this.FrontPageSeq;
    reportModel.SitePlan_NTPSEQUENCE= this.SitePlanSeq;
    reportModel.Certificate_NTPSEQUENCE= this.CertificateSeq;
    reportModel.ACMCement = this.cbcReportForm.controls.cement.value;
    reportModel.ACMFloorTiles = this.cbcReportForm.controls.tiles.value;
    reportModel.ACMTextured = this.cbcReportForm.controls.coatings.value;
    reportModel.ACMInsulatingBoard = this.cbcReportForm.controls.board.value;
    reportModel.ACMComposite = this.cbcReportForm.controls.material.value;

    if (preview)
    {
      this.subs.add(
        this.surveyService.CreateCBCReportData(reportModel).subscribe(
          data => {
            if (data.isSuccess)
            {
              let ReportID = data.data;
              this.subs.add(this.surveyService.PreviewCBCReport(ReportID).subscribe(
                filedata => {
                  let fileExt = "pdf";
                  this.assetAttributeService.getMimeType(fileExt).subscribe(
                    mimedata => {
                      if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                        var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                          if (mimedata.data.openWindow)
                          {
                            var byteCharacters = atob(filedata);
                            var byteNumbers = new Array(byteCharacters.length);
                            for (var i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            var byteArray = new Uint8Array(byteNumbers);
                            var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                            var fileURL = URL.createObjectURL(file);
                            let newPdfWindow =window.open(fileURL);

                          }
                          else
                          {
                            linkSource = linkSource + filedata;
                            const downloadLink = document.createElement("a");
                            const fileName = 'Report';
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
                },
                error => {
                  this.alertService.error(error);
                }

              )


              )
              // System.Windows.Browser.HtmlPage.Window.Navigate(New Uri(String.Format("ShowCBCReport.aspx?reportid={0}", ReportID), UriKind.Relative), "_blank")
            }
            else
            {
              this.alertService.error("The Asbestos report has not been created properly. Please contact your Administrator.")
            }
          }
        )
      )
    }
    else
    {
      this.subs.add(
        this.surveyService.GenerateCBCReportData(reportModel).subscribe(
          data => {
            if (data.isSuccess)
            {
              let result = data.data;
              if(result)
              {
                this.alertService.error("The Asbestos report has been generated and stored as an Asset Notepad in the Apex system.")
              }
              else
              {
                this.alertService.error("The Asbestos report has not been created properly. Please contact your Administrator.")
              }
            }
            else
            {
              this.alertService.error("The Asbestos report has not been created properly. Please contact your Administrator.")
            }
          }
        )
      )
    }
  }

  selectFrontPage()
 {
  $('.portalwBlur').addClass('ovrlay');
    this.openImageList = true;
 }

 selectSitePlan()
 {
    $('.portalwBlur').addClass('ovrlay');
    this.selectPDFType = "Site Plan"
    this.openPDFList = true;
 }

 selectCertificate()
 {
    $('.portalwBlur').addClass('ovrlay');
    this.selectPDFType = "Certificate"
    this.openPDFList = true;
 }

 closeCBCselectPDF($event) {

  if ($event != undefined)
  {
    if (this.selectPDFType == "Site Plan")
    {
      this.SitePlanSeq  = $event.ntpsequence;
      this.cbcReportForm.controls.sitePlanText.setValue($event.shortfilename);
      this.SitePlanSelected = true;
    }
    else
    {
      this.CertificateSeq  = $event.ntpsequence;
      this.cbcReportForm.controls.certificateText.setValue($event.shortfilename);
      this.CertificateSelected = true;
    }
  }
  this.openPDFList = false;
  this.SetButtons()
  $('.portalwBlur').removeClass('ovrlay');
}


closeCBCImage($event) {
  this.openImageList = false;

  if ($event != undefined)
  {
     this.FrontPageSelected = true;
     this.frontPageImage = $event.displayImage;
     this.cbcReportForm.controls.frontPageText.setValue($event.shortfilename);
     this.FrontPageSeq = $event.ntpsequence;
  }

  this.SetButtons()
  $('.portalwBlur').removeClass('ovrlay');
}


SetButtons()
{
  if (this.FrontPageSelected && this.SignatureSelected && this.CertificateSelected && this.SitePlanSelected)
  {
    this.previewDisabled = false;
    if (this.samplesComplete)
    {
      this.generateDisabled = false;
    }
    else
    {
      this.generateDisabled = true;
    }

  }
  else
  {
    this.previewDisabled = true;
    this.generateDisabled = true;
  }

}







onSubmit() {

  }


  public closeWindow() {
    this.router.navigate(['/surveying/batchsurveys']);
  }

}
