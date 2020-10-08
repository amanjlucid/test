import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { HelperService, ServicePortalService, AlertService } from '../../_services'
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-service-service-info-edit',
  templateUrl: './service-service-info-edit.component.html',
  styleUrls: ['./service-service-info-edit.component.css']
})
export class ServiceServiceInfoEditComponent implements OnInit {
  subs = new SubSink();
  @Input() servicingDetails: any;
  @Input() openAddEditInfo: boolean;
  @Input() selectedServiceInfo: any;
  @Output() closeAddEditInfo = new EventEmitter<boolean>();
  readonly: boolean = true;
  serviceInfoEditResult: any;
  currentUser: any;
  fixedConditionDrpDwn: any;

  constructor(
    private servicePortalService: ServicePortalService,
    private alertService: AlertService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const serviceInfoEditParam = {
      Assid: this.servicingDetails.assid,
      Service_Type_Code: this.servicingDetails.service_Type_Code,
      ServiceInfoCode: this.selectedServiceInfo.service_Info
    }
    this.getServiceInfoEditData(serviceInfoEditParam);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeAddEditInfoMethod() {
    this.openAddEditInfo = false;
    this.closeAddEditInfo.emit(this.openAddEditInfo);
  }

  getServiceInfoEditData(params) {
    this.subs.add(
      this.servicePortalService.GetVWSimPortalServiceInfoEditItem(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.serviceInfoEditResult = data.data[0];
            if (this.serviceInfoEditResult.chaType == 'F') {
              this.serviceInfoEditResult.value = '';
              this.fixedConditionDrpDwn = data.data.map(x => x.chcText);
            }
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  submitForm(form: NgForm) {
    let formValues = {
      Assid: this.servicingDetails.assid,
      Service_Type_Code: this.servicingDetails.service_Type_Code,
      ServiceInfoCode: this.selectedServiceInfo.service_Info,
      Value: this.serviceInfoEditResult.value,
      Notes: this.serviceInfoEditResult.notes,
      Status: this.serviceInfoEditResult.status,
      Userid: this.currentUser.userId,
    }
    this.subs.add(
      this.servicePortalService.AddorEditServiceJobInfo(formValues).subscribe(
        data => {
          if (data.isSuccess) {
            this.closeAddEditInfoMethod()
          } else {
            this.alertService.error(data.message)
          }
        }
      )
    )
  }

  isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

}
