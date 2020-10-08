import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetAttributeService, LoaderService, HelperService, SharedService } from '../../_services'
import { SubSink } from 'subsink';

@Component({
  selector: 'app-service-servicing-detail',
  templateUrl: './service-servicing-detail.component.html',
  styleUrls: ['./service-servicing-detail.component.css']
})
export class ServiceServicingDetailComponent implements OnInit {

  @Input() serviceServicingDetailWindow: boolean = false;
  @Output() closeServiceServicingDetailWindow = new EventEmitter<boolean>();
  @Input() selectedAsset;
  @Input() selectedAttribute;
  servicingDetails;
  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '15';
  public windowLeft = 'auto';
  public windowState = 'default'; //maximized
  readonly = true;
  tabName: string = "";
  subs = new SubSink();
  hideCloseBtn: boolean = true;
  servicePortalAccess: any = [];

  constructor(
    private assetAttributeService: AssetAttributeService,
    private loaderService: LoaderService,
    public helper: HelperService,
    private sharedServie: SharedService,

  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.getAssetAttributeServicingDetail();
    }, 200);

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public showTab(tabName: string) {
    this.tabName = tabName;
    if (tabName == "serviceinfo" || tabName == "servicenotepads" || tabName == "serviceattribute") {
      this.hideCloseBtn = false;
    } else {
      this.hideCloseBtn = true;
    }
  }

  closeServiceDetailsWin($event) {
    this.closeServicingDetailWin();
  }

  closeServicingDetailWin() {
    this.serviceServicingDetailWindow = false;
    this.closeServiceServicingDetailWindow.emit(this.serviceServicingDetailWindow)
  }

  getAssetAttributeServicingDetail() {
    let ataid = (this.selectedAttribute.ataId == undefined) ? this.selectedAttribute.ataid : this.selectedAttribute.ataId
    this.subs.add(
      this.assetAttributeService.getAssetAttributeServicingDetail(this.selectedAsset.assetId, ataid, this.selectedAttribute.job_Number).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.servicingDetails = data.data;
            this.subs.add(
              this.sharedServie.servicePortalObs.subscribe(
                data => {
                  this.servicePortalAccess = data;
                  if (this.servicePortalAccess.length > 0) {
                    const tabArr = ["Service Details Tab", "Service Attribute Tab", "Service History Tab", "Service Info Tab", "Service Notepads Tab", "Resident Contacts Tab"];
                    for (let tab of tabArr) {
                      if (this.servicePortalAccess.includes(tab)) {
                        switch (tab) {
                          case "Service Details Tab":
                            this.tabName = "servicedetail";
                            break;
                          case "Service Attribute Tab":
                            this.tabName = "serviceattribute";
                            break;
                          case "Service History Tab":
                            this.tabName = "servicehistory";
                            break;
                          case "Service Info Tab":
                            this.tabName = "serviceinfo";
                            break;
                          case "Service Notepads Tab":
                            this.tabName = "servicenotepads";
                            break;
                          case "Resident Contacts Tab":
                            this.tabName = "residentcontacts";
                            break;
                          default:
                            this.tabName = "servicedetail";
                        }
                        break;
                      }
                    }
                  }
                })
            )
          }
        }
      )
    )

  }

  printDiv() {
    var divToPrint = $('#print-section').html();
    var newWin = window.open('', 'Print-Window');
    newWin.document.open();
    newWin.document.write('<html><head><style>p{min-height:32px; height:38px; padding:0px; font-size:10px; word-wrap: break-word;} .input-sm{word-wrap:break-word!important; font-size:10px;}#print-section .input-sm{background-color: #f1f1f2;}</style></head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"><link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet"><body onload="window.print()">' + divToPrint + '</body></html>');
    newWin.document.close();
    setTimeout(function () { newWin.close(); }, 10);
  }



}
