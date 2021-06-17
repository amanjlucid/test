import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../_services';



@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html',
    styleUrls: ['./alert.component.css']
})

export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;
    timeout: any;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            this.message = message;
            if (this.message != undefined) {
                if (this.message.type != 'destroy') {
                    this.timeout = setTimeout(() => this.close(), this.message.time);
                } else {
                    // this.close()
                }

            }

        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    close() {
        clearTimeout(this.timeout);
        this.message = "";
    }
}