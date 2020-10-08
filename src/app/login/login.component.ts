import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService, AuthenticationService, LoaderService } from '../_services';
import { SubSink } from 'subsink';
declare var $: any;


@Component({
    moduleId: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, AfterContentChecked {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    subs = new SubSink(); // to unsubscribe services

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private loaderService: LoaderService

    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    }


    get f() { return this.loginForm.controls; } // access form controls

    onSubmit() {
        this.submitted = true;
        if (this.loginForm.invalid) {
            return;
        }
        this.loaderService.show();
        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    if (data && data.access_token) {
                        this.RefreshUserProperties(data.userId)
                        // this.router.navigate([this.returnUrl]);
                    } else if (data.isSuccess && data.data == "WRONGPASS") {
                        this.alertService.error(data.message);
                        this.loading = false;
                    } else {
                        this.loading = false;
                        if (data.data == "EXPIRED") {
                            this.router.navigate(['/change-password']);
                            this.alertService.error(data.message);
                        }
                    }
                },
                error => {
                    this.loaderService.hide();
                    this.alertService.error(error);
                    this.loading = false;

                });

    }


    // Hide theme setting button
    ngAfterContentChecked() {
        $('#theme-settings').hide();
    }

    RefreshUserProperties(userid) {
        this.subs.add(
            this.authenticationService.refresUserProp("AssetPortal", userid).subscribe(
                data => {
                    if (data.isSuccess) {
                        this.router.navigate([this.returnUrl]);
                    }
                }
            )
        )
    }

}