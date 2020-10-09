import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { HnsPortalService, AlertService, ConfirmationDialogService } from '../../_services'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-hns-template-action',
  templateUrl: './hns-template-action.component.html',
  styleUrls: ['./hns-template-action.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsTemplateActionComponent implements OnInit {

  subs = new SubSink();
  @Input() templateActionOpen: boolean = false;
  // @Input() selectedDefinition: any;
  @Input() selectedNode: any;
  @Output() closeTemplateAction = new EventEmitter<boolean>();
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
  templateActionData: any;
  selectedTemplateAction: any;
  templateActionModel: any = {};
  searchTerm$ = new Subject<string>();
  actionMode: string = "new";
  openActionPopup: boolean = false;

  constructor(
    private chRef: ChangeDetectorRef,
    private hnsService: HnsPortalService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit() {
    this.templateActionModel = {
      hascode: this.selectedNode.hascode,
      hasversion: this.selectedNode.hasversion,
      hasgroupid: this.selectedNode.hasgroupid,
      hasheadingid: this.selectedNode.hasheadingid,
      hasquestionid: this.selectedNode.hasquestionid,
      textstring: '',
    }

    this.getTemplateAction(this.templateActionModel);
    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(1400),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.templateActionModel.textstring = searchTerm;
          this.getTemplateAction(this.templateActionModel);
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
    this.gridView = process(this.templateActionData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.templateActionData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.templateActionData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.templateActionData.length
    };
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedTemplateAction = dataItem;

  }

  closeTemplateActionMethod() {
    this.templateActionOpen = false
    this.closeTemplateAction.emit(this.templateActionOpen);
  }

  getTemplateAction(selectedNode) {
    this.subs.add(
      this.hnsService.getTemplateActionList(selectedNode).subscribe(
        data => {
          //console.log(data)
          if (data.isSuccess) {
            const tempData = data.data;
            this.templateActionData = tempData;
            this.gridView = process(this.templateActionData, this.state);
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  addUpdateAction(actionMode) {
    if (actionMode == "edit") {
      if (this.selectedTemplateAction == undefined) {
        this.alertService.error("Please select one record to update.")
        return
      }
    }
    this.actionMode = actionMode;
    this.openActionPopup = true;
    $('.actionOverlay').addClass('ovrlay');
  }

  closeActionPopup($event) {
    this.openActionPopup = $event;
    $('.actionOverlay').removeClass('ovrlay');
  }

  isSuccessFullSubmit($event) {
    if ($event) {
      this.getTemplateAction(this.templateActionModel);
    }
  }

  public openConfirmationDialog() {
    if (this.selectedTemplateAction == undefined) {
      this.alertService.error("Please select one record to update.")
      return
    }
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.delete() : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
    $('.k-window').css({ 'z-index': 1000 });
  }

  delete() {
    this.subs.add(
      this.hnsService.deleteTemplateAction(this.selectedTemplateAction).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Question action deleted successfully.")
            this.getTemplateAction(this.templateActionModel);
          } else {
            this.alertService.success(data.message);
          }
        }
      )
    )
  }

}
