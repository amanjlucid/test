import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { AssetAttributeService, HelperService, AlertService, SharedService, AsbestosService } from '../../_services'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DateFormatPipe } from 'src/app/_pipes/date-format.pipe';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-asbestos',
  templateUrl: './asset-asbestos.component.html',
  styleUrls: ['./asset-asbestos.component.css']
})

export class AssetAsbestosComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;

  filter: CompositeFilterDescriptor;
  multiple = false;
  allowUnsort = true;
  state: State = {
    skip: 0,
    group: [],
    sort: [{ field: 'group', dir: 'asc' }],
    filter: {
      logic: "and",
      filters: []
    }
  }
  groups: GroupDescriptor[] = [];
  asbestosData;
  gridView: DataResult;
  materialAssessment = true;
  priorityAssessment = true;
  managementActions = false;
  samples = false;
  notesDetails: boolean = false;
  selectedNotes;
  notesTitle;
  notesImagePath: SafeResourceUrl;
  subs = new SubSink();
  selectedAsbestos: any;
  manageAsbestos: boolean = false;
  manageAsbestosRequestMode: boolean = false;
  asbestosStatusWarning: boolean = false;
  openWorkStatus: boolean = false;
  printAcm: boolean = false;
  currentUser: any;
  selectedAsbestosIndex: any;
  requestFurtherinf: boolean = false;
  asbestosPropertySecurityAccess: any;
  refArr = [];

  constructor(
    private assetAttributeService: AssetAttributeService,
    private _sanitizer: DomSanitizer,
    public helperService: HelperService,
    private alertService: AlertService,
    private shareData: SharedService,
    private asbestosService: AsbestosService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.shareData.asbestosPropertyAccess.subscribe(data => { this.asbestosPropertySecurityAccess = data; });
    this.shareData.asbestos.subscribe(
      data => {
        this.asbestosData = data;
        this.gridView = process(this.asbestosData, this.state);
      }
    )

    if (localStorage.getItem('AsbestosOpenedFromWorksOrder'))
    {
      const deligence = JSON.parse(localStorage.getItem('AsbestosOpenedFromWorksOrder'));
      localStorage.removeItem('AsbestosOpenedFromWorksOrder')
      this.dueDiligence(deligence, true)
    }else{
      const deligence = {
        ASSID: this.assetId,
        strUserId: this.currentUser.userId,
        LOGTYPE: 'V'
      }
      this.dueDiligence(deligence, false)
    }


  }

  dueDiligence(deligence, fromWOPM) {
    this.subs.add(
      this.asbestosService.dueDiligence(deligence, fromWOPM).subscribe(
        data => {
          this.getAssetAsbestosList();
        }
      )
    )

  }

  // public expandedDetailKeys: any[] = [1];

  // public expandDetailsBy = (dataItem: any, rowIndex): any => {
  //   return rowIndex;
  // }

  getAssetAsbestosList() {
    this.subs.add(
      this.assetAttributeService.getAssetAsbestosList(this.assetId).subscribe(
        data => {
          if (data && data.isSuccess) {
            let tempAsbestos = Object.assign({}, data.data);
           // console.log(tempAsbestos)
            // tempAsbestos.forEach(element => {

            // });
            this.asbestosData = data.data;
            this.shareData.changeAsbestos(data.data);
            //console.log(this.asbestosData);
            this.gridView = process(this.asbestosData, this.state);
          }
        }
      )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.asbestosData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.asbestosData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    // console.log(filter);
    // for(let fil of filter.filters){
    //   if(fil['filters'][0]['field'] == 'aaudreqstatus'){
    //   }
    // }
    this.state.filter = filter;
    this.gridView = process(this.asbestosData, this.state);

  }

  openNotesDetails(notesDetails) {
    this.selectedNotes = notesDetails;
    if (this.selectedNotes.linkType == 'P') {
      $('.charBlur').addClass('ovrlay');
      this.notesTitle = "Asbestos Image";
      this.assetAttributeService.getNotepadImage(this.selectedNotes.ntpType, this.selectedNotes.ntpGenericCode1, this.selectedNotes.ntpGenericCode2, this.selectedNotes.ntpSequence).subscribe(
        data => {
          this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/jpg;base64,' + data);
          this.notesDetails = true;
        }
      )
    } else if (this.selectedNotes.linkType == 'N') {
      $('.charBlur').addClass('ovrlay');
      this.notesTitle = "View Notepad Note...";
      this.notesDetails = true;
    } else if (this.selectedNotes.linkType == 'L') {
      let lnk = this.selectedNotes.link;


      let fileExt = lnk.substring(lnk.lastIndexOf(".") + 1).toLowerCase();
      this.assetAttributeService.getMimeType(fileExt).subscribe(
        mimedata => {
          if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
              var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
              this.assetAttributeService.getNotepadFile(this.selectedNotes.ntpType, this.selectedNotes.ntpGenericCode1, this.selectedNotes.ntpGenericCode2, this.selectedNotes.ntpSequence).subscribe(
                filedata => {
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

                    // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                    // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                    // let iframeEnd = "'><\/iframe>";
                    // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                    // newPdfWindow.document.title = this.selectedNotes.fileName;
                  }
                  else
                  {
                    linkSource = linkSource + filedata;
                    const downloadLink = document.createElement("a");
                    const fileName = this.selectedNotes.fileName;
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                  }
                }
              )
            }
            else{
              this.alertService.error("This file format is not supported.");
            }
        }
      )



    } else if (this.selectedNotes.linkType == 'I') {
      let url: string = '';
      if (!/^http[s]?:\/\//.test(this.selectedNotes.link)) {
        url += 'http://';
      }
      url += this.selectedNotes.link;
      window.open(url, '_blank');
    }
  }

  closeNotesDetails() {
    this.notesDetails = false;
    $('.charBlur').removeClass('ovrlay');
  }


  getColor(str) {
    if (str == "Low" || str == "Very Low") {
      return 'blue';
    } else if (str == "High" || str == "Medium") {
      return "red";
    }
    return 'blue';
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedAsbestos = dataItem;
    this.asbestosData.find((v, k) => {
      if (v == this.selectedAsbestos) {
        this.selectedAsbestosIndex = k;
      }
    })

    //console.log(this.selectedAsbestos);
    // if (columnIndex > 1) {
    //   //this.openAssetAttrPopUp(dataItem)
    // }
  }


  openManageAsbestosRequestPopup(mode) {
    if (this.selectedAsbestos != undefined) {
      // if (this.selectedAsbestos.aaudreqstatus != 'H') {
      this.manageAsbestosRequestMode = mode;
      $('.charBlur').addClass('ovrlay');
      this.manageAsbestos = true;
      // } else {
      //   this.asbestosStatusWarning = true;
      //   $('.charBlur').addClass('ovrlay');
      // }
    } else {
      this.alertService.error("Please select one asbestos record");
    }
  }

  closeMangeRequest($event) {
    $('.charBlur').removeClass('ovrlay');
    this.manageAsbestos = $event;
  }

  closeAsbestosStatusWarning() {
    $('.charBlur').removeClass('ovrlay');
    this.asbestosStatusWarning = false;
  }

  openWorkStatusFunction() {
    this.openWorkStatus = true;
    $('.charBlur').addClass('ovrlay');
  }

  closeWorkStatus($event) {
    this.openWorkStatus = $event;
    $('.charBlur').removeClass('ovrlay');
  }

  printAcmFunction() {
    if (this.asbestosData.length > 0) {
      this.printAcm = true;
    } else {
      this.alertService.error("There is no record to print.");
    }

    // if (this.selectedAsbestos != undefined) {
    //   this.printAcm = true;
    //   //$('.charBlur').addClass('ovrlay');
    // } else {
    //   this.alertService.error("Please select one asbestos record");
    // }

  }

  closePrintAcm($event) {
    this.printAcm = $event;
    //$('.charBlur').removeClass('ovrlay');
  }

  requestFurtherInfo() {
    if (this.selectedAsset != undefined) {
      this.requestFurtherinf = true;
      $('.charBlur').addClass('ovrlay');
    } else {
      this.alertService.error('Please select one asset first.');
    }
  }

  closeRequestFurtherInf($event) {
    this.requestFurtherinf = $event;
    $('.charBlur').removeClass('ovrlay');
  }

  checkFurtherInfoAccess() {

    if (!this.containsAll(['Request Further Information'], this.asbestosPropertySecurityAccess)) {
      return true
    }

    return false;
  }

  checkAsbestosPropAccess() {
    // if (this.currentUser.admin == "Y") {
    //   return false;
    // }


    // if (this.asbestosPropertySecurityAccess == undefined) {
    //   return true;
    // }

    if (!this.containsAll(['Management Request'], this.asbestosPropertySecurityAccess) && !this.containsAll(['Management Authorise'], this.asbestosPropertySecurityAccess)) {
      return true
    }

    return false;

  }

  containsAll(needles, haystack) {
    for (var i = 0, len = needles.length; i < len; i++) {
      if ($.inArray(needles[i], haystack) == -1) return false;
    }
    return true;
  }


  getSample(dataItem) {
    // let asbestos = Object.assign([], this.asbestosData);
    // let acm = asbestos.filter(x => x.auctext == dataItem.auctext && x.audtext == dataItem.audtext);
    // let sortedAcm = acm.sort(function (a, b) {
    //   return a.floorsequence - b.floorsequence;
    // });

    // if (sortedAcm.length > 0) {
    //   if (sortedAcm[sortedAcm.length - 1].asassequence == dataItem.asassequence) {

    //     return true
    //   } else {

    //     return false;
    //   }
    // }

    // return true;
    if (dataItem.sampleList.length > 0) {
      let asbestos = Object.assign([], this.asbestosData);
      let acm = asbestos.filter(x => x.auctext == dataItem.auctext && x.audtext == dataItem.audtext);
      let ref = acm.filter(x => x.asasadditionalnotes.includes('SAMPLEXREF'));
     // console.log({ ref: ref, acm: acm });
      if (ref.length > 0) {
        const refName = ref[0].asasadditionalnotes.split(":");
        let sampleList = dataItem.sampleList.filter(x => x.sampleReference == refName[1] && x.sequence == dataItem.asassequence);
        if (sampleList.length > 0) {
          return true
        }
        return false;
      } else {
        let sampleList = dataItem.sampleList.filter(x => x.sequence == dataItem.asassequence);
        if (sampleList.length > 0) {
          return true
        }
        return false;
      }
    }

    return false;


  }

  groupBy(array, key) {
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {});
  }

  export() {

    let tempData = this.asbestosData;
    tempData.map(s => {
      s.asassurveydate = (s.asassurveydate != "") ? DateFormatPipe.prototype.transform(s.asassurveydate, 'DD-MMM-YYYY') : s.asassurveydate;
      s.asmainitialdeadline = (s.asmainitialdeadline != "") ? DateFormatPipe.prototype.transform(s.asmainitialdeadline, 'DD-MMM-YYYY') : s.asmainitialdeadline;
      s.asmainitialcompdate = (s.asmainitialcompdate != "") ? DateFormatPipe.prototype.transform(s.asmainitialcompdate, 'DD-MMM-YYYY') : s.asmainitialcompdate;
      s.asmasubseqdeadline = (s.asmasubseqdeadline != "") ? DateFormatPipe.prototype.transform(s.asmasubseqdeadline, 'DD-MMM-YYYY') : s.asmasubseqdeadline;
      s.asmasubseqcompdate = (s.asmasubseqcompdate != "") ? DateFormatPipe.prototype.transform(s.asmasubseqcompdate, 'DD-MMM-YYYY') : s.asmasubseqcompdate;
      s.reviewDate = (s.reviewDate != "") ? DateFormatPipe.prototype.transform(s.reviewDate, 'DD-MMM-YYYY') : s.reviewDate;
      s.reinspectionDate = (s.reinspectionDate != "") ? DateFormatPipe.prototype.transform(s.reinspectionDate, 'DD-MMM-YYYY') : s.reinspectionDate;
    });

    if (this.asbestosData && this.asbestosData.length > 0) {
      let label = {
        'auctext': 'ACM Category',
        'audtext': 'ACM Detail',
        'location': 'Location',
        'floor': 'Floor',
        'position': 'Position',
        'presence': 'Presence',
        'type': 'Survey Type',
        'materialRisk': 'Material Risk',
        'priorityRisk': 'Priority Risk',
        'totalRisk': 'Total Risk',
        'pendingChangeYN': 'Pending Request?',
        'hseNotifiable':'HSE Notifiable',
        'asasextent':'Extent',
        'uom': 'UOM',
        'asassurveydate': 'Survey Date',
        'svrname': 'Surveyor',
        'asactext': 'Inspection Access',
        'asasdescription': 'Description',
        'asasadditionalnotes': 'Additional Notes',
        'dataSource': 'Data Source',
        'apsproducttext': 'Product',
        'adstext': 'Damage',
        'assctext': 'Surface',
        'atstext': 'Type',
        'mainactivity': 'Main Activity',
        'secondaryactivity': 'Secondary Activity',
        'priorityLocation': 'Priority Location',
        'priorityAccess': 'Priority Access',
        'priorityExtent': 'Priority Extent',
        'priorityOccupants': 'Priority Occupants',
        'priorityFrequency': 'Priority Frequency',
        'priorityTimeInUse': 'Priority Time In Use',
        'initialAction': 'Initial Action',
        'initialTimeframe': 'Initial Timeframe',
        'asmainitialdeadline': 'Initial Deadline',
        'asmainitialcompdate': 'Initial Completion',
        'subsequentAction': 'Subsequent Action',
        'subsequentTimeframe': 'Subsequent Timeframe',
        'asmasubseqdeadline': 'Subsequent Deadline',
        'asmasubseqcompdate': 'Subsequent Completion',
        'reviewTimeframe': 'Review Timeframe',
        'reviewDate': 'Review Date',
        'reinspectionTimeframe': 'Reinspection Timeframe',
        'reinspectionDate': 'Reinspection Date'
      }

      this.helperService.exportToexcelWithAssetDetails(this.asbestosData, 'Asset-Asbestos', label)
    } else {
      this.alertService.error("There is no record to export.")
    }


  }





}
