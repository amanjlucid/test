import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService } from '../../_services'
import { SelectableSettings, SelectAllCheckboxState, PageChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-event-parameters-list',
  templateUrl: './event-parameters-list.component.html',
  styleUrls: ['./event-parameters-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventParametersListComponent implements OnInit {
  subs = new SubSink();
  @Input() eventParamList = false;
  @Input() selectedEvent: any;
  @Input() selectedParam: any;
  @Output() closeEventParamList = new EventEmitter<boolean>();
  @Output() changeSelectedParams = new EventEmitter<any>();
  title = 'Task Parameters';
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public gridView: DataResult;
  pageSize = 25;
  allowUnsort = true;
  multiple = false;
  eventParamHeading = '';
  parameterList: any;
  columnName = [];
  eventParameters: any;

  public checkboxOnly = false;
  public mode: any = 'multiple';
  public mySelection: number[] = [];
  public selectableSettings: SelectableSettings;
  public selectAllState: SelectAllCheckboxState = 'unchecked';

  constructor(
    private eventManagerService: EventManagerService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private helperService: HelperService

  ) {

  }

  ngOnInit(): void {
    this.eventParamHeading = '';
    if (this.selectedParam.eventTypeParamType == "P") {
      this.mode = "single"
    } else {
      this.mode = "multiple"
    }

    this.setSelectableSettings();
    console.log(this.selectedEvent)
    this.getEventParameterList(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.renderGrid();
  }

  public filterChange(filter: any): void {
    this.state.filter = filter;
    this.renderGrid();
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.parameterList.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.parameterList.length
    };
  }


  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      mode: this.mode
    };
  }


  public onSelectedKeysChange(e) {
    const len = this.mySelection.length;
    
    if (len === 0) {
      this.selectAllState = 'unchecked';
    } else if (len > 0 && len < this.parameterList.length) {
      this.selectAllState = 'indeterminate';
    } else {
      this.selectAllState = 'checked';
    }

    // console.log(this.mySelection);
    this.chRef.detectChanges();
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    if (checkedState === 'checked') {
      this.mySelection = this.parameterList.map((item) => item.selectionSeq);
      this.selectAllState = 'checked';
    } else {
      this.mySelection = [];
      this.selectAllState = 'unchecked';
    }

    // console.log(this.mySelection);
    this.chRef.detectChanges();
  }

  closeParameterWindow() {
    this.eventParamList = false
    this.closeEventParamList.emit(this.eventParamList);
  }


  getEventParameterList(eSeq, epSeq) {
    this.subs.add(
      this.eventManagerService.getListOfEventTypeParameterSelection(eSeq, epSeq).subscribe(
        data => {
          if (data.isSuccess) {
            let col = data.data[0];
            this.parameterList = data.data;
            // console.log(this.parameterList)
            for (let cl in col) {
              if (col[cl] != '' && col[cl] != 0 && cl != "selectionType")
                this.columnName.push({ 'key': cl, 'val': col[cl] })
            }

            // console.log(this.columnName);

            this.parameterList.shift();
            this.setDefaultSelectedValues(this.selectedParam.eventTypeParamSqlValue);
            // if (this.parameterList.lenght > 0) {
            //   this.parameterList = this.parameterList.shift();
            // }
            this.renderGrid();
            this.chRef.detectChanges();
          }
        },
        err => {
          this.alertService.error(err);
        }
      )
    )
  }

  renderGrid() {
    this.gridView = process(this.parameterList, this.state);
    this.chRef.detectChanges();
  }



  getSelectedData() {
    let paramlist = this.parameterList.filter((x: any) => this.mySelection.indexOf(x.selectionSeq) !== -1);
    let pstring = '';
    let valArr = [];
    if (paramlist) {
      // console.log(paramlist)
      // if (this.selectedParam.eventTypeParamType == "P") {
      //   console.log('in')
      //   for (let plist of paramlist) {
      //     if (plist.selectiionNum != undefined) {

      //     } else {

      //     }
      //     pstring += `${plist.selectionChar}`;

      //   }
      // } else {
      // console.log('o')

      //let paramLenght = paramlist.length
      //let i = 1;
      for (let plist of paramlist) {
        if (plist.selectiionNum != undefined) {
          if (plist.selectionChar == "") {
            // if (i == paramLenght) {
            //   pstring += `${plist.selectiionNum}`;
            // } else {
              //pstring += `${plist.selectiionNum},`;
              valArr.push(plist.selectiionNum);
            // }
          } else {
            // pstring += `'${plist.selectionChar}',`;
            valArr.push(plist.selectionChar);
          }
        } else {
          // if (i == paramLenght) {
          //   pstring += `${plist.selectionChar}`;
          // } else {
          //   pstring += `${plist.selectionChar},`;

          // }
          valArr.push(plist.selectionChar);
        }

        // i++;

      }
      // }

      if(valArr.length > 0){
        pstring = valArr.toString();
      }


      this.subs.add(
        this.eventManagerService.updateListOfEventTypeParameter(this.selectedEvent.eventTypeSequence, this.selectedParam.eventTypeParamSequence, pstring).subscribe(
          data => {
            if (data.isSuccess) {
              this.selectedParam.eventTypeParamSqlValue = pstring;
              this.changeParams()
              this.closeParameterWindow()
            } else {
              this.alertService.error(data.message)
            }
          },
          err => {
            this.alertService.error(err);
          }
        )
      )

    }

  }



  public cellClickHandler(eve) {
    console.log(eve);
    // this.selectedParam = dataItem;
    // console.log(this.selectedParam)
    // if (columnIndex == 2) {
    //   if (!isEdited && this.selectedParam.eventTypeParamType == 'N') {
    //     sender.editCell(rowIndex, columnIndex);
    //   }
    // }
  }

  setDefaultSelectedValues(string) {
    if (string != "") {
      let splitStr = string.split(",");
      if (splitStr) {
        splitStr = splitStr.map(x => this.helperService.replaceAll(x, "'", "").toUpperCase());
      }


      if (this.parameterList.length > 0) {
        for (let plist of this.parameterList) {
          if (plist.selectiionNum != undefined && plist.selectionChar == "") {
            if (splitStr.indexOf(plist.selectiionNum.toString()) !== -1) {
              this.mySelection.push(plist.selectionSeq)
            }
          } else {
            if (splitStr.indexOf(plist.selectionChar) !== -1) {
              this.mySelection.push(plist.selectionSeq)
            }
          }
        }
      }


    }

  }

  changeParams() {
    this.changeSelectedParams.emit(this.selectedParam)
  }


}
