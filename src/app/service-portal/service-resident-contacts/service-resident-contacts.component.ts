import { Component, OnInit, Input } from '@angular/core';
import { SubSink } from 'subsink';
import { ServicePortalService, AlertService, LoaderService } from '../../_services'

@Component({
  selector: 'app-service-resident-contacts',
  templateUrl: './service-resident-contacts.component.html',
  styleUrls: ['./service-resident-contacts.component.css']
})
export class ServiceResidentContactsComponent implements OnInit {
  @Input() servicingDetails: any;
  readonly: boolean = true;
  subs = new SubSink();
  residentContact: any;

  constructor(
    private servicePortalService: ServicePortalService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getResidentContacts(this.servicingDetails.assid);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getResidentContacts(assid: string) {
    this.subs.add(
      this.servicePortalService.GetAssetResidentDetails(assid).subscribe(
        data => {
          if (data.isSuccess) {
            this.residentContact = data.data[0]
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


}
