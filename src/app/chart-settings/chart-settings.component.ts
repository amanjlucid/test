import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-settings',
  templateUrl: './chart-settings.component.html',
  styleUrls: ['./chart-settings.component.css']
})

export class ChartSettingsComponent implements OnInit {
  chartPortals = [];
  emptyObject:any = { portalName: '', numberofchart: 0 }


  constructor() { }

  cloneData = (data: any[]) => Object.assign({}, data);

  ngOnInit(): void {
    if (this.chartPortals.length == 0) {
      this.chartPortals.push(this.cloneData(this.emptyObject));
    }
  }

  addMore() {
    this.chartPortals.push(this.cloneData(this.emptyObject));
  }

  remove(index) {
    if (this.chartPortals.length > 1) {
      this.chartPortals = this.chartPortals.filter((val, ind) => ind != index);
      console.log(this.chartPortals)
    }
  }

  trackByFn(index: number, item) {
    return item.portalName
  }

  saveChartForm() { console.log(this.chartPortals) }

}
