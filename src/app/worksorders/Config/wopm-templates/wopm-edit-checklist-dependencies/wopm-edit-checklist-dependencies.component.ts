import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { WopmConfigurationService, HelperService, AlertService, SharedService } from '../../../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../../../_pipes/date-format.pipe';
import { WopmTemplateModel, WopmChecklistMasterModel, WopmChecklistDependencyModel} from '../../../../_models'

@Component({
  selector: 'app-wopm-edit-checklist-dependencies',
  templateUrl: './wopm-edit-checklist-dependencies.component.html',
  styleUrls: ['./wopm-edit-checklist-dependencies.component.css']
})
export class WopmEditChecklistDependenciesComponent implements OnInit {
  @Input() dependenciesWindow: boolean = false;
  @Input() wopmTemplateModel: WopmTemplateModel;
  @Input() wotname: string;
  @Output() closedependenciesWindow = new EventEmitter<boolean>();
  public selectedRows: any[] = [];
  wopmPortalAccess = [];
  subs = new SubSink(); // to unsubscribe services
  checklistTableData;
  loading: boolean = true;
  loading2: boolean = true;
  public mySelection: number[] = [];
  public gridView: DataResult;
  pageSize = 25;
  currentRow: any;
  currentUser;
  public predecessors: any;
  public allPredecessors: any;
  public summary: any;
  public mySelectionb: number[] = [];
  haschanges:boolean = false;
  public selectedOnly:boolean = false;
  selectedWOCHECKSURCDE : number;
  public updateParms: any[];
  public dialogConfirmCancel : boolean = false;

  constructor(
    private wopmConfigurationService: WopmConfigurationService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getChecklist();
    this.sharedService.worksOrdersAccess.subscribe(data => { 
      this.wopmPortalAccess = data;
    });
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeEditDependencies() {
/*     if (this.haschanges) {
        this.dialogConfirmCancel = true;
    } else {
        this.dependenciesWindow = false;
        this.closedependenciesWindow.emit(this.dependenciesWindow)
    } */

      const template = {
        Sequence: this.wopmTemplateModel.sequence,
        UserId: this.currentUser.userId
      }
      this.wopmConfigurationService.validateTemplate(template)
      .subscribe(
        data => {
          if (data.isSuccess) {
            if (!data.data.isValid) {
              this.alertService.error(data.data.errorMessage)
            }
          }
            this.dependenciesWindow = false;
            this.closedependenciesWindow.emit(this.dependenciesWindow)
        },
      error => {
        this.alertService.error(error);
        this.dependenciesWindow = false;
        this.closedependenciesWindow.emit(this.dependenciesWindow)
      });

  }


  getChecklist(currentSelected: any = undefined) {
    this.subs.add(
      this.wopmConfigurationService.getChecklistMasterDependencyPredecessors(this.wopmTemplateModel.sequence).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.allPredecessors = data.data;
            this.wopmConfigurationService.getChecklistMasterDependenciesSummary(this.wopmTemplateModel.sequence).subscribe(
              data => {
                if (data && data.isSuccess) {
                  this.summary = data.data;
                }
                this.loading = this.loading2 = false;
              });
          } else {
            this.loading = this.loading2 = false;
          }
          
        }
      ))
  }

    public onSelect(e) {
      if (e.selectedRows.length > 0) {
        this.loading2 = true;
        this.selectedWOCHECKSURCDE = e.selectedRows[0].dataItem.wochecksurcde;
        this.showPredecessors();
      } else {
        this.selectedWOCHECKSURCDE = 0;
        this.predecessors = [];
      }

    }
    
    showPredecessors() {
      if (this.selectedOnly) {
        this.predecessors = this.allPredecessors.filter(u => u.ownerWOCHECKSURCDE == this.selectedWOCHECKSURCDE && u.selected);
      } else {
        this.predecessors = this.allPredecessors.filter(u => u.ownerWOCHECKSURCDE == this.selectedWOCHECKSURCDE);
      }
      this.loading2 = false;
    }

    checkBoxChanged(dataItem) {
      this.haschanges = true;
      var hasDependencies : string;
      if (this.allPredecessors.some(u => u.ownerWOCHECKSURCDE == dataItem.ownerWOCHECKSURCDE && u.selected)) {
        hasDependencies = "Y";
      } else {
        hasDependencies = "N";
      }

      this.wopmConfigurationService.UpdateChecklistMasterDependency(dataItem).subscribe(
        data => {
          if (data && data.isSuccess) {
;
          }
        },
          error => {
            this.alertService.error(error);
          });

      this.summary.forEach(function (record) {
        if (record.wochecksurcde == dataItem.ownerWOCHECKSURCDE) {
          record.dependencies = hasDependencies;
        };
    });
    }

    selectedOnlyChanged() {
      this.showPredecessors();
    }

    public saveEditDependencies() {
      this.wopmConfigurationService.UpdateChecklistMasterDependencies(this.allPredecessors).subscribe(
      data => {
        if (data && data.isSuccess) {
          const template = {
            Sequence: this.wopmTemplateModel.sequence,
            UserId: this.currentUser.userId
          }
          this.wopmConfigurationService.validateTemplate(template)
          .subscribe(
            data => {
              if (data.isSuccess) {
                if (!data.data.isValid) {
                  this.alertService.error(data.data.errorMessage)
                }
              }
                this.dependenciesWindow = false;
                this.closedependenciesWindow.emit(this.dependenciesWindow)
            },
        error => {
          this.alertService.error(error);
        });
        }
      },
        error => {
          this.alertService.error(error);
        });
  }


public closeSaveWin(save: boolean) {
  if (save) {
    this.saveEditDependencies();
  } else {
        this.dependenciesWindow = false;
        this.closedependenciesWindow.emit(this.dependenciesWindow)
  }
}

}
