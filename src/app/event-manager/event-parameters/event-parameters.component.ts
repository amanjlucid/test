import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService } from '../../_services'

@Component({
  selector: 'app-event-parameters',
  templateUrl: './event-parameters.component.html',
  styleUrls: ['./event-parameters.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EventParametersComponent implements OnInit {
  subs = new SubSink();
  @Input() paramsWindow = false;
  @Input() selectedEvent: any;
  @Output() closeEventparamWindow = new EventEmitter<boolean>();
  title = 'Task Parameters';
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  parameterList: any
  eventParamHeading = '';
  selectedParam: any;
  eventParamList = false;
  rowIndex: any


  constructor(
    private chRef: ChangeDetectorRef,
    private eventmanagerService: EventManagerService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    
    this.selectedEvent = this.selectedEvent[0];
    this.eventParamHeading = `Task Type: ${this.selectedEvent.eventTypeName} (${this.selectedEvent.eventTypeCode})`
    this.getEventParameterList(this.selectedEvent.eventTypeSequence);
    
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeEventParamWin() {
    this.paramsWindow = false;
    this.closeEventparamWindow.emit(this.paramsWindow);
  }


  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.renderGrid();
  }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.renderGrid();
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.closeEditor(sender, rowIndex);
    this.selectedParam = dataItem;
    this.rowIndex = rowIndex
    // console.log(this.selectedParam)
    if (columnIndex == 2) {
      if (!isEdited && this.selectedParam.eventTypeParamType == 'N') {
        sender.editCell(rowIndex, columnIndex);
      }
    }
  }

  onStateChange(state: State) {
    this.state = state;
    this.renderGrid();
    //this.editService.read();
  }

  private closeEditor(grid, rowIndex) {
    grid.closeRow(rowIndex);
  }

  getEventParameterList(seq) {
    this.subs.add(
      this.eventmanagerService.getListOfEventTypeParameter(seq).subscribe(
        data => {
          if (data.isSuccess) {
            this.parameterList = data.data;
            this.renderGrid();
          } else {
            this.alert.error(data.message);
          }
        },

        error => {
          this.alert.error(error);
        }
      )
    )
  }


  renderGrid() {
    this.gridView = process(this.parameterList, this.state);
    this.chRef.detectChanges();
  }

  openParameterOptions(item) {
    this.selectedParam = item;
    this.eventParamList = true
    $('.eventParamList').addClass('ovrlay');
  }

  closeEventParamList($e) {
    this.eventParamList = $e;
    $('.eventParamList').removeClass('ovrlay');

  }

  saveParameters() {
    this.parameterList = this.gridView.data;

    let paramLength = this.parameterList.length;
    let i = 1
    // console.log(this.parameterList);
    // for (let param of this.parameterList) {
    //   if (param.eventTypeParamType == "N") {
    //     this.subs.add(
    //       this.eventmanagerService.updateListOfEventTypeParameter(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence, param.eventTypeParamSqlValue).subscribe(
    //         data => {
    //           console.log(data);
    //           if (data.isSuccess == false) {
    //             this.alert.error(data.message);
    //             return;
    //           }
    //           console.log(paramLength)
    //           console.log(i)

    //         }
    //       )
    //     )
    //   } 
    //     if (paramLength == i) {
    //       this.closeEventParamWin();
    //     }


    //   i++;
    // }


    const saveParams = () => {
      return new Promise((resolve, reject) => {
        for (let param of this.parameterList) {
          if (param.eventTypeParamType == "N") {
            this.subs.add(
              this.eventmanagerService.updateListOfEventTypeParameter(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence, param.eventTypeParamSqlValue).subscribe(
                data => {
                  // console.log(data);
                }
              )
            )
          }
          i++;
        }
        resolve(i)
      })
    }

    saveParams().then((x: any) => {
     // console.log(x)
      setTimeout(() => {
        this.closeEventParamWin();
      }, 2000);
    
    })
    
  }

  changeSelectedParams(event) {
    this.selectedParam = event;
    this.gridView[this.rowIndex] = this.selectedParam;
    this.chRef.detectChanges();
  }

}
