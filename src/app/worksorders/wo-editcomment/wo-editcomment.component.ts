import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { AlertService, SharedService,ConfirmationDialogService, WorksorderManagementService } from '../../_services';

@Component({
  selector: 'app-wo-editcomment',
  templateUrl: './wo-editcomment.component.html',
  styleUrls: ['./wo-editcomment.component.css']
})
export class WoEditcommentComponent implements OnInit {
  @Input() showEditCommentWindow;
  @Input() selectedRecord;
  @Input() checklistParms;
  @Input() type;
  @Input() mode;
  @Output() closeEditCommentWindow = new EventEmitter<string>();
  title : string = "Edit Comment";
  subtitle: string = "";
  comment: string = "";
  currentUser : any;
  saved: boolean = false;
  Header: string = "Asset";

  constructor(
    private worksOrderService : WorksorderManagementService,
    private alertService: AlertService,
    private sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.type == "Asset") {
      this.title = "Edit Comment for Works Order Asset";
      this.subtitle = this.selectedRecord.woname;
      this.comment = this.selectedRecord.comment;
    }

    if (this.type == "AssetChecklist") {
      this.title = "Edit Comment for Works Order Asset Checklist";
      this.subtitle = this.checklistParms.subtitle;
      this.comment ="";
      if (this.checklistParms.phase) {
        this.Header = "Phase";
        this.subtitle += "  (Multiple selection)"
      }
    }
  
  }

  saveComment() {
    if (this.type == "Asset") {
      const updateParm = {
        wosequence : this.selectedRecord.wosequence,
        wopsequence : this.selectedRecord.wopsequence,
        assid : this.selectedRecord.assid,    
        comment : this.comment,
        user : this.currentUser.userId,  
      }
      
      this.worksOrderService.updateWOAssetComment(updateParm).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.alertService.success("Asset comment updated successfully.");
            this.saved = true;
            this.closeWindow()
          } else {
            this.alertService.error(data.message);
          }
        },
        error => {
          this.alertService.error(error);
        }
      )
    }

    if (this.type == "AssetChecklist") {
      const updateParm = {
        updatetype : this.mode,
        wosequence : this.checklistParms.wosequence,
        wopsequence : this.checklistParms.wopsequence,
        checklistcsv : this.checklistParms.csvKeys,    
        comment : this.comment,
        user : this.currentUser.userId,  
      }
      
      this.worksOrderService.updateWOAssetChecklistComment(updateParm).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.alertService.success(data.message);
            this.saved = true;
            this.closeWindow()
          } else {
            this.alertService.error(data.message);
          }
        },
        error => {
          this.alertService.error(error);
        }
      )
    }


  }

  public closeWindow() {
    this.showEditCommentWindow = false;
    let comment = "";
    if (this.saved)
    {
      comment = this.comment;
      this.closeEditCommentWindow.emit(comment)
    } else {
      this.closeEditCommentWindow.emit(null)
    }

  }
}
