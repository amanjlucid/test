import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SelectionEvent } from '@progress/kendo-angular-grid';
import { AlertService, AssetAttributeService, HelperService } from '../../_services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GridComponent } from '@progress/kendo-angular-grid';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-notepad',
  templateUrl: './asset-notepad.component.html',
  styleUrls: ['./asset-notepad.component.css']
})
export class AssetNotepadComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;

  notesData;
  currentUser;

  state: State = {
    skip: 0,
    sort: [],
    group: [{
      field: 'filter',
    }],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  selectedNotes;
  touchtime = 0;
  notesDetails: boolean = false;

  notesTitle;
  newNotesTitle: any;
  notesImagePath: SafeResourceUrl;
  @ViewChild(GridComponent) grid: GridComponent;
  subs = new SubSink(); // to unsubscribe services

  constructor(
    private alertService: AlertService,
    private assetAttributeService: AssetAttributeService,
    private _sanitizer: DomSanitizer,
    private helperService: HelperService
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getAssetNotepadList();
  }

  getAssetNotepadList() {
    this.subs.add(
      this.assetAttributeService.getAssetNotepadList(this.assetId, this.currentUser.userId)
        .subscribe(
          data => {
            //console.log(data);
            if (data && data.isSuccess) {
              let tempData = Object.create(data.data); //data.data;
              tempData.map((x: any) => {
                x.modifiedDate = this.helperService.formatDateTime1(x.modifiedDate)
              })

              this.notesData = tempData;
              this.gridView = process(this.notesData, this.state);
              this.close();
            }
          }
        )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.notesData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.notesData, this.state);

  }

  openNotesDetail($event) {
    this.selectedNotes = $event.dataItem;
    //console.log(this.selectedNotes);
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {

        if (this.selectedNotes.linkType == 'P') {
          if (this.selectedNotes.filter == "ASSETATTR") {
            this.newNotesTitle = "Attributes Image";
          } else if (this.selectedNotes.filter == "ASSETCHAR") {
            this.newNotesTitle = "Characteristics Image";
          } else if (this.selectedNotes.filter == "SERVICEJOB") {
            this.newNotesTitle = "Servicing Image";
          } else if (this.selectedNotes.filter == "ASBESTOS") {
            this.newNotesTitle = "Asbestos Image";
          } else if (this.selectedNotes.filter == "ASSET") {
            this.newNotesTitle = "Asset Image";
          } else {
            this.newNotesTitle = `${this.selectedNotes.filter} Image`;
          }
     

          $('.portalwBlur').addClass('ovrlay');
          this.notesTitle = "Attribute Image";
          this.assetAttributeService.getNotepadImage(
            this.selectedNotes.ntpType, this.selectedNotes.ntpGenericCode1, this.selectedNotes.ntpGenericCode2, this.selectedNotes.ntpSequence).subscribe(
              data => {
                this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
                  'data:image/jpg;base64,' + data);
                this.notesDetails = true;
              }
            )
        } else if (this.selectedNotes.linkType == 'N') {
          $('.portalwBlur').addClass('ovrlay');
          this.notesTitle = "View Notepad Note...";
          this.newNotesTitle = "View Notepad Note...";
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
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }
  }



  openDetail(dataitem) {
    this.selectedNotes = dataitem;
    if (this.selectedNotes.linkType == 'P') {
      if (this.selectedNotes.filter == "ASSETATTR") {
        this.newNotesTitle = "Attributes Image";
      } else if (this.selectedNotes.filter == "ASSETCHAR") {
        this.newNotesTitle = "Characteristics Image";
      } else if (this.selectedNotes.filter == "SERVICEJOB") {
        this.newNotesTitle = "Servicing Image";
      } else if (this.selectedNotes.filter == "ASBESTOS") {
        this.newNotesTitle = "Asbestos Image";
      } else if (this.selectedNotes.filter == "ASSET") {
        this.newNotesTitle = "Asset Image";
      } else {
        this.newNotesTitle = `${this.selectedNotes.filter} Image`;
      }

      $('.portalwBlur').addClass('ovrlay');
      this.notesTitle = "Attribute Image";
      this.assetAttributeService.getNotepadImage( 
        this.selectedNotes.ntpType, this.selectedNotes.ntpGenericCode1, this.selectedNotes.ntpGenericCode2, this.selectedNotes.ntpSequence).subscribe(
          data => {
            this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
              'data:image/jpg;base64,' + data);
            this.notesDetails = true;
          }
        )
    } else if (this.selectedNotes.linkType == 'N') {
      $('.portalwBlur').addClass('ovrlay');
      this.notesTitle = "View Notepad Note...";
      this.newNotesTitle = "View Notepad Note...";
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
    $('.portalwBlur').removeClass('ovrlay');
  }


  public selectedRowChange(selectionEvent: SelectionEvent) {
    this.selectedNotes = selectionEvent.selectedRows[0].dataItem;
    //console.log(this.selectedNotes);
  }

  close() {
    if (this.gridView.data.length != undefined) {
      for (let m = 0; m < this.gridView.data.length; m = m + 1) {
        this.grid.collapseGroup(m.toString());
      }
    }
  }

}
