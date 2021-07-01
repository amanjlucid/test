import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WorksOrdersService, HelperService, LoaderService,   WorksorderManagementService } from '../../../../_services';
import { WopmRepCharConfig }  from '../../../../_models';
import { SubSink } from 'subsink';
import { tap, switchMap, debounceTime } from 'rxjs/operators';
import { interval, Subject} from 'rxjs';

@Component({
  selector: 'app-reporting-char',
  templateUrl: './reporting-char.component.html',
  styleUrls: ['./reporting-char.component.css']
})
export class ReportingCharComponent implements OnInit {
  subs = new SubSink();
  repCharForm: FormGroup;
  @Input() repCharModel: WopmRepCharConfig ;
  @Input() repCharWindow: boolean = false;
  @Input() woSequence: number;
  @Input() woName: string;
  @Output() closeRepCharWindow = new EventEmitter<WopmRepCharConfig>();
  chacode1ListData: any = [];
  chacode2ListData: any = [];
  chacode3ListData: any = [];
  chacodeListData: any = [];
  amendedTermSave$ = new Subject<any>();
  submitted = false;
  windowTitle = 'Edit Reporting Characteristics'
  chacodeFilter = '';
  chacodeFilterApplyTo = 0
  charcode1missing = false
  charcode2missing = false
  charcode3missing = false

  constructor(
    private fb: FormBuilder,
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService,
    private loaderService: LoaderService,
    private  worksorderManagementService:  WorksorderManagementService)
     { }

  ngOnInit(): void {
    this.windowTitle = 'Edit Reporting Characteristics: ' + this.woSequence + ' - ' + this.woName;
    this.repCharForm = this.fb.group({
      chacode1: '',
      chacode2: '',
      chacode3: '',
      status1: 'I',
      status2: 'I',
      status3: 'I',
      alias1: '',
      alias2: '',
      alias3: '',
    }
    );
    this.getConfigData(true);

    this.subs.add(
      this.amendedTermSave$
        .pipe(
          debounceTime(1000),
        ).subscribe((val) => {
          this.getConfigData(false);
        })
    );

  }

  keyupevent(dataItem, value) {
    this.chacodeFilterApplyTo = value;
    this.chacodeFilter = dataItem;
    this.amendedTermSave$.next(dataItem);
 }

 changeAlias(value){
  let newAlias = ''
  let chacodeVal = ''
   if(value == 1){

      chacodeVal = this.f.chacode1.value
      this.chacode1ListData.forEach(element => {
        if (element.chacode == chacodeVal) {
          newAlias = element.chaname;
          this.charcode1missing = false;
        }
      });

      if (newAlias.length > 20)
      {
        newAlias = newAlias.substring(0,20)
      }
      this.f.alias1.setValue(newAlias)
   }
   if(value == 2){
    this.chacode2ListData.forEach(element => {
      chacodeVal = this.f.chacode2.value
      if (element.chacode == chacodeVal) {
        newAlias = element.chaname;
        this.charcode2missing = false;
      }
    });

    if (newAlias.length > 20)
    {
      newAlias = newAlias.substring(0,20)
    }
    this.f.alias2.setValue(newAlias)
   }
   if(value == 3){
    this.chacode3ListData.forEach(element => {
      chacodeVal = this.f.chacode3.value
      if (element.chacode == chacodeVal) {
        newAlias = element.chaname;
        this.charcode3missing = false;
      }
    });

    if (newAlias.length > 20)
    {
      newAlias = newAlias.substring(0,20)
    }
    this.f.alias3.setValue(newAlias)
   }
 }

  setTruFalse(val) {
    if (val == "A") {
      return true;
    } else {
      return false;
    }
  }

  get f() { return this.repCharForm.controls; }

  getConfigData(updateForm: boolean) {
    this.subs.add(
      this.worksorderManagementService.getReportingCharConfigData2(this.chacodeFilter).subscribe(
        data => {
          if (data.isSuccess) {
            const res2 = data.data.reportingCharacteristics;
            this.chacodeListData = res2;
            if(this.chacodeFilterApplyTo == 0 || this.chacodeFilterApplyTo == 1 ){
              this.chacode1ListData = res2;
              //this.chRef.detectChanges()
            }
            if(this.chacodeFilterApplyTo == 0 || this.chacodeFilterApplyTo == 2 ){
              this.chacode2ListData = res2;
              //this.chRef.detectChanges()
            }
            if(this.chacodeFilterApplyTo == 0 || this.chacodeFilterApplyTo == 3 ){
              this.chacode3ListData = res2;
              //this.chRef.detectChanges()
            }
            if(updateForm){
              const res = this.repCharModel;
              this.repCharForm.patchValue({
                chacode1: res.chacode1,
                chacode2: res.chacode2,
                chacode3: res.chacode3,
                alias1: res.alias1,
                alias2: res.alias2,
                alias3: res.alias3,
                status1: this.setTruFalse(res.status1),
                status2: this.setTruFalse(res.status2),
                status3: this.setTruFalse(res.status3),
              })
              this.chRef.detectChanges()
            }
            this.chRef.detectChanges()
          }
          else
          {
            this.alertService.error(data.message)
          }
        }
      )
    )
  }

  onSubmit() {
    this.submitted = true;
    this.charcode1missing = false;
    this.charcode1missing = false;
    this.charcode1missing = false;
    let formRawVal = this.repCharForm.getRawValue();
    let errors = false;
    if(formRawVal.status1 == true && formRawVal.chacode1 == '')
    {
      this.charcode1missing = true;
      errors = true;
    }
    if(formRawVal.status2 == true && formRawVal.chacode2 == '')
    {
      this.charcode2missing = true;
      errors = true;
    }
    if(formRawVal.status3 == true && formRawVal.chacode3 == '')
    {
      this.charcode3missing = true;
      errors = true;
    }
    if(errors)
    {
      this.chRef.detectChanges();
      return;
    }

     //Set the repCharModel values and close with emitter
     let CharModel = new WopmRepCharConfig();
     CharModel.wosequence = this.woSequence
     CharModel.status1 = formRawVal.status1? 'A' : 'I';
     CharModel.status2 = formRawVal.status2? 'A' : 'I';
     CharModel.status3 = formRawVal.status3? 'A' : 'I';
     CharModel.chacode1 = formRawVal.chacode1;
     CharModel.chacode2 = formRawVal.chacode2;
     CharModel.chacode3 = formRawVal.chacode3;
     CharModel.alias1 = formRawVal.alias1;
     CharModel.alias2 = formRawVal.alias2;
     CharModel.alias3 = formRawVal.alias3;
     this.repCharModel = CharModel;
     this.closeRepCharWin();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeRepCharWin()
  {
    this.repCharWindow = false;
    this.closeRepCharWindow.emit(this.repCharModel)
  }



}
