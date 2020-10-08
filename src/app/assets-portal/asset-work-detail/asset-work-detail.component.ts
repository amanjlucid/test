import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AssetAttributeService, HelperService } from '../../_services'
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-work-detail',
  templateUrl: './asset-work-detail.component.html',
  styleUrls: ['./asset-work-detail.component.css']
})
export class AssetWorkDetailComponent implements OnInit, OnDestroy {

  @Input() assetWorkDetailWindow: boolean = false;
  @Input() selectedAsset;
  @Input() selectedAttribute;
  @Output() closeassetWorkDetailWindow = new EventEmitter<boolean>();
  public windowWidth = '800';
  public workDetailWindowHeight: any = '730';
  public windowTop = '45';
  public windowLeft = 'auto';
  workDetailFull: boolean = false;
  readonly = true;
  workDetails;
  public windowState = 'default';
  public workDetailsWindowState = 'default';
  subs = new SubSink(); // to unsubscribe services

  constructor(
    private assetAttributeService: AssetAttributeService,
    public helperService: HelperService
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {
    let comp = this;
    setTimeout(function () {
      comp.workDetailFull = comp.assetWorkDetailWindow;
      comp.getAssetAttributeWorkListDetails();
    }, 800);

  }

  public closeAssetWorkDetailWin() {
    this.assetWorkDetailWindow = false;
    this.closeassetWorkDetailWindow.emit(this.assetWorkDetailWindow)
  }

  getAssetAttributeWorkListDetails() {
    let ataid = (this.selectedAttribute.ataId == undefined) ? this.selectedAttribute.wlataid : this.selectedAttribute.ataId
    this.subs.add(
      this.assetAttributeService.getAssetAttributeWorkListDetails(this.selectedAsset.assetId, ataid).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.workDetails = data.data;
          }
        }
      )
    )
  }



  openWorkDetailFull() {
    $('.workDetailHalf').addClass('ovrlay');
    this.workDetailFull = true;
  }

  closeWorkDetailFull() {
    $('.workDetailHalf').removeClass('ovrlay');
    this.assetWorkDetailWindow = false;
    this.workDetailFull = false;
    this.closeassetWorkDetailWindow.emit(this.assetWorkDetailWindow)
  }

  printDiv() {
    this.windowState = 'maximized';
    $('.mainDiv, .buttonDiv, .k-header').hide();
    $('.k-content').addClass('mt-5');
    setTimeout(function () {
      window.print();
      setTimeout(function () {
        $('.mainDiv, .buttonDiv, .k-header').show();
        $('.k-content').removeClass('mt-5');

      }, 100);

    }, 100);
  }


  printpage() {
    var divToPrint = $('#print-area').html();
    var newWin = window.open('', 'Print-Window');
    newWin.document.open();
    newWin.document.write('<html><head><style>p{min-height:32px; height:38px; padding:0px; font-size:10px; word-wrap: break-word;} .input-sm{word-wrap:break-word!important; font-size:10px;}</style></head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"><link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet"><body onload="window.print()">' + divToPrint + '</body></html>');
    newWin.document.close();
    setTimeout(function () { newWin.close(); }, 10);

  }


}
