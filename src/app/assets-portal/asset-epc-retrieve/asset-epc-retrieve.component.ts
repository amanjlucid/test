import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef,  OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { AssetAttributeService, HelperService } from '../../_services'
import { SubSink } from 'subsink';


@Component({
  selector: 'app-asset-epc-retrieve',
  templateUrl: './asset-epc-retrieve.component.html',
  styleUrls: ['./asset-epc-retrieve.component.css']
})
export class AssetEpcRetrieveComponent implements OnInit, OnDestroy {
  @Input() assetId: string;
  @Input() epcStatus: string;
  @Input() retrieveWindow: boolean = false;
  @Output() closeRetrieveWindow = new EventEmitter<boolean>();
  public rRNText: string = "";
  public submitDisabled: boolean = true;
  @ViewChild('rRN') rrnTextbox;
  subs = new SubSink(); // to unsubscribe services
  currentUser;
  public dialogRetrievalConfirmation: boolean = false;
  public dialogRRNRequest: boolean = false;
  public dialogReplaceEPCConfirmation: boolean = false;
  public dialogUnavailableWarning: boolean = false;
  public dialogError: boolean = false;
  public confirmationMessage: string;
  public address: string;
  public warnings: string;
  public lodgedDate: string;
  public sapRating: string;
  public replaceMessage1: string;
  public replaceMessage2: string;
  public hasWarning: boolean;
  public hasResults: boolean;


  constructor(
    private assetAttributeService: AssetAttributeService,
    
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.rrnTextbox.focus();
    }, 0);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.epcStatus == null || this.epcStatus == "")
    {
      this.dialogRRNRequest = true;
    }
    else{
      if (this.epcStatus == "Lodged EPC")
      {
        this.replaceMessage1 = "There is already a Lodged EPC against this Asset.";
      }
      else
      {
        this.replaceMessage1 = "There is already an active EPC that is being processed against this Asset.";
      }
      this.replaceMessage2 = "Retrieving another EPC will replace it.";
      this.dialogReplaceEPCConfirmation = true;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onChange(value: any): void {
    var enteredRRN = value.replaceAll(/ /g, "");
    enteredRRN = enteredRRN.replaceAll("-", "");
    if (enteredRRN.trim().length == 20) {
      this.submitDisabled = false;
    }
    else {
      this.submitDisabled = true;
    }
  }
 
  public closeRetrieveWin(success: boolean) {
    this.retrieveWindow = false;
    this.dialogRetrievalConfirmation = false;
    this.dialogRRNRequest = false;
    this.dialogReplaceEPCConfirmation = false;
    this.dialogError = false;
    this.dialogUnavailableWarning = false;
    this.closeRetrieveWindow.emit(success)
  }


  public checkEPC() {
    this.subs.add(
      this.assetAttributeService.checkEPC(this.assetId,this.rRNText).subscribe(
        data => {
          if (data && data.isSuccess) {
            var result = data.data;
            this.hasResults = !result.noResults;
            this.confirmationMessage = result.address;
            this.dialogRetrievalConfirmation = true;
            this.dialogRRNRequest = false;
            this.dialogReplaceEPCConfirmation = false;
            this.address = result.address;
            if (result.warnings == null || result.warnings =="") {
              this.hasWarning = false;
            }
            else {
              this.hasWarning = true;
            }
            this.warnings = result.warnings;
            this.lodgedDate = result.lodgedDate;
            this.sapRating = result.sapRating;

          }
          else{
            this.warnings = data.message;
            this.dialogRetrievalConfirmation = false;
            this.dialogRRNRequest = false;
            this.dialogReplaceEPCConfirmation = false;
            this.dialogUnavailableWarning = true;
          }
          
        }
      ))
  }

  public closeConfirmation() {
    this.dialogRetrievalConfirmation = false;
  }

  public closeReplaceDialog(action: string) {
    if (action == "yes")
    {
      $('.portalwBlur').addClass('ovrlay');
      this.dialogRRNRequest = true;
      this.dialogRetrievalConfirmation = false;
      this.dialogReplaceEPCConfirmation = false;
      setTimeout(() => {
        this.rrnTextbox.focus();
      }, 0);
    }
    else{
      this.closeRetrieveWin(false);
    }

  }


  public returnRetrievedEPC() {
    this.subs.add(
      this.assetAttributeService.returnRetrievedEPC(this.assetId,this.rRNText, this.currentUser.userId).subscribe(
        data => {
          if (data && data.isSuccess) {
            var result = data.data;
            this.closeRetrieveWin(true);


          }
          else{
            this.warnings = data.message;
            this.dialogRetrievalConfirmation = false;
            this.dialogRRNRequest = false;
            this.dialogReplaceEPCConfirmation = false;
            this.dialogUnavailableWarning = false;
            this.dialogError = true;
          }
          
        }
      ))
  }

}