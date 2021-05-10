import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SubSink } from 'subsink';
import { HnsPortalService } from '../../_services'

@Component({
  selector: 'app-hns-survey-type-list',
  templateUrl: './hns-survey-type-list.component.html',
  styleUrls: ['./hns-survey-type-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsSurveyTypeListComponent implements OnInit {
  @Input() surveyTypeOpen: boolean = false;
  @Output() closeSurveyType = new EventEmitter<boolean>();
  subs = new SubSink();
  surveyTypeList: any;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  gridView: DataResult;
  gridSize: 30;
  @Output() selectedSurveyTypeEvent = new EventEmitter<any>();
  selectedSurveyType:any

  constructor(
    private hnsPortalService: HnsPortalService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getSurveyTypes();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.surveyTypeList, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedSurveyType = dataItem;
  }

  selectSurvey(){
    if(this.selectedSurveyType == undefined){
      this.selectedSurveyType = this.surveyTypeList[0];
    } 
    this.selectedSurveyTypeEvent.emit(this.selectedSurveyType);
    this.closeSurveyTypeList();
  }

  closeSurveyTypeList() {
    this.surveyTypeOpen = false;
    this.closeSurveyType.emit(this.surveyTypeOpen)
  }

  getSurveyTypes() {
    this.subs.add(
      this.hnsPortalService.getSurveyTypes().subscribe(
        data => {
          if (data.isSuccess) {
            this.surveyTypeList = data.data;
            this.gridView = process(this.surveyTypeList, this.state);
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

}
