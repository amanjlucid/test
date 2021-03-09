export class ProjectSurveysListModel {
  OrderBy: string;
  OrderType: string;
  UserId: string;
  SupCode: string = '';
  SupName: string = '';
  StatusFilter: string;
  AssetTypeFilter: string;
  AssetFilter: string;
  AddressFilter: string;
  SrvCodeFilter: string = '';
  SrvVersionFilter: number = 0;
  InSurveysFilter: string = '';
  PageNo: number = 0;
}
