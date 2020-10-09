import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { HnsPortalService, AlertService } from 'src/app/_services';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-hns-characteristic',
  templateUrl: './hns-characteristic.component.html',
  styleUrls: ['./hns-characteristic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsCharacteristicComponent implements OnInit {
  subs = new SubSink();
  @Input() isOpenCharacteristic: boolean = false
  @Output() closeCharacteristic = new EventEmitter<boolean>();
  @Output() selectedCharOutput = new EventEmitter<any>();
  @Input() datatype: any;
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
  hnsCharacteristic: any;
  pageSize: number = 30;
  charactersticModel: any = {
    searchString: "null",
    dataType: ''
  }
  selectedChar: any;
  searchTerm$ = new Subject<string>();

  constructor(
    private hnsService: HnsPortalService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.charactersticModel.dataType = this.datatype;
    this.getCharacteristic(this.charactersticModel);
    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(1400),
          distinctUntilChanged()
        ).subscribe((searchTerm) => {
          this.charactersticModel.searchString = searchTerm;
          this.getCharacteristic(this.charactersticModel);
        })
    )
  }

  // ngAfterViewChecked() {
  //   this.chRef.detectChanges();
  // }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.hnsCharacteristic, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.hnsCharacteristic, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.hnsCharacteristic.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.hnsCharacteristic.length
    };
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedChar = dataItem;

  }

  getCharacteristic(charactersticModel: any) {
    this.subs.add(
      this.hnsService.getCharacteristic(charactersticModel).subscribe(
        data => {
          if (data.isSuccess) {
            const tempData = data.data;
            this.hnsCharacteristic = tempData;
            this.gridView = process(this.hnsCharacteristic, this.state);
            this.chRef.detectChanges();
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  search($event) {
    this.searchTerm$.next($event.target.value);
  }

  closeChrstc() {
    this.isOpenCharacteristic = false;
    this.closeCharacteristic.emit(this.isOpenCharacteristic);
  }

  select(){
    if(this.selectedChar != undefined){
      this.selectedCharOutput.emit(this.selectedChar);
      this.closeChrstc();
    } else {
      this.alertService.error("Please select an item from the list first");
    }
    
  }

}
