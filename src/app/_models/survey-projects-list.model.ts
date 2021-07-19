export class ProjectsListModel {
  UserId: string;
  OrderBy: string;
  OrderType: string;
  StatusFilter: string = '';
  SettingsFilter: string = '';
  SupCodeNameFilter: string = '';
  PageNo: number = 0;
  SupCode: string = '';
  SupCodeOnlyFilter: string = '';
}

