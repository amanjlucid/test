import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService } from '../../_services';
import { AssetRisk } from '../../_models'
declare var $: any;
import { SubSink } from 'subsink';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-asset-risk',
  templateUrl: './asset-risk.component.html',
  styleUrls: ['./asset-risk.component.css']
})
export class AssetRiskComponent implements OnInit {

  @Input() displayRiskDetails
  @Input() assetID: string = ''
  @Input() assetAddress: string = ''
  @Output() closeRiskDetailsWindow = new EventEmitter<boolean>();
  subs = new SubSink();
  assetRiskModel: AssetRisk
  loading = false;
  currentUser;
  readonlyForm = true;
  WindowTitle = 'Asset Risk  Asset: ';
  riskData: any = [];
  Grid1 = true
  Grid2 = false

  constructor(
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {

    this.WindowTitle = 'Asset Risk  Asset: ' + this.assetID + ' - ' + this.assetAddress
    this.loading = true;
     this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.loadResidentDetails()
  }

  loadResidentDetails(){

    this.wopmConfigurationService.getAssetRiskDetails(this.assetID)
    .subscribe(
      data => {
        if (data.isSuccess) {
          this.riskData = data.data
          this.loading = false;
          this.chRef.detectChanges();
        } else {
          this.loading = false;
          this.alertService.error(data.message);
          this.chRef.detectChanges();
        }
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      });

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeRiskDetailsWin(){
    this.displayRiskDetails  = false
    this.closeRiskDetailsWindow.emit(true)
  }

  swap(){
    this.Grid1 = !this.Grid1
    this.Grid2 = !this.Grid2
  }

}
