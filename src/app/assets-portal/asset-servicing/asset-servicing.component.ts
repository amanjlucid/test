import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, SelectionEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, AlertService,  HelperService, SharedService } from '../../_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SubSink } from 'subsink';

declare var $: any;

@Component({
  selector: 'app-asset-servicing',
  templateUrl: './asset-servicing.component.html',
  styleUrls: ['./asset-servicing.component.css']
})
export class AssetServicingComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;
  serviceFilters;
  serviceData;
  actualServiceData;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  public mySelection: number[] = [];
  public selectedRows: any[] = [];
  groups: GroupDescriptor[] = [];
  notesDetails: boolean = false;
  selectedNotes;
  notesTitle;
  notesImagePath: SafeResourceUrl;
  selectedAttribute;
  selectedService;
  touchtime = 0;
  servicingDetailWindow: boolean = false;
  fileName: string = 'asset-servicing.xlsx';
  subs = new SubSink(); // to unsubscribe services
  servicePortalAccess: any = [];

  // variable for service portal
  servicePortalRef = true; // show service portal attribute tabs 
  serviceServicingDetailWindow: boolean = false;
  currentUser;

  constructor(
    private alertService: AlertService,
    private assetAttributeService: AssetAttributeService,
    private _sanitizer: DomSanitizer,
    private helper: HelperService,
    private activatedRoute: ActivatedRoute,
    private sharedServie: SharedService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // check if user comes from service portal
    this.subs.add(
      this.sharedServie.servicePortalObs.subscribe(
        data => {
          this.servicePortalAccess = data;
          if (this.servicePortalAccess.length > 0) {
            if (this.helper.checkServicePortalTabInArr(this.servicePortalAccess) == false) {
              this.servicePortalRef = false;
            }
        }
      })

      // this.activatedRoute.queryParams.subscribe(params => {
      //   const servicePortal = params['servicing'];
      //   if (servicePortal != undefined && servicePortal == "true") {
      //     this.servicePortalRef = servicePortal;
      //     this.sharedServie.servicePortalObs.subscribe(
      //       data => {
      //         this.servicePortalAccess = data;
      //         if (this.servicePortalAccess.length > 0) {
      //           if (this.helper.checkServicePortalTabInArr(this.servicePortalAccess) == false) {
      //             this.servicePortalRef = false;
      //           }
      //       }
      //     })
      //   }
      // })
    );


    // call service grid apis
    this.getAssetServicingFilters();
    this.getAssetServicingList();

  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  getAssetServicingFilters() {
    this.subs.add(
      this.assetAttributeService.getAssetServicingFilters(this.assetId).subscribe(
        data => {
          this.serviceFilters = data;
        }
      )
    )
  }

  getAssetServicingList() {
    this.subs.add(
      this.assetAttributeService.getAssetServicingList(this.assetId, this.currentUser.userId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.stage_Complete = (s.stage_Complete == 'Y') ? 'Yes' : 'No';
                s.planned_Date = (s.planned_Date != "") ? DateFormatPipe.prototype.transform(s.planned_Date, 'DD-MMM-YYYY') : s.planned_Date;
                s.review_Date = (s.review_Date != "") ? DateFormatPipe.prototype.transform(s.review_Date, 'DD-MMM-YYYY') : s.review_Date;
                s.service_Date = (s.service_Date != "") ? DateFormatPipe.prototype.transform(s.service_Date, 'DD-MMM-YYYY') : s.service_Date;
                s.completion_Date = (s.completion_Date != "") ? DateFormatPipe.prototype.transform(s.completion_Date, 'DD-MMM-YYYY') : s.completion_Date;
                s.changed_On = (s.changed_On != "") ? DateFormatPipe.prototype.transform(s.changed_On, 'DD-MMM-YYYY') : s.changed_On;
              });

              this.serviceData = tempData;
              this.actualServiceData = tempData;
              this.gridView = process(this.serviceData, this.state);
            }
          }
        )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.serviceData, this.state);//process(this.characteristicData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.serviceData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.serviceData, this.state);

  }

  filterAttributes(value) {
    let actualchar = this.actualServiceData;
    if (value == 'ALL') {
      this.serviceData = this.actualServiceData;
    } else {
      this.serviceData = actualchar.filter(c => c.filterValue == value);
    }
    this.gridView = process(this.serviceData, this.state)
  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'asset-servicing.' + fileExt;
      let ignore = [];
      let label = {
        'contractor': 'Contractor',
        'service_Contract': 'Service Contract',
        'job_Number': 'Job Number',
        'service_Type': 'Service Type',
        'service_Stage': 'Service Stage',
        'stage_Complete': 'Stage Complete',
        'job_Type': 'Job Type',
        'due_Date': 'Due Date',
        'planned_Date': 'Planned Date',
        'review_Date': 'Review Date',
        'service_Date': 'Service Date',
        'completion_Date': 'Completion Date',
        'service_Cost': 'Service Cost',
        'changed_By': 'Modified By',
        'changed_On': 'Date Modified'

      }
      if (rowSelection != null) {
        if (this.mySelection.length != undefined && this.mySelection.length > 0) {
          let selectedRows = this.gridView.data.filter((v, k) => {
            return this.mySelection.includes(k)
          });
          this.selectedRows = selectedRows;
        } else {
          this.selectedRows = this.gridView.data;
        }
      } else {
        this.selectedRows = this.gridView.data;
      }
      //if (fileExt == 'xlsx' && rowSelection != null) {
      if (fileExt == 'xlsx') {
        //this.helper.exportAsExcelFile(this.selectedRows, 'asset-servicing', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'asset-servicing', label)
      } else if (fileExt == 'html') {
        this.helper.exportAsHtmlFile(this.selectedRows, this.fileName, label)
      } else {
        this.helper.exportToCsv(this.fileName, this.selectedRows, ignore, label);
      }
      //this.helper.exportToCsv(this.fileName, this.gridView.data, ignore, label);
    } else {
      grid.saveAsExcel();
    }
  }

  openServicingDetail(event) {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        // double click occurred
        let comp = this;
        setTimeout(function () {
          comp.assetAttributeService.getAssetServicingDetail(comp.selectedService.assid, comp.selectedService.job_Number).subscribe(
            data => {
              if (data && data.isSuccess) {
                comp.selectedAttribute = data.data;
                if (comp.servicePortalRef) {
                  comp.serviceServicingDetailWindow = true;
                } else {
                  comp.servicingDetailWindow = true;
                }
                $('.charBlur').addClass('ovrlay');
                comp.touchtime = 0;
              }
            }
          )
        }, 400);

      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }
  }

  closeServicingDetailWindow($event) {
    $('.charBlur').removeClass('ovrlay');
    this.servicingDetailWindow = $event;
  }

  closeServiceServicingDetailWindow($event) {
    $('.charBlur').removeClass('ovrlay');
    this.serviceServicingDetailWindow = $event;
  }

  public selectedRowChange(selectionEvent: SelectionEvent) {
    // console.log(selectionEvent)
    //this.selectedService = this.gridView.data[selectionEvent.index];
    //console.log(this.selectedService);
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedService = dataItem;
   
  }

  openNotesDetails(notesDetails) {

    this.selectedNotes = notesDetails;
    if (this.selectedNotes.linkType == 'P') {
      $('.charBlur').addClass('ovrlay');
      this.notesTitle = "Servicing Image";
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

  checkDate(date) {
    if (date == '01-Jan-1753') {
      return null;
    }
    return date;
  }

}
