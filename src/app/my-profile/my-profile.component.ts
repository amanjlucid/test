import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../_helpers'
import { AlertService, AuthenticationService } from '../_services';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  currentUser;
  myProfileForm: FormGroup;
  loading = false;
  submitted = false;
  validationMessage = {
    // 'username': {
    //   'required': 'Username is required.'
    // },
    'newPassword': {
      'required': 'New Password is required.',
      'minlength': 'New Password must be minimum 6 characters.',
     
    },
    'confirmPassword': {
      'required': 'Confirm Password is required.',
      'mustMatch': 'New Password and Confirm Password must match.'
    }

  };

  formErrors:any;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
    ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.myProfileForm = this.fb.group({
      //username: ['', Validators.required],
      newPassword: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['',Validators.required]
    }, {
        validator: MustMatch('newPassword', 'confirmPassword')
      }
    );

    // this.myProfileForm.valueChanges.subscribe((data) => {
    //   this.logValidationErrors(this.myProfileForm);
    // })
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          const messages = this.validationMessage[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    })
  }

  formErrorObject() {
    this.formErrors = {
      //'username': '',
      'newPassword': '',
      'confirmPassword': ''
    }
  }

  get f() { return this.myProfileForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.myProfileForm);
    
    if (this.myProfileForm.invalid) {
      return;
    }

    
    this.loading = true;
    this.authenticationService.updateProfile(this.currentUser.userId,this.f.newPassword.value)
      .subscribe(
        data => {
          if (data.data == "VALID") {
            this.myProfileForm.reset();
            this.alertService.success("Password changed successfully.");
            this.loading = false;
          } else {
            this.loading = false;
            this.alertService.error(data.message);
          }
        },
        error => {
          //console.log(error);
          this.alertService.error(error);
          this.loading = false;
        });

  }

}
