import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor, CompositeFilterDescriptor} from '@progress/kendo-data-query';
import { SurveyPortalService, AlertService, ConfirmationDialogService, SharedService, HnsPortalService } from 'src/app/_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-survey-cbcreport-select-pdf',
  templateUrl: './survey-cbcreport-select-pdf.component.html',
  styleUrls: ['./survey-cbcreport-select-pdf.component.css']
})
export class SurveyCbcreportSelectPDFComponent implements OnInit {
  @Input() openCBCselectPDF: boolean = false;
  @Input() selectType: string = "";
  @Input() surveyAssetLabel: string = "";
  @Input() AssetID: string;
  @Output() closeCBCselectPDF = new EventEmitter<any>();
  gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    take: 100,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  showgrid1: boolean = true;
  listData: any;
  selectedData: any;
  subs = new SubSink();
  title: string;
  SelectBtnDisabled: boolean = true;
  selectedRowIndex = 0;
  selectedNTPSeq =  0;
  touchtime = 0;

  constructor(
    private surveyService: SurveyPortalService,
    private hnsService: HnsPortalService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) { }


  ngOnInit()
  {
    if (this.showgrid1)
    {
      this.getCBCAssetPDFs(this.AssetID);
    }
    this.title  = "Select PDF Document for " + this.selectType;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited })
  {
      this.selectedData = dataItem;
      this.selectedNTPSeq = this.selectedData.ntpsequence;
      this. SelectBtnDisabled = false;

      if (this.touchtime == 0) {
        // set first click
        this.touchtime = new Date().getTime();
      } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (((new Date().getTime()) - this.touchtime) < 400) {
          // double click occurred
          this.selectMethod();
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }

  }





  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.listData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {

    this.state.filter = filter;
    this.gridView = process(this.listData, this.state);

  }


  selectMethod() {
    if (this.selectedNTPSeq > 0)
    {
      this.openCBCselectPDF = false;
      this.closeCBCselectPDF.emit(this.selectedData)
    }
  }

  closeMethod() {

    this.openCBCselectPDF = false;
    this.closeCBCselectPDF.emit(this.selectedData)

  }


  getCBCAssetPDFs(AssetID: string) {

    this.subs.add(
    this.surveyService.GetListOfAssetPDFNotepads(AssetID).subscribe(
       data => {
         //console.log(data)
         if (data.isSuccess) {

          let tempData = data.data;
          tempData.map(s => {
            s.ntpmodifiedtime = (s.ntpmodifiedtime != "") ? (s.ntpmodifiedtime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.ntpmodifiedtime, 'DD-MMM-YYYY HH:mm:ss'): '' : s.ntpmodifiedtime;
          });
           this.listData = tempData
           this.gridView = process(this.listData, this.state);
           this.chRef.markForCheck();
         }
       }
     )
   )
 }




}
