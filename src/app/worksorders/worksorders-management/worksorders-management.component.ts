export interface Employee {
  EmployeeId: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Extension: string;
  hasChildren?: boolean;
}

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-worksorders-management',
  templateUrl: './worksorders-management.component.html',
  styleUrls: ['./worksorders-management.component.css']
})
export class WorksordersManagementComponent implements OnInit {
  public rootData: Observable<Employee[]>;
  private serviceUrl = 'https://demos.telerik.com/kendo-ui/service/EmployeeDirectory';

  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
      this.rootData = this.query();
  }

  public fetchChildren = (item: Employee): Observable<Employee[]> => {
      return this.query(item.EmployeeId);
  }

  public hasChildren = (item: Employee): boolean => {
      return item.hasChildren;
  }

  public query(reportsTo: number = null): Observable<Employee[]> {
      return this.http.jsonp<Employee[]>(
          `${this.serviceUrl}?id=${reportsTo}`,
          'callback'
      );
  }

  

}
