import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, HelperService } from '../../_services';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-hhsrs',
  templateUrl: './asset-hhsrs.component.html',
  styleUrls: ['./asset-hhsrs.component.css']
})
export class AssetHhsrsComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;

  hhsrsData;

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
  groups: GroupDescriptor[] = [];
  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  notesDetails: boolean = false;
  selectedNotes;
  notesTitle;
  notesImagePath: SafeResourceUrl;
  fileName: string = 'asset-hhsrs.xlsx';
  subs = new SubSink(); // to unsubscribe services

  constructor(
    private assetAttributeService: AssetAttributeService,
    private _sanitizer: DomSanitizer,
    private helper: HelperService,
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.getAssetHHSRSList();
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  getAssetHHSRSList() {
    this.subs.add(
      this.assetAttributeService.getAssetHHSRSList(this.assetId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              //console.log(data);
              let tempData = data.data;
              tempData.map(s => {
                s.assessment_Date = (s.assessment_Date != "") ? DateFormatPipe.prototype.transform(s.assessment_Date, 'DD-MMM-YYYY') : s.assessment_Date;
              });
              this.hhsrsData = tempData;
              this.gridView = process(this.hhsrsData, this.state);
            }
          }
        )
    )
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.hhsrsData, this.state);//process(this.characteristicData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.hhsrsData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.hhsrsData, this.state);

  }


  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'asset-hhsrs.' + fileExt;
      let ignore = [];
      let label = {
        'hazard_Group': 'Hazard Group',
        'hazard_Name': 'Hazard Name',
        'status': 'status',
        'band': 'Band',
        'score': 'Score',
        'category': 'Category',
        'assessment_Date': 'Assessment Date',
        'assessment_User': 'Assessment User',
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
        //this.helper.exportAsExcelFile(this.selectedRows, 'asset-hhsrs', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'asset-hhsrs', label)
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

  openNotesDetails(notesDetails) {

    this.selectedNotes = notesDetails;
    if (this.selectedNotes.type == 'P') {
      $('.portalwBlur').addClass('ovrlay');
      this.notesTitle = "Attribute Image";
      this.assetAttributeService.getNotepadImage(this.selectedNotes.type, this.selectedNotes.ntpSequence, this.selectedNotes.ntpModifiedTime, this.selectedNotes.description).subscribe(
        data => {
          this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/jpg;base64,' + data);
          this.notesDetails = true;
        }
      )
    } else if (this.selectedNotes.type == 'N') {
      $('.portalwBlur').addClass('ovrlay');
      this.notesTitle = "View Notepad Note...";
      this.notesDetails = true;
    } else if (this.selectedNotes.linkType == 'L') {
      let lnk = this.selectedNotes.link;
      let fileExt = lnk.substring(lnk.lastIndexOf(".") + 1)
      if (fileExt == 'txt') {

      } else if (fileExt == 'pdf') {
        this.assetAttributeService.getNotepadFile(this.selectedNotes.linkType, this.selectedNotes.ntpSequence, this.selectedNotes.modifiedDate, this.selectedNotes.text).subscribe(
          data => {
            const linkSource = 'data:application/pdf;base64,' + data;
            const downloadLink = document.createElement("a");
            const fileName = this.selectedNotes.fileName;
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
            //this.notesDetails = true;
          }
        )
      }

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
    $('.portalwBlur').removeClass('ovrlay');
  }
}
