import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { HnsResultsService, AlertService, HelperService } from '../../_services';

@Component({
  selector: 'app-hns-res-edit-document',
  templateUrl: './hns-res-edit-document.component.html',
  styleUrls: ['./hns-res-edit-document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsResEditDocumentComponent implements OnInit {
  subs = new SubSink();
  title: string = "Edit Description...";
  @Input() selectedAction: any;
  @Input() selectedDoc
  @Output() closeEditDoc = new EventEmitter<boolean>();
  @Input() showEditDoc: boolean = false;
  gridData: any = [];
  description: any;

  constructor(
    private hnsResultService: HnsResultsService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.description = this.selectedDoc.description
  }

  closeEditDocMethod() {
    this.showEditDoc = false
    this.closeEditDoc.emit(this.showEditDoc);
  }

  updateDescription() {
    this.subs.add(
      this.hnsResultService.updateDocumentDescription(this.selectedDoc.assid, this.selectedDoc.ntpsequence, this.description).subscribe(
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
