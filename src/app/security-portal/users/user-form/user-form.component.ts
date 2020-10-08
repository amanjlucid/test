import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, UserService } from '../../../_services';
import { CustomValidators } from '../../../_helpers/custom.validator'
import { User } from '../../../_models'
declare var $: any;
import * as moment from 'moment';



@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  userForm: FormGroup;
  @Input() userFormWindow: boolean = false
  @Input() selectedUser: User
  @Input() userFormType: any
  @Output() closeUserFormWin = new EventEmitter<boolean>();
  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '45';
  public windowLeft = 'auto';
  contractorList: any;
  loading = false;
  submitted = false;
  public windowTitle: string;
  saveMsg: string;
  currentUser;
  readInput: boolean
  validationMessage = {
    'user': {
      'required': 'User is required.',
      'maxlength': 'User must be maximum 20 characters.',
      'strinUpperCase': 'User must be uppercase'
    },
    'name': {
      'required': 'Name is required.',
      'maxlength': 'New Password must be maximum 50 characters.',
    },
    'loginType': {
      'required': 'Login type is required.',
    },
    'userType': {
      'required': 'User type is required.',
    },
    'password': {
      'required': 'Password is required.',
      'maxlength': 'Password must be maximum 10 characters.',
    },
    'contractor': {
      'required': 'Contractor is required.',
    },
    'loginAllowed': {
      'required': 'Login allowed is required.',
    },
    'administratorsRight': {
      'required': 'Administrator is required.',

    },
    'passwordDuration': {
      'required': 'Password duration is required.',
      'pattern': 'Password duration must be numeric.',
      'maxlength': 'Password duration must be maximum 10 characters.',
    },
    'lastChargeDate': {
      'required': 'Last charge date is required.',

    },
    'maxLoginAttempt': {
      'required': 'Max login attempt is required.',
      'pattern': 'Max login attempt must be numeric.',
      'maxlength': 'Max login attempt must be maximum 9999 characters.',
    },
    'email': {
      'required': 'Email is required.',
    },
    'dea': {
      'required': 'DEA is required.',
    },
    'accreditationNumber': {
      'required': 'Accreditation number is required.',
      'maxlength': 'Accreditation Number must be maximum 255 characters.',
    },
    'deaPassword': {
      'required': 'DEA password is required.',
      'maxlength': 'DEA Password must be maximum 35 characters.',
    },
    'status': {
      'required': 'Status is required.',
    }

  };
  formErrors: any;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService
  ) { }


  ngOnInit() {
    //  console.log(this.userFormType)
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getContractor();
    this.userForm = this.fb.group({
      user: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      loginType: ['', Validators.required],
      userType: ['', Validators.required],
      password: [''],
      contractor: [''],
      loginAllowed: ['', Validators.required],
      administratorsRight: [''],
      passwordDuration: [''],
      lastChargeDate: [''],
      maxLoginAttempt: [''],
      email: ['', [Validators.maxLength(255)]],
      dea: ['', Validators.required],
      accreditationNumber: [''],
      deaPassword: [''],
      status: ['']

    })

    if (this.userFormType == "new") {
      this.readInput = false;
      this.saveMsg = "User created successfully."
      this.windowTitle = "Create User";
    } else if (this.userFormType == "edit") {
      this.readInput = true
      this.windowTitle = "Edit User";
      this.saveMsg = "User updated successfully."
    }

    this.formControlValueChanged();
    this.populateUser(this.selectedUser);

  }


  formControlValueChanged() {
    const passwordControl = this.userForm.get('password');
    const passwordDurationControl = this.userForm.get('passwordDuration');
    const maxLoginAttemptControl = this.userForm.get('maxLoginAttempt');
    this.userForm.get('loginType').valueChanges.subscribe(
      (mode: string) => {
        if (mode === 'S') {
          passwordControl.setValidators([Validators.required, Validators.maxLength(10)]);
          passwordDurationControl.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(9999)]);
          maxLoginAttemptControl.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(9999)]);
        }
        else {
          passwordControl.clearValidators();
          passwordDurationControl.clearValidators();
          maxLoginAttemptControl.clearValidators();
        }
        passwordControl.updateValueAndValidity();
        passwordDurationControl.updateValueAndValidity();
        maxLoginAttemptControl.updateValueAndValidity();
      });

    const contractorControl = this.userForm.get('contractor');

    this.userForm.get('userType').valueChanges.subscribe(
      (mode: string) => {
        if (mode === 'E') {
          $('#contractorDiv').show();
          contractorControl.setValidators([Validators.required, Validators.maxLength(10)]);
        }
        else {
          $('#contractorDiv').hide();
          contractorControl.clearValidators();
        }
        contractorControl.updateValueAndValidity();
      });


    const accreditationNumberControl = this.userForm.get('accreditationNumber');
    const deaPasswordControl = this.userForm.get('deaPassword');
    this.userForm.get('dea').valueChanges.subscribe(
      (mode: any) => {
        if (mode === true) {
          accreditationNumberControl.setValidators([Validators.required, Validators.maxLength(255)]);
          deaPasswordControl.setValidators([Validators.required, Validators.maxLength(35)]);
        } else {
          accreditationNumberControl.clearValidators();
          deaPasswordControl.clearValidators();
        }
        accreditationNumberControl.updateValueAndValidity();
        deaPasswordControl.updateValueAndValidity();
      });

  }



  populateUser(user: User = null) {
    //console.log(this.selectedUser);
    return this.userForm.patchValue({
      user: (this.userFormType == "new") ? '' : user.userId,
      name: (this.userFormType == "new") ? '' : user.userName,
      loginType: (this.userFormType == "new") ? 'S' : (user.loginType == "Standard") ? "S" : "A",
      userType: (this.userFormType == "new") ? 'E' : (user.userType == "Internal") ? "I" : "E",
      password: (this.userFormType == "new") ? '' : user.password,
      contractor: (this.userFormType == "new") ? '' : user.concode,
      loginAllowed: (this.userFormType == "new") ? 'Y' : user.logAllowed == "Change Password" ? "C" : user.logAllowed == "Yes" ? "Y" : "N",
      administratorsRight: (this.userFormType == "new") ? false : user.admin == "Yes" ? true : false,
      passwordDuration: (this.userFormType == "new") ? '' : user.passwordExpiry,
      lastChargeDate: (this.userFormType == "new") ? '' : this.convertDate(user.lastChangedDate, "DD-MMM-YYYY"),
      maxLoginAttempt: (this.userFormType == "new") ? '' : user.maxLogin,
      email: (this.userFormType == "new") ? '' : user.email,
      dea: (this.userFormType == "new") ? false : user.deaEnabled == "Yes" ? true : false,
      accreditationNumber: (this.userFormType == "new") ? '' : user.deaNumber,
      deaPassword: (this.userFormType == "new") ? '' : user.deaPassword,
      status: (this.userFormType == "new") ? true : user.status == "Active" ? true : false,
    })
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
              //console.log(this.formErrors[key]);
            }
          }
        }
      }
    })

  }

  formErrorObject() {
    this.formErrors = {
      'user': '',
      'name': '',
      'loginType': '',
      'userType': '',
      'password': '',
      'contractor': '',
      'loginAllowed': '',
      'administratorsRight': '',
      'passwordDuration': '',
      'lastChargeDate': '',
      'maxLoginAttempt': '',
      'email': '',
      'dea': '',
      'accreditationNumber': '',
      'deaPassword': '',
      'status': ''
    }
  }

  get f() { return this.userForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.userForm);

    if (this.userForm.invalid) {
      return;
    }

    const user = {
      UserId: this.f.user.value,
      UserName: this.f.name.value,
      LoginType: this.f.loginType.value,
      UserType: this.f.userType.value,
      Password: this.f.password.value,
      Contractor: this.f.contractor.value,
      LogAllowed: this.f.loginAllowed.value,
      Admin: this.f.administratorsRight.value,
      PasswordExpiry: this.f.passwordDuration.value,
      lastChangedDate: this.f.lastChargeDate.value,
      MaxLogin: this.f.maxLoginAttempt.value,
      Email: this.f.email.value,
      DEAEnabled: this.f.dea.value,
      DEANumber: this.f.accreditationNumber.value,
      DEAPassword: this.f.deaPassword.value,
      Status: this.f.status.value,
      LoggedInUserId: this.currentUser.userId,
      CONCODE: this.f.contractor.value,
      IsEdit: this.userFormType == "new" ? false : true
    }

    //console.log(user);
    this.loading = true;
    this.userService.manageUser(user)
      .subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            this.userForm.reset();
            this.alertService.success(this.saveMsg);
            this.loading = false;
            this.closeUserFormWindow();
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


  getContractor() {
    this.userService.getContractors().subscribe(
      (data) => {
        // console.log(data)
        this.contractorList = data.data;
      },
      error => {
        //console.log(error);
        this.alertService.error(error);

      }
    )
  }

  refreshForm() {
    // let user:User;
    // this.userFormType = "new";
    // this.populateUser(user);
    this.userForm.reset();
  }

  closeUserFormWindow() {
    this.userFormWindow = false;
    this.closeUserFormWin.emit(this.userFormWindow)
  }

  convertDate(d, f) {
    var momentDate = moment(d);
    if (!momentDate.isValid()) return d;
    return momentDate.format(f);
  }





}
