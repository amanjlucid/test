import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { NgbDateStruct, NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pick-date',
  templateUrl: './pick-date.component.html',
  styleUrls: ['./pick-date.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class PickDateComponent implements OnInit {
  @Input() chooseDateWindow: boolean = false;
  @Input() chooseDateType: string = 'status';
  @Output() closePickeDateEvent = new EventEmitter<boolean>();
  @Output() selectedDateEvent = new EventEmitter<any>();
  model: NgbDateStruct;
  date: { year: number, month: number };
  maxDate: any;
  range = false;


  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null;
  toDate: NgbDate | null;

  width = 300
  height: any = 'auto';
  title = '';

  constructor(
    private calendar: NgbCalendar,
    private chRef: ChangeDetectorRef,
    public formatter: NgbDateParserFormatter
  ) {

  }

  ngOnInit(): void {
    if (this.chooseDateType == "IPD") {
      this.title = "Select Today or Past In Progress Date"
    } else if (this.chooseDateType == "CCDPICK") {
      this.title = "Select Today or Past Planned Completion Date"
    } else if (this.chooseDateType == "CIPICK") {
      this.title = "Select Today or Past Completion Date"
    } else if (this.chooseDateType == "TCPICK") {
      this.title = "Select Target Date"
    } else if (this.chooseDateType == "CSDPICK") {
      this.title = "Select Start Date"
    } else if (this.chooseDateType == "SE") {
      this.title = "Select Date"
    } else {
      this.title = "Select Date"
    }



    this.chRef.detectChanges();

    const current = new Date();

    if (this.chooseDateType == "IPD" || this.chooseDateType == "CCDPICK" || this.chooseDateType == "CIPICK") {
      this.maxDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    } else if (this.chooseDateType == "SE") {
      this.width = 520;
      // this.height = 430;
      this.range = true;
      // this.fromDate = this.calendar.getToday();
      // this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);

    } else {
      this.maxDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    }

    this.chRef.detectChanges();
  }

  closePickDate() {
    this.chooseDateWindow = false;
    this.closePickeDateEvent.emit(this.chooseDateWindow);
  }

  selectDate() {

    if (this.chooseDateType == "SE") {
      const date = { start: this.fromDate, end: this.toDate }
      this.selectedDateEvent.emit(date)
    } else {
      const date = { selectedDate: this.model }
      this.selectedDateEvent.emit(date)
    }

    this.closePickDate();

  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
}
