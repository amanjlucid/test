import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HelperService, LoaderService, SharedService } from '../../_services'

@Component({
  selector: 'app-print-acm',
  templateUrl: './print-acm.component.html',
  styleUrls: ['./print-acm.component.css']
})
export class PrintAcmComponent implements OnInit {
  @Input() printAcm: boolean = false;
  @Input() selectedAsbestos: any;
  @Output() closePrintAcm = new EventEmitter();
  public windowState = 'maximize';
  asbestosData: any;

  constructor(
    public helperService: HelperService,
    public loaderService: LoaderService,
    public shareData: SharedService
  ) {

  }

  ngOnInit() {
   
    this.loaderService.show()
    this.shareData.asbestos.subscribe(
      data => {
        this.asbestosData = data;
        if (this.printAcm) {
          let comp = this
          setTimeout(function () {
            comp.loaderService.hide()
            comp.printpage();
          }, 1000);
        }
      }
    )

  }

  closePrintAcmWin() {
    this.printAcm = false;
    this.closePrintAcm.emit(this.printAcm);
  }

  getColor(str) {
    if (str == "Low" || str == "Very Low") {
      return 'blue';
    } else if (str == "High" || str == "Medium") {
      return "red";
    }
    return 'blue';
  }

  printpage() {
    let comp = this
    var divToPrint = $('#print-area').html();
    var newWin = window.open('', 'Print-Window');
    newWin.document.open();
    newWin.document.write('<html><head><style>.asbestosDetailsDivP{font-size:10x; border: 2px solid #cccccc; background-color:  #fcfcfc; word-wrap: break-word; -webkit-print-color-adjust: exact; padding:15px;} .detailDivp{border: 1px solid #cccccc; -webkit-print-color-adjust: exact;  background-color: #d7d7d7; font-weight: 800; padding: 2px; word-wrap: break-word;} .fulldetailDivp span{ font-weight: 600; word-wrap: break-word;}@media print {footer {page-break-after: always;}}</style></head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"><link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet"><body onload="window.print()">' + divToPrint + '</body></html>');
    newWin.document.close();
    comp.closePrintAcmWin();
    setTimeout(function () { newWin.close(); }, 1500);


  }

}
