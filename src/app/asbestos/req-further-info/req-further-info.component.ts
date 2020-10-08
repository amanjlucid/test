import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { AsbestosService, AlertService } from 'src/app/_services';

@Component({
  selector: 'app-req-further-info',
  templateUrl: './req-further-info.component.html',
  styleUrls: ['./req-further-info.component.css']
})
export class ReqFurtherInfoComponent implements OnInit {
  @Input() requestFurtherinf: boolean = false;
  @Input() selectedAsset: any;
  @Output() closeRequestFurtherInf = new EventEmitter();
  subs = new SubSink();
  formErrors: any;
  validationMessage = {
    'furtherInf': {
      'required': 'Information is required.',
    },
  };
  requestFurtherInfoForm: FormGroup;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private asbestosService: AsbestosService,
    private alertService: AlertService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.requestFurtherInfoForm = this.fb.group({
      furtherInf: ['', [Validators.required]],
    })
  }

  closeReqFurtherInf() {
    this.requestFurtherinf = false;
    this.closeRequestFurtherInf.emit(this.requestFurtherinf);
  }

  onSubmit() {
    const formVal = this.requestFurtherInfoForm.get('furtherInf').value;
    const furtherInfo = {
      Assid: this.selectedAsset.assetId,
      LocationId: ' ',
      MPUSID: this.currentUser.userId,
      RequestInfo: formVal
    }
    this.subs.add(
      this.asbestosService.SendFurtherInfoRequestEmail(furtherInfo).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.closeReqFurtherInf();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

  }

}
