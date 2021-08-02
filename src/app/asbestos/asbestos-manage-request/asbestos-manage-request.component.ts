import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlertService, SharedService, AsbestosService } from 'src/app/_services';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';

@Component({
  selector: 'app-asbestos-manage-request',
  templateUrl: './asbestos-manage-request.component.html',
  styleUrls: ['./asbestos-manage-request.component.css']
})
export class AsbestosManageRequestComponent implements OnInit {
  @Input() selectedAsbestos: any;
  @Input() selectedAsbestosIndex: any;
  @Input() manageAsbestos: boolean = false;
  @Input() manageAsbestosRequestMode: string;
  @Output() closeMangeRequest = new EventEmitter();
  asbestosRequest: boolean = false;
  asbestosAuth: boolean = false;
  selectedAsset: any;
  public gridView: DataResult;
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  activeRequests: any;
  reqStr: string = 'Requests: 0 Previous Requests, 0 Current Request';
  disableActionBtn: boolean;
  wariningPopup: boolean = false;
  checkAuthNReqUser: boolean = false;
  currentUser: any;
  asbestosPropertySecurityAccess: any;


  constructor(
    private alertService: AlertService,
    private shareData: SharedService,
    private asbestosService: AsbestosService,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.shareData.sharedAsset.subscribe(data => { this.selectedAsset = data });
    this.shareData.asbestosPropertyAccess.subscribe(data => this.asbestosPropertySecurityAccess = data);
    this.getPriorRequest();
    this.shareData.asbestos.subscribe(
      data => {
        if (data) {
          if (this.manageAsbestos) {
            // const selectedAsbestos = data.find(
            //   x => {
            //     if (x.assid == this.selectedAsbestos.assid && x.auccode == this.selectedAsbestos.auccode && x.auctext == this.selectedAsbestos.auctext && x.astconcataddress == this.selectedAsbestos.astconcataddress && x.floor == this.selectedAsbestos.floor && x.audcode == this.selectedAsbestos.audcode && x.position == this.selectedAsbestos.position && JSON.stringify(x.notepadLists) === JSON.stringify(this.selectedAsbestos.notepadLists)) {
            //       return x
            //     }
            //   }
            // )
            //this.selectedAsbestos = selectedAsbestos;
            data.find((v, x) => {
              if (x == this.selectedAsbestosIndex) {
                this.selectedAsbestos = v;
              }
            })
          }
        }
      }
    )

  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.activeRequests, this.state);
  }

  closeManageAsbestosRequestWin() {
    this.manageAsbestos = false;
    this.closeMangeRequest.emit(this.manageAsbestos)
  }

  openAsbestosRequestPopup() {
    if (this.containsAll(['Management Request'], this.asbestosPropertySecurityAccess)) {
      $('.manageAsbestosReq').addClass('ovrlay');
      this.asbestosRequest = true;
    } else {
      this.alertService.error('You have no permission.')
    }



    // if (this.selectedAsbestos != undefined) {
    //   if (this.selectedAsbestos.aaudreqstatus != 'H') {
    //     $('.manageAsbestosReq').addClass('ovrlay');
    //     this.asbestosRequest = true;
    //   } else {
    //     // this.asbestosStatusWarning = true;
    //     $('.manageAsbestosReq').addClass('ovrlay');
    //   }
    // } else {
    //   this.alertService.error("Please select one asbestos record");
    // }
  }

  closeAsbestosRequest($event) {
    $('.manageAsbestosReq').removeClass('ovrlay');
    this.asbestosRequest = $event;
    this.getPriorRequest();
  }

  openAsbestosAuthPopup() {
    if (this.containsAll(['Management Authorise'], this.asbestosPropertySecurityAccess)) {
      if (!this.disableActionBtn) {
        $('.manageAsbestosReq').addClass('ovrlay');
        this.wariningPopup = true;
      } else {
        $('.manageAsbestosReq').addClass('ovrlay');
        this.asbestosAuth = true;
      }
    } else {
      this.alertService.error("You have no permission.");
    }


    // if (this.selectedAsbestos != undefined) {
    //   $('.manageAsbestosReq').addClass('ovrlay');
    //   this.asbestosAuth = true;
    // } else {
    //   this.alertService.error("Please select one asbestos record");
    // }
  }

  closerWarningPopup(val = null) {
    this.wariningPopup = false;
    $('.manageAsbestosReq').removeClass('ovrlay');
  }

  closeAsbestosAuth($event) {
    $('.manageAsbestosReq').removeClass('ovrlay');
    this.asbestosAuth = $event;
    this.getPriorRequest();
  }

  getColor(str) {
    if (str == "Low" || str == "Very Low") {
      return 'blue';
    } else if (str == "High" || str == "Medium") {
      return "red";
    }
    return 'blue';
  }

  getPriorRequest() {
    const asbestosAttachmentModel = {
      ASSID: encodeURIComponent(this.selectedAsbestos.assid),
      AUCCODE: this.selectedAsbestos.auccode,
      AUDCODE: this.selectedAsbestos.audcode,
      ASASSEQUENCE: this.selectedAsbestos.asassequence,
      AAUSEQUENCE: this.selectedAsbestos.aausequence,
    }
    this.subs.add(
      this.asbestosService.getPriorRequestsForACM(asbestosAttachmentModel).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.activeRequests = data.data;
            this.gridView = process(this.activeRequests, this.state)
            let asbestos = this.activeRequests;
            let temObj = [];

            if (asbestos) {
              asbestos = asbestos.filter(x => {
                if (x.aaudreqstatusname == "Pending" || x.aaudreqstatusname == "Held") {
                  temObj.push(x);
                }
              });

              if (temObj.length != undefined) {
                if (temObj.length > 0) {
                  if (temObj[0].requestUserId == this.currentUser.userId) {
                    this.checkAuthNReqUser = true;
                  } else {
                    this.checkAuthNReqUser = false;
                  }
                  this.disableActionBtn = true;
                } else {
                  this.disableActionBtn = false;

                }


                this.reqStr = `Requests: ${this.activeRequests.length - temObj.length} Previous Requests, ${temObj.length} Current Request`
              } else {
                this.reqStr = `Requests: ${this.activeRequests.length} Previous Requests`;
              }
            }
          }

        }
      )
    )
  }


  checkAsbestosPropAccess(btnType) {
    // if (this.currentUser.admin == "Y") {
    //   return false;
    // }
    //console.log(this.asbestosPropertySecurityAccess)
    // if (this.asbestosPropertySecurityAccess == undefined) {
    //   return true;
    // }

    // if (btnType == 'new request') {
    //   if (this.asbestosPropertySecurityAccess.accessLevel == "A") {
    //     return true
    //   } else {
    //     return false
    //   }
    // } else if (btnType == 'edit') {
    //   if (this.asbestosPropertySecurityAccess.accessLevel != "E") {
    //     return true
    //   } else {
    //     return false
    //   }

    // } else if (btnType == 'auth') {
    //   if (this.asbestosPropertySecurityAccess.accessLevel != "A") {
    //     return true
    //   } else {
    //     return false
    //   }
    // }

    if (!this.containsAll(['Management Request'], this.asbestosPropertySecurityAccess) && !this.containsAll(['Management Authorise'], this.asbestosPropertySecurityAccess)) {
      return true
    }

    if (btnType == 'new request' || btnType == 'edit') {
      if (!this.containsAll(['Management Request'], this.asbestosPropertySecurityAccess)) {
        return true
      } else {
        return false
      }

    } else if (btnType == 'auth') {
      if (!this.containsAll(['Management Authorise'], this.asbestosPropertySecurityAccess)) {
        return true
      } else {
        return false
      }
    }

  }

  containsAll(needles, haystack) {
    for (var i = 0, len = needles.length; i < len; i++) {
      if ($.inArray(needles[i], haystack) == -1) return false;
    }
    return true;
  }




}
