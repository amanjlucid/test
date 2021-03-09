export class BatchSurveysListModel {
  OrderBy: string;
  OrderType: string;
  UserId: string;
  SupCode: string = '';
  SubID: number = 0;
  SubArcID: number = 0;
  StatusFilter: string = '';
  SurveyBatchName: string = '';
  SupName: string = '';
  SurveyStartDateFilter: string = '';
  SurveyEndDateFilter: string = '';
  PageNo: number = 0;

}
