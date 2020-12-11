import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { AlertService, SharedService } from '../_services';

@Component({
  selector: 'app-event-manager',
  templateUrl: './event-manager.component.html',
  styleUrls: ['./event-manager.component.css']
})
export class EventManagerComponent implements OnInit {
  subs = new SubSink();

  constructor(
    private sharedService: SharedService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    
    // this.subs.add(
    //   this.sharedService.modulePermission.subscribe(
    //     data => {
    //       console.log(data);
    //       if (data.indexOf("Manage Event Types") == -1) {
    //         //this.router.navigate(['/dashboard']);
    //       }
    //     }
    //   )
    // )
  }

}
