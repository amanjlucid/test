import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { AssetAttributeService, HelperService, AlertService, SharedService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { trigger, transition, useAnimation, animate, style, state, keyframes, group } from '@angular/animations';
import { EPCProgressIndicatorAnimation} from '../../assets-portal/EPCAnimation/EPCAnimation'


@Component({
  selector: 'app-asset-epc',
  templateUrl: './asset-epc.component.html',
  styleUrls: ['./asset-epc.component.css'],
  animations: [
  EPCProgressIndicatorAnimation.bounce,
  EPCProgressIndicatorAnimation.noRatingbounce

],

})
export class AssetEpcComponent implements OnInit, OnDestroy {
  show = false;
  noRatingShow = false;
  historyWindow: boolean = false;
  recWindow: boolean = false;
  addendaWindow: boolean = false;
  dataWindow: boolean = false;
  retrieveWindow: boolean = false;
  @ViewChild('RetrievePanel') RetrievePanel; 
  @Input() assetId: string;
  @Input() selectedAsset;
  public YValueSAP = 0;
  public YValueSAPPotential = 0;
  public YValueEI = 0;
  public YValueEIPotential = 0;
  public Delay1 = 0;
  public Delay2 = 0.3;
  public Delay3 = 0.6;
  public Delay4 = 0.9;
  
  public ePCViewModel

  public SAPRating = 0;
  public SAPPotentialRating = 0;
  public EIRating = 0;
  public EIPotentialRating = 0;

  public SAPBand = '';
  public SAPPotentialBand = '';
  public EIBand = '';
  public EIPotentialBand = '';

  public SAPChartText = '';
  public EIChartText = '';
  

  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public allowUnsort = true;
  public multiple = false;
  public energyData;
  public gridView: DataResult;

  noRatingPosition = -170;
  loadData = false;
  isEdcname = false;
  energyTableData;
  fileName: string = 'EPCs.xlsx';
  subs = new SubSink(); // to unsubscribe services
  public navIsFixed: Boolean = false;

  public epcStatus: string;
  energyPortalAccess = [];

  epcSequence: number;
  rrn: string;
  address: string;
  
  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.subs.add(this.sharedService.energyPortalAccess.subscribe(data => { 
      this.energyPortalAccess = data;
    })) 
    this.getAssetEPCList();

  }


  get stateName() {
    return this.show ? 'show' : 'hide'
  }

  get bounceState(): any {
    return {
      value: this.show ? 'show' : 'hide',
      params: {
        YValue: this.YValueSAP,
        YValue1: (this.YValueSAP - 25),
        YValue2: (this.YValueSAP + 17),
        YValue3: (this.YValueSAP - 8),
        YValue4: (this.YValueSAP + 4),
        YValue5: (this.YValueSAP - 2),
        YValue6: (this.YValueSAP + 1),
        Delay: this.Delay1
      }
    };
  }

  get bounceState2(): any {
    return {
      value: this.show ? 'show' : 'hide',
      params: {
        YValue: this.YValueSAPPotential,
        YValue1: (this.YValueSAPPotential - 16),
        YValue2: (this.YValueSAPPotential + 8),
        YValue3: (this.YValueSAPPotential - 6),
        YValue4: (this.YValueSAPPotential + 4),
        YValue5: (this.YValueSAPPotential - 2),
        YValue6: (this.YValueSAPPotential + 1),
        Delay: this.Delay2
      }
    };
  }

  get bounceState3(): any {
    return {
      value: this.show ? 'show' : 'hide',
      params: {
        YValue: this.YValueEI,
        YValue1: (this.YValueEI - 16),
        YValue2: (this.YValueEI + 8),
        YValue3: (this.YValueEI - 6),
        YValue4: (this.YValueEI + 4),
        YValue5: (this.YValueEI - 2),
        YValue6: (this.YValueEI + 1),
        Delay: this.Delay3
      }
    };
  }

  
  get bounceState4(): any {
    return {
      value: this.show ? 'show' : 'hide',
      params: {
        YValue: this.YValueEIPotential,
        YValue1: (this.YValueEIPotential - 16),
        YValue2: (this.YValueEIPotential + 8),
        YValue3: (this.YValueEIPotential - 6),
        YValue4: (this.YValueEIPotential + 4),
        YValue5: (this.YValueEIPotential - 2),
        YValue6: (this.YValueEIPotential + 1),
        Delay: this.Delay4
      }
    };
  }

  get noRatingState(): any {
    return {
      value: this.noRatingShow ? 'show' : 'hide',
      params: {
        YValue: this.noRatingPosition,
        YValue1: (this.noRatingPosition - 16),
        YValue2: (this.noRatingPosition + 8),
        YValue3: (this.noRatingPosition - 6),
        YValue4: (this.noRatingPosition + 4),
        YValue5: (this.noRatingPosition - 2),
        YValue6: (this.noRatingPosition + 1),
        Delay: this.Delay1
      }
    };
  }


  public mySelectionKey(context: RowArgs) {
    return context.index;
  }
  // public sortChange(sort: SortDescriptor[]): void {
  //   this.state.sort = sort;
  //   this.gridView = process(this.energyData, this.state);
  // }

  // public filterChange(filter: CompositeFilterDescriptor): void {
  //   this.state.filter = filter;
  //   this.gridView = process(this.energyData, this.state);

  // }

  
  getAssetEPCList() {
    this.subs.add(
      this.assetAttributeService.getAssetEPCList(this.assetId).subscribe(
        data => {

          if (data && data.isSuccess) {
            this.ePCViewModel = data.data;
            this.epcStatus = this.ePCViewModel.activeEPCStatus;
            this.energyTableData = this.ePCViewModel.epcList;
            let gd = process(this.ePCViewModel.epcList, this.state);
            this.gridView = gd;

            this.SAPRating =this.ePCViewModel.currentSAP;
            this.YValueSAP = this.IndicatorPosition(this.ePCViewModel.currentSAP);
            this.SAPPotentialRating = this.ePCViewModel.currentSAPPotential;
            this.YValueSAPPotential = this.IndicatorPosition(this.ePCViewModel.currentSAPPotential);
            this.EIRating = this.ePCViewModel.currentEI;
            this.YValueEI = this.IndicatorPosition(this.ePCViewModel.currentEI);
            this.EIPotentialRating = this.ePCViewModel.currentEIPotential;
            this.YValueEIPotential = this.IndicatorPosition(this.ePCViewModel.currentEIPotential);
       
            this.SAPBand = this.ePCViewModel.currentSAPBand;
            this.SAPPotentialBand = this.ePCViewModel.currentSAPPotentialBand;
            this.EIBand = this.ePCViewModel.currentEIBand;
            this.EIPotentialBand = this.ePCViewModel.currentEIPotentialBand;

            this.Delay1 = 0;
            this.Delay2 = 0.2;
            this.Delay3 = 0.4;
            this.Delay4 = 0.6;

            this.SAPChartText = "SAP rating is {{ePCViewModel.currentSAPBand}}({{ePCViewModel.currentSAP}}) and potential is {{ePCViewModel.currentSAPPotentialBand}}({{ePCViewModel.currentSAPPotential}})";
            this.EIChartText = "Environmental Impact rating is {{EIBand}}({{EIRating}}) and potential is {{EIPotentialBand}}({{EIPotentialRating}})";
            
            if (this.ePCViewModel.currentSAP != 0)
            {
                  this.show = !this.show;
            }
            else
            {
              this.noRatingShow = !this.noRatingShow;
            }
       
          }
          
        }
      ))
  }


  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = this.assetId + '_EPCs.' + fileExt;
      //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
      let ignore = [];
      let label = {
        'createdate':'Created Date',
        'prrn': 'PRRN',
        'rrn': 'RRN',
        'epcstatus':'EPC Stage',
        'lodgedate': 'Lodge Date',
        'expirydate': 'Expiry Date',
        'sap':'SAP',
        'sapband': 'SAP Band',
        'ei': 'EI',
        'eiband':'EI Band',
        'scheduledDate': 'Scheduled Date',
        'surveydate': 'Survey Date',
        'supname': 'Survey Project',
        'subname': 'Survey Batch'
      }


      this.energyTableData.map(s => {
        s.prrn = (s.prrn > 0) ? s.prrn : '';
        s.createdate = (s.createdate != "") ? DateFormatPipe.prototype.transform(s.createdate, 'DD-MMM-YYYY') : s.createdate;
        s.lodgedate = (s.lodgedate != "") ? DateFormatPipe.prototype.transform(s.lodgedate, 'DD-MMM-YYYY') : s.lodgedate;
        s.expirydate = (s.expirydate != "") ? DateFormatPipe.prototype.transform(s.expirydate, 'DD-MMM-YYYY') : s.expirydate;
        s.scheduledDate = (s.scheduledDate != "") ? DateFormatPipe.prototype.transform(s.scheduledDate, 'DD-MMM-YYYY') : s.scheduledDate;
        s.surveydate = (s.surveydate != "") ? DateFormatPipe.prototype.transform(s.surveydate, 'DD-MMM-YYYY') : s.surveydate;
        s.sap = (s.sap > 0) ? s.sap : '';
        s.ei = (s.ei > 0) ? s.ei : '';
      });


      let groupData = this.gridView.data.map(x => {
        return x.items;
      });
      let energyGrpData = [].concat.apply([], this.energyTableData);

      if (rowSelection != null) {
        if (this.mySelection.length != undefined && this.mySelection.length > 0) {
          let selectedRows = energyGrpData.filter((v, k) => {
            return this.mySelection.includes(k)
          });
          this.selectedRows = selectedRows;
        } else {
          this.selectedRows = energyGrpData;
        }
      } else {
        this.selectedRows = energyGrpData;
      }

      // if (fileExt == 'xlsx' && rowSelection != null) {
      if (fileExt == 'xlsx') {
        //this.helper.exportAsExcelFile(this.selectedRows, 'energy-answer', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, this.assetId + '_EPCs', label)
      } else if (fileExt == 'html') {
        this.helper.exportAsHtmlFile(this.selectedRows, this.fileName, label)
      } else {
        this.helper.exportToCsv(this.fileName, this.selectedRows, ignore, label);
      }

    } else {
      grid.saveAsExcel();
    }

  }


  IndicatorPosition(rating) {

    if (rating < 1)
    {
      return -17;
    }
    else if (rating <= 20)
    {
      var ypos = (rating/20) * -37;
      ypos = ypos - 10;
      if (ypos > -17)
      {
        ypos = -17;
      }
      return ypos;
    }
    else if (rating <=38)
    {
      rating =  rating - 20;
      var ypos = (rating/18) * -37;
      ypos = ypos - 47;
      return ypos;
    }
    else if (rating <=54)
    {
      rating =  rating - 38;
      var ypos = (rating/16) * -37;
      ypos = ypos - 84;
      return ypos;
    }
    else if (rating <=68)
    {
      rating =  rating - 54;
      var ypos = (rating/14) * -37;
      ypos = ypos - 121;
      return ypos;
    }
    else if (rating <=80)
    {
      rating =  rating - 68;
      var ypos = (rating/12) * -37;
      ypos = ypos - 158;
      return ypos;
    }
    else if (rating <=91)
    {
      rating =  rating - 80;
      var ypos = (rating/11) * -37;
      ypos = ypos - 195;
      return ypos;
    }
    else
    {
      rating =  rating - 91;
      var ypos = (rating/10) * -37;
      ypos = ypos - 232;
      if (ypos < -260)
      {
        ypos = -260;
      }
      return ypos;
    }
  }

  getSAPColor(rating) {
    if (rating <= 20)
    {
      return '#e9153b';;
    }
    else if (rating <=38)
    {
      return '#ef8023';
    }
    else if (rating <=54)
    {
      return '#fcaa65';
    }
    else if (rating <=68)
    {
      return '#ffd500';
    }
    else if (rating <=80)
    {
      return '#8dce46';
    }
    else if (rating <=91)
    {
      return '#19b459';
    }
    else
    {
      return '#008054';
    }
  }

  
  getEIColor(rating) {
    if (rating <= 20)
    {
      return '#807f83';
    }
    else if (rating <=38)
    {
      return '#919194';
    }
    else if (rating <=54)
    {
      return '#a5a6a9';
    }
    else if (rating <=68)
    {
      return '#4e84c4';
    }
    else if (rating <=80)
    {
      return '#73a2d6';
    }
    else if (rating <=91)
    {
      return '#97c0e6';
    }
    else
    {
      return '#cde2f5';
    }
  }

  getBand(rating) {
    if (rating <= 20)
    {
      return 'G';
    }
    else if (rating <=38)
    {
      return 'F';
    }
    else if (rating <=54)
    {
      return 'E';
    }
    else if (rating <=68)
    {
      return 'D';
    }
    else if (rating <=80)
    {
      return 'C';
    }
    else if (rating <=91)
    {
      return 'B';
    }
    else
    {
      return 'A';
    }
  }



  getYear(initialDate){
    var properDate = new Date(initialDate);
    var yearValue = properDate.getFullYear();
    return yearValue;
    }



    openEPCHistory(assetObj = null) {
      this.historyWindow = true;
      this.epcSequence = assetObj.epcsequence;
      this.address = this.selectedAsset.address;
      this.rrn = assetObj.rrn;
        $('.portalwBlur').addClass('ovrlay');

    }

    
    openEPCRecommendations(assetObj = null) {
      this.recWindow = true;
      this.epcSequence = assetObj.epcsequence;
      this.address = this.selectedAsset.address;
      this.rrn = assetObj.rrn;
        $('.portalwBlur').addClass('ovrlay');

    }

        
    openEPCAddenda(assetObj = null) {
      this.addendaWindow = true;
      this.epcSequence = assetObj.epcsequence;
      this.address = this.selectedAsset.address;
      this.rrn = assetObj.rrn;
        $('.portalwBlur').addClass('ovrlay');

    }

            
    openEPCData(assetObj = null) {
      this.dataWindow = true;
      this.epcSequence = assetObj.epcsequence;
      this.address = this.selectedAsset.address;
      this.rrn = assetObj.rrn;
        $('.portalwBlur').addClass('ovrlay');

    }

    getEPCCertificate(assetObj = null) {
      this.subs.add(
        this.assetAttributeService.getEPCCertificate(this.assetId, assetObj.epcsequence).subscribe(
          data => {
            if (data && data.isSuccess) {
              var results = data.data;
              if (results.pdf){
                if (results.pdfConfig && results.pdfConfig.fileExtension) {
                var linkSource = 'data:' + results.pdfConfig.mimeType1 + ';base64,';
                  if (results.pdfConfig.openWindow)
                  {
                    var byteCharacters = atob(results.pdfBytes);
                    var byteNumbers = new Array(byteCharacters.length);
                    for (var i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    var file = new Blob([byteArray], { type: results.pdfConfig.mimeType1 + ';base64' });
                    var fileURL = URL.createObjectURL(file);
                    let newPdfWindow =window.open(fileURL);
                  }
                  else
                  {
                    linkSource = linkSource + results.pdfBytes;
                    const downloadLink = document.createElement("a");
                    const fileName = 'EPC_' + this.assetId;
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                  }

                }
                else{
                  this.alertService.error("This file format is not supported.");
                }
              }
              else{
                let newPdfWindow =window.open(results.epcLocation);
              }
            }
            else{
              this.alertService.error("The EPC Certificate cannot be found.");
            }
          }
        ))
    }



    closehistoryWindow($event) {
      $('.portalwBlur').removeClass('ovrlay');
      this.historyWindow = $event;
    }

    closerecWindow($event) {
      $('.portalwBlur').removeClass('ovrlay');
      this.recWindow = $event;
    }

    closeAddendaWindow($event) {
      $('.portalwBlur').removeClass('ovrlay');
      this.addendaWindow = $event;
    }

    closeDataWindow($event) {
      $('.portalwBlur').removeClass('ovrlay');
      this.dataWindow = $event;
    }

      
  openRetrieveEPCWindow() {
    $('.portalwBlur').addClass('ovrlay');    
    this.epcStatus = this.epcStatus;
    this.retrieveWindow = true;
  }

  
  closeRetrieveEPCWindow($event) {
    this.retrieveWindow = false;
     var isItRetrieved:boolean = $event;
      $('.portalwBlur').removeClass('ovrlay');
      if (isItRetrieved) {
        this.show = false;
        this.noRatingShow = false;
        this.getAssetEPCList();
        
      }
  }

  checkEnergyPortalAccess(val: string): Boolean {
    if (this.energyPortalAccess != undefined) {
    return this.energyPortalAccess.includes(val);
    }
  }

}
