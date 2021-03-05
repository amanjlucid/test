import { Component, OnInit } from '@angular/core';
import { EventService, AlertService, LoaderService, SharedService } from '../_services'
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
declare var $: any;
declare var Highcharts: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  today = new Date();
  weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
  currentUser;
  notificationDialogOpened = false;
  calendarEvents;
  caledarEventsByDate;
  selectedCalendarEvents;
  checkLoaded: boolean = false;
  subs = new SubSink();
  dashboardPermission: any;
  modulePermission: any;

  constructor(
    private dashboardEvent: EventService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private sharedService: SharedService,
    private router: Router,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.subs.add(
      this.sharedService.modulePermission.subscribe(async data => {
        this.modulePermission = await data
      })
    )

    //Check module permission
    this.subs.add(
      this.sharedService.apexPortalObs.subscribe(async data => {
        this.dashboardPermission = await data
        if (this.dashboardPermission != undefined) {
          this.pageLoadOnDashBoard();
        }
      })
    )
    // this.checkLoaded = true;

  }



  pageLoadOnDashBoard() {
    var urlParams = [];
    window.location.search.replace("?", "").split("&").forEach(function (e, i) {
      var p = e.split("=");
      urlParams[p[0]] = p[1];
    });

    if (urlParams["loaded"]) {
      setTimeout(() => {
        this.checkLoaded = true
        if (!this.dashboardPermission.includes('Dashboard')) {
          if (this.modulePermission.includes('Asset Portal Access')) {
            this.router.navigate(['asset-list']);
          } else {
            this.router.navigate(['my-profile']);
          }
          return
        }
        this.eventByStatus();
        this.eventByBusinessArea();
        this.eventAssignedUser();
        this.eventBySeverity();
        this.dashboardCalanderEvents();

        const component = this;
        $(document).on('click', '.a-date.event.focused', function () {
          component.notificationDialogOpened = true;
          let dateEvents = JSON.parse($(this).attr('data-event'));

          let dd = new Date(dateEvents.date).getDate();
          let mm = new Date(dateEvents.date).getMonth() + 1;
          let yy = new Date(dateEvents.date).getFullYear();

          component.selectedCalendarEvents = component.caledarEventsByDate[dd + "-" + mm + "-" + yy];
        });
      }, 1000);

    } else {
      let win = (window as any);
      win.location = 'dashboard?loaded=1';
    }
  }

  dashboardCalanderEvents() {
    let userId = this.currentUser.userId
    this.dashboardEvent.dashboardCalanderEvents(userId).subscribe(
      data => {
        if (data.isSuccess) {
          this.calendarEvents = data.data.map(function (d) {
            return {
              title: d.title.replace("'N'", "N"),
              date: new Date(d.date).getTime()
            }
          })
          this.sortEventDataByDate(data.data)
          $("#calendar").MEC({
            events: this.calendarEvents
          });
        }
      }
    )
  }


  eventByStatus() {
    this.dashboardEvent.eventByStatus(this.currentUser.userId).subscribe(
      data => {
        if (data.isSuccess) {
          let eventByStatus = data.data
          this.barChart('eventByStatus', 'Event By Status', eventByStatus);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      }
    )
  }



  eventByBusinessArea() {
    this.dashboardEvent.eventByBusinessArea(this.currentUser.userId).subscribe(
      data => {
        if (data.isSuccess) {
          let businessAreaEvent = data.data
          this.pieChart('businessAreaEvent', 'Event By Business Area', businessAreaEvent);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      }
    )
  }


  eventAssignedUser() {
    this.dashboardEvent.eventAssignedUser().subscribe(
      data => {
        if (data.isSuccess) {
          let eventAssignedUser = data.data
          this.pieChart('eventAssignedUser', 'Event Assigned User', eventAssignedUser);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      }
    )
  }


  eventBySeverity() {
    this.dashboardEvent.eventBySeverity().subscribe(
      data => {
        if (data.isSuccess) {
          let eventBySeverity = data.data
          this.pieChart('eventBySeverity', 'Event By Severity', eventBySeverity);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      }
    )
  }


  pieChart(elm, titleText = null, data = null) {
    let chart = new Highcharts.chart(elm, {
      chart: {
        type: 'pie',
        style: {
          fontFamily: 'MuseoSansRounded-300',

        }
      },
      title: {
        text: titleText
      },
      // subtitle: {
      //     text: 'Click the slices to view versions. Source: <a href="#" target="_blank">statcounter.com</a>'
      // },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y}'
          }
        },
        pie: {
          size: '70%',
          dataLabels: {
            enabled: false,
          },
          // colors: [
          //   '#50B432', 
          //   '#ED561B', 
          //   '#DDDF00', 
          //   '#24CBE5', 
          //   '#64E572', 
          //   '#FF9655', 
          //   '#FFF263', 
          //   '#6AF9C4'
          // ],
        }
      },
      // tooltip: {
      //   headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      //   pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
      // },

      series: [
        {
          name: titleText,
          colorByPoint: true,
          data: data
        }
      ],

    }, function (chart) {
      // on complete
      //console.log(chart.series[0].data.length)
      if (chart.series[0].data.length != undefined && chart.series[0].data.length < 1) {
        chart.renderer.text('No Data Available', 140, 120)
          .css({
            color: '#4572A7',
            fontSize: '16px',
          })
          .add();
      }
    });
  }


  barChart(elm, titleText, data) {
    //console.log(data);
    let chart = new Highcharts.chart(elm, {
      chart: {
        type: 'bar',
        style: {
          fontFamily: 'MuseoSansRounded-300',

        }
      },
      title: {
        text: titleText
      },
      // subtitle: {
      //     text: 'Source: <a href="#">Wikipedia.org</a>'
      // },
      xAxis: {
        categories: data.arrayOflabels,
        title: {
          text: null
        }
      },
      yAxis: {
        // min: 0,
        // title: {
        //     text: 'Population (millions)',
        //     align: 'high'
        // },
        // labels: {
        //     overflow: 'justify'
        // }
        allowDecimals: false,
        tickInterval: 1,
        min: 0
      },
      // tooltip: {
      //   valueSuffix: ' millions'
      // },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: false
          }
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
        shadow: true,
        enabled: false
      },
      credits: {
        enabled: false
      },
      series: [{
        name: '',
        data: data.arrayOfvalues//[3, 4, 1.3, 4.5, 0.5]
      }]
    }, function (chart) {
      // on complete
      //console.log(chart.series[0].data.length)
      if (chart.series[0].data.length != undefined && chart.series[0].data.length < 1) {
        chart.renderer.text('No Data Available', 140, 120)
          .css({
            color: '#4572A7',
            fontSize: '16px',
          })
          .add();
      }
    });
  }

  sortEventDataByDate(eventData) {
    this.caledarEventsByDate = new Array;
    for (let i = 0; i < eventData.length; i++) {
      let dd = new Date(eventData[i].date).getDate()
      let mm = new Date(eventData[i].date).getMonth() + 1
      let yy = new Date(eventData[i].date).getFullYear()
      if (!this.caledarEventsByDate[dd + "-" + mm + "-" + yy]) {
        this.caledarEventsByDate[dd + "-" + mm + "-" + yy] = [];
      }
      this.caledarEventsByDate[dd + "-" + mm + "-" + yy].push(eventData[i]);
    }

  }

  closeNotificationDialog() {
    this.notificationDialogOpened = false;
  }

}
