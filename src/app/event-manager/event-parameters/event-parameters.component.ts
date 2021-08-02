import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-event-parameters',
  templateUrl: './event-parameters.component.html',
  styleUrls: ['./event-parameters.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EventParametersComponent implements OnInit {
  @ViewChild('myForm') form: any;
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
      logic: "and",
      filters: []
    }
  }
  public gridView: DataResult;
  allowUnsort = true;
  multiple = false;
  parameterList: any
  actualParametreList: any;
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
    this.setEventParameterActualList(this.selectedEvent.eventTypeSequence);
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

  setEventParameterActualList(seq) {
    this.subs.add(
      this.eventmanagerService.getListOfEventTypeParameter(seq).subscribe(
        data => {
          if (data.isSuccess) {
            this.actualParametreList = data.data;
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
    if (this.form.invalid) {
      return
    }

    let recordToUpdate = [];
    for (let ind in this.parameterList) {
      // if (this.parameterList[ind].eventTypeParamSqlValue != this.actualParametreList[ind].eventTypeParamSqlValue) {
      //   recordToUpdate.push(this.parameterList[ind]);
      // }
      if (this.parameterList[ind].eventTypeParamType != 'P' && this.parameterList[ind].eventTypeParamType != 'I') {
        recordToUpdate.push(this.parameterList[ind]);
      }
    }

    if (recordToUpdate.length == 0) {
      this.closeEventParamWin();
      //this.alert.error("No Changes found");
      return
    }

    let req = [];
    for (let updateParam of recordToUpdate) {
      req.push(this.eventmanagerService.updateListOfEventTypeParameter(this.selectedEvent.eventTypeSequence, updateParam.eventTypeParamSequence, updateParam.eventTypeParamSqlValue))
    }

    if (req.length > 0) {
      this.subs.add(
        forkJoin(req).subscribe(
          data => {
            if (data.length > 0) {
              let parms: any = data;
              // console.log(runevents);
              let successStr = [];
              let failStr = [];
              for (let parm in parms) {
                if (parms[parm].isSuccess) {
                  successStr.push(` Parameter updated successfully.`);
                } else {
                  failStr.push(` Parameter not updated.`);
                }

              }
              let sMessageSuccess = '';
              let sMessageFailures = '';
              if(successStr.length > 0)
              {
                sMessageSuccess = JSON.stringify(successStr.length)  + ' parameter(s) updated successfully'
                this.alert.error(sMessageSuccess, false, 2000)
              }
              if(failStr.length > 0)
              {
                sMessageFailures = JSON.stringify(failStr.length)  + ' parameter(s) not updated'
                this.alert.error(sMessageFailures, false, 2000)
              }

            }
            this.closeEventParamWin();
          }
        )
      )
    }

    // let paramLength = this.parameterList.length;
    // let i = 1
    // const saveParams = () => {
    //   return new Promise((resolve, reject) => {
    //     for (let param of this.parameterList) {
    //       if (param.eventTypeParamType == "N") {
    //         this.subs.add(
    //           this.eventmanagerService.updateListOfEventTypeParameter(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence, param.eventTypeParamSqlValue).subscribe(
    //             data => {
    //               // console.log(data);
    //             }
    //           )
    //         )
    //       }
    //       i++;
    //     }
    //     resolve(i)
    //   })
    // }

    // saveParams().then((x: any) => {
    //   // console.log(x)
    //   setTimeout(() => {
    //     this.closeEventParamWin();
    //   }, 2000);

    // })

  }

  changeSelectedParams(event) {
    this.selectedParam = event;
    this.gridView[this.rowIndex] = this.selectedParam;
    this.chRef.detectChanges();
  }

}
