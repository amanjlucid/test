import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetAttributeService } from '../../_services'

declare var $: any;

@Component({
  selector: 'app-asset-wag-detail',
  templateUrl: './asset-wag-detail.component.html',
  styleUrls: ['./asset-wag-detail.component.css']
})
export class AssetWagDetailComponent implements OnInit {

  @Input() wagWindow: boolean = false;
  @Input() selectedAsset;
  @Input() selectedAttribute;
  @Output() closewagWindow = new EventEmitter<boolean>();
  public windowWidth = '800';
  public windowHeight = 'auto';
  public windowTop = '45';  
  public windowLeft = 'auto';
  wagDetails;
  readonly = true;
  public windowState = 'default'; //maximized
  

  constructor(
    private assetAttributeService: AssetAttributeService,
  ) { }

  ngOnInit() {
    this.getAssetAttributeWAGDetail();
  }

  public closewagWin() {
    this.wagWindow = false;
    this.closewagWindow.emit(this.wagWindow)
  }

  getAssetAttributeWAGDetail(){
    this.assetAttributeService.getAssetAttributeWAGDetail(this.selectedAsset.assetId, this.selectedAttribute.ataId).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.wagDetails = data.data;
        }
      }
    )
  }

  checkDate(expiryDate){
    if(expiryDate){
      const actualDate = new Date(expiryDate);
      const today = new Date();
      if(today > actualDate){
        return true;
      }
    }
    return false;
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
