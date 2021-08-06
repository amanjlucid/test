import { Component, OnInit } from '@angular/core';
import { AlertService, ChartService } from '../_services';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-chart-settings',
  templateUrl: './chart-settings.component.html',
  styleUrls: ['./chart-settings.component.css']
})

export class ChartSettingsComponent implements OnInit {
  chartPortals = [];
  emptyObject: any = { dashboard: '', numberOfChart: 0 }
  submitted = false
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  savedChart = [{ dashboard: 'test', numberOfChart: 1 }, { dashboard: 'test2', numberOfChart: 1 }, { dashboard: 'test3', numberOfChart: 1 }]
  subs = new SubSink();

  constructor(
    private alertServcie: AlertService,
    private chartService: ChartService
  ) { }

  cloneData = (data: any[]) => Object.assign({}, data);

  ngOnInit(): void {
    if (this.chartPortals.length == 0) {
      //this.chartPortals.push(this.cloneData(this.emptyObject));
      this.getChartSettings();
    }
  }

  getChartSettings() {
    this.subs.add(
      this.chartService.getUserChartSetting(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.savedChart = data.data;
            this.chartPortals = JSON.parse(JSON.stringify(this.savedChart));

            if (this.chartPortals.length == 0) {
              this.alertServcie.error("There is no chart data saved");
            }

          }
        })
    )
  }

  addMore() {
    this.chartPortals.push(this.cloneData(this.emptyObject));
  }

  remove(index) {
    if (this.chartPortals.length > 1) {
      this.chartPortals = this.chartPortals.filter((val, ind) => ind != index);
    }
  }

  saveChartForm() {
    if (!this.submitted) {
      if (this.chartPortals.length == 0) {
        this.alertServcie.error("There is no chart data saved");
      }

      this.submitted = true;
      const invalid = this.chartPortals.find(x => x.dashboard == '' || (!x.numberOfChart));

      if (invalid) {
        this.alertServcie.error("Please fill all the field first.");
        return;
      }

      let params: any = {}
      params.userId = this.currentUser.userId;
      params.chartSettings = this.chartPortals;

      this.subs.add(
        this.chartService.SaveUserChartSettings(params).subscribe(
          data => {
            this.submitted = false;
            if (data.isSuccess) {
              this.alertServcie.success("Chart settings updated");
            }
          }
        )
      )

    }
  }


}
