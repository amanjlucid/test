import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, WorksorderManagementService } from '../../_services';

@Component({
  selector: 'app-worksorders-asset-checklist-edit-description',
  templateUrl: './worksorders-asset-checklist-edit-description.component.html',
  styleUrls: ['./worksorders-asset-checklist-edit-description.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAssetChecklistEditDescriptionComponent implements OnInit {

  subs = new SubSink();
  title: string = "Edit Description";
  @Input() selectedChecklist: any;
  @Input() selectedDoc
  @Output() closeEditDoc = new EventEmitter<boolean>();
  @Input() showEditDoc: boolean = false;
  gridData: any = [];
  description: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  @Input() editDesFor = 'assetchecklist'
  @Input() worksOrder: any;

  constructor(
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    /**
     * This component is user for edit asset checklist document description 
     * and edit workorder document description
     */
    this.description = this.selectedDoc.description
  }

  closeEditDocMethod() {
    this.showEditDoc = false
    this.closeEditDoc.emit(this.showEditDoc);
  }

  updateDescription() {
    let apiCall: any;

    if (this.editDesFor == "wo") {
      //update doc description for WO
      const { wosequence } = this.worksOrder;
      const { ntpsequence } = this.selectedDoc;
      apiCall = this.worksorderManagementService.updateWorksOrderDocument(wosequence, ntpsequence, this.description, this.currentUser.userId)
    } else {
      //update doc description for asset checklist
      const checklistdata = this.selectedChecklist;
      let params = {
        WOSEQUENCE: checklistdata.wosequence,
        ASSID: checklistdata.assid,
        WOPSEQUENCE: checklistdata.wopsequence,
        CHECKSURCDE: checklistdata.wochecksurcde,
        NTPSEQUENCE: this.selectedDoc.ntpsequence,
        NEWDESCRIPTION: this.description,
        UserId: this.currentUser.userId
      }

      apiCall = this.worksorderManagementService.updateWorksOrderAssetChecklistDocument(params)

    }

    this.subs.add(
      apiCall.subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Description updated successfully.")
            this.closeEditDocMethod()
          } else {
            this.alertService.error(data.message)
          }
        }
      )

    )


  }

}
