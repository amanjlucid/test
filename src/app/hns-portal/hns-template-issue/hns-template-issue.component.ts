import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { HnsPortalService, AlertService, ConfirmationDialogService } from '../../_services'
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-hns-template-issue',
  templateUrl: './hns-template-issue.component.html',
  styleUrls: ['./hns-template-issue.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsTemplateIssueComponent implements OnInit {
  subs = new SubSink();
  @Input() templateIssueOpen: boolean = false;
  // @Input() selectedDefinition: any;
  @Input() selectedNode: any;
  @Output() closeTemplateIssue = new EventEmitter<boolean>();
  gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    take: 30,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  pageSize: number = 30;
  templateIssueData: any;
  selectedTemplateIssue: any;
  templateIssueModel: any = {};
  searchTerm$ = new Subject<string>();
  issueMode: string = "new";
  openPopup: boolean = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit() {
    this.templateIssueModel = {
      hascode: this.selectedNode.hascode,
      hasversion: this.selectedNode.hasversion,
      hasgroupid: this.selectedNode.hasgroupid,
      hasheadingid: this.selectedNode.hasheadingid,
      hasquestionid: this.selectedNode.hasquestionid,
      textstring: '',
    }

    this.getTemplateIssues(this.templateIssueModel);
    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(1400),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.templateIssueModel.textstring = searchTerm;
          this.getTemplateIssues(this.templateIssueModel);
        })
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  search($event) {
    this.searchTerm$.next($event.target.value);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.templateIssueData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.templateIssueData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.templateIssueData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.templateIssueData.length
    };
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedTemplateIssue = dataItem;

  }

  closeTemplateIssueMethod() {
    this.templateIssueOpen = false
    this.closeTemplateIssue.emit(this.templateIssueOpen);
  }

  getTemplateIssues(selectedNode) {
    this.subs.add(
      this.hnsService.getTemplateIssueList(selectedNode).subscribe(
        data => {
          if (data.isSuccess) {
            const tempData = data.data;
            this.templateIssueData = tempData;
            this.gridView = process(this.templateIssueData, this.state);
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  addUpdateIssue(issueMode) {
    if (issueMode == "edit") {
      if (this.selectedTemplateIssue == undefined) {
        this.alertService.error("Please select one record to update.")
        return
      }
    }
    this.issueMode = issueMode;
    this.openPopup = true;
    $('.issueOverlay').addClass('ovrlay');
  }

  closePopup($event) {
    this.openPopup = $event;
    $('.issueOverlay').removeClass('ovrlay');
  }

  isSuccessFullSubmit($event) {
    if ($event) {
      this.getTemplateIssues(this.templateIssueModel);
    }
  }

  public openConfirmationDialog() {
    if (this.selectedTemplateIssue == undefined) {
      this.alertService.error("Please select one record to update.")
      return
    }
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.delete() : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
    $('.k-window-wrapper').css({ 'z-index': 1000 });
  }

  delete() {
    this.subs.add(
      this.hnsService.deleteTemplateIssue(this.selectedTemplateIssue).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Question issue deleted successfully.")
            this.getTemplateIssues(this.templateIssueModel);
          } else {
            this.alertService.success(data.message);
          }
        }
      )
    )
  }


}
