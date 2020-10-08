import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetAttributeService,LoaderService, HelperService } from '../../_services'

@Component({
  selector: 'app-asset-servicing-detail',
  templateUrl: './asset-servicing-detail.component.html',
  styleUrls: ['./asset-servicing-detail.component.css']
})
export class AssetServicingDetailComponent implements OnInit {

  @Input() servicingDetailWindow: boolean = false;
  @Output() closeServicingDetailWindow = new EventEmitter<boolean>();
  @Input() selectedAsset;
  @Input() selectedAttribute;
  servicingDetails;
  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '15';
  public windowLeft = 'auto';
  public windowState = 'default'; //maximized
  readonly = true;



  constructor(
    private assetAttributeService: AssetAttributeService,
    private loaderService: LoaderService,
    public helper: HelperService
  ) { }

  ngOnInit() {
    let comp = this;
    setTimeout(function () {
      comp.getAssetAttributeServicingDetail();
    }, 200);
    
  }

  closeServicingDetailWin() {
    this.servicingDetailWindow = false;
    this.closeServicingDetailWindow.emit(this.servicingDetailWindow)
  }


  getAssetAttributeServicingDetail() {
    let ataid = (this.selectedAttribute.ataId == undefined) ? this.selectedAttribute.ataid : this.selectedAttribute.ataId
    this.assetAttributeService.getAssetAttributeServicingDetail(this.selectedAsset.assetId, ataid, this.selectedAttribute.job_Number).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.servicingDetails = data.data;
        }
      }
    )
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





}
