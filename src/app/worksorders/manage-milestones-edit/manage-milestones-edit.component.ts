import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { WorksOrdersService, AlertService, HelperService, LoaderService, ConfirmationDialogService } from '../../_services'

@Component({
  selector: 'app-manage-milestones-edit',
  templateUrl: './manage-milestones-edit.component.html',
  styleUrls: ['./manage-milestones-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ManageMilestonesEditComponent implements OnInit {
  @Input() singleMilestone: any;
  @Input() woClientUserList: any;
  @Output() closeMilestoneEditEvent = new EventEmitter<boolean>();

  @Input() openMilestoneEdit : boolean = false;

  subs = new SubSink(); // to unsubscribe services
  title = 'Edit Milestone';
  milestoneForm : FormGroup;
  worksOrderData: any;

  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private worksOrdersService: WorksOrdersService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    //console.log(this.singleMilestone);
    //console.log(this.currentUser);
    //this.resUserVal = this.singleMilestone.woresponsibleuser;
    //this.attReqVal = this.singleMilestone.wocheckspeciaL2;

    this.milestoneForm = this.fb.group({
      resUserVal: [this.singleMilestone.woresponsibleuser],
      attReqVal: [this.singleMilestone.wocheckspeciaL2.trim()]
    });

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeMilestoneEdit(){
    this.openMilestoneEdit = false;
    this.closeMilestoneEditEvent.emit(this.openMilestoneEdit);
  }
  
  onSubmit(){
    const formValue = this.milestoneForm.value;
    let params = {
      wosequence: this.singleMilestone.wosequence,
      wochecksurcde: this.singleMilestone.wochecksurcde,
      wocheckspecial2: formValue.attReqVal.trim(),
      worespuser: formValue.resUserVal,
      strUserId: this.currentUser.userId
    }
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', "Are you sure you want to update the Milestone '"+this.singleMilestone.wocheckname+"'")
    .then((confirmed) => {
      if(confirmed){
        this.subs.add(
          this.worksOrdersService.updateWorksOrderMilestone(params).subscribe(
          data => {
            if (data.isSuccess) {
              this.closeMilestoneEdit();
              this.alertService.success([...data.data][0].pRETURNMESSAGE);          
            } else this.alertService.error(data.message);
            this.chRef.detectChanges();
          }, err => this.alertService.error(err)
        )
      )
      }
    })
    .catch(() => console.log('Attribute dismissed the dialog.'));
    
  }
  

}
