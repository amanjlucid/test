export class BatchesListModel {
  OrderBy: string;
  OrderType: string;
  SupCode: string = '';
  SupName: string = '';
  UserId: string = '';
  StatusFilter: string = '';
  BatchNameFilter: string = '';
  SurveyorNameFilter: string = '';
  PageNo: number = 0;
  BatchOnlyFilter: string = '';
}
