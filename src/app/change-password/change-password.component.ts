import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertService, AuthenticationService } from '../_services';
import { MustMatch } from '../_helpers'


declare var $: any;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, AfterContentChecked {

  changePasswordForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = "/dashboard";

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      username: ['', Validators.required],
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', Validators.required]

    }, {
        validator: MustMatch('newPassword', 'confirmPassword')
      }
    );

    
  }

  get f() { return this.changePasswordForm.controls; } // access form controls


  onSubmit() {
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }
    this.loading = true;
    this.authenticationService.changePassword(this.f.username.value, this.f.currentPassword.value, this.f.newPassword.value)
      .subscribe(
        data => {
          if (data.access_token) {
            localStorage.setItem('currentUser', JSON.stringify(data));
            this.router.navigate([this.returnUrl]);
            //this.alertService.success(data.message);
          } else {
            this.loading = false;
            this.alertService.error(data.message);
          }
        },
        error => {
          console.log(error);
          this.alertService.error(error);
          this.loading = false;
        });

  }


  ngAfterContentChecked() {
    $('.sidbarDiv').removeClass('bg-sidenav-theme');
    $('#theme-settings').hide();
  }

}
