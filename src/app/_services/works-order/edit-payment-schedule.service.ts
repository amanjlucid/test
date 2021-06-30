import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { appConfig } from '../../app.config';
import { HelperService } from '../helper.service'
import { AlertService } from '../alert.service';

// const CREATE_ACTION = 'create';
// const UPDATE_ACTION = 'update';
// const REMOVE_ACTION = 'destroy';

const itemIndex = (item: any, data: any[]): number => {
    for (let idx = 0; idx < data.length; idx++) {
        if (JSON.stringify(data[idx]) === JSON.stringify(item)) {
            return idx;
        }
    }

    return -1;
};

const cloneData = (data: any[]) => data.map(item => Object.assign({}, item));

@Injectable()
export class EditPaymentScheduleService extends BehaviorSubject<any[]> {
    private serviceFor: 'paymentschedule' | 'valuation' = 'paymentschedule';
    private data: any[] = [];
    private originalData: any[] = [];
    private createdItems: any[] = [];
    private updatedItems: any[] = [];
    private deletedItems: any[] = [];
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };

    constructor(
        private http: HttpClient,
        private helperService: HelperService,
        private alertService: AlertService
    ) { super([]); }



    public setServiceFor(string: 'paymentschedule' | 'valuation') {
        this.serviceFor = string;
    }

    public getOriginalData() {
        return cloneData(this.originalData);
    }

    public read(params) {
        if (this.data.length > 0) return super.next(this.data);

        let apiCall: Observable<any>;
        if (this.serviceFor == "paymentschedule") apiCall = this.getWOScheduleData(params);
        if (this.serviceFor == "valuation") apiCall = this.getValuation(params);

        apiCall.subscribe((data: any) => {
            // console.log(data);
            if (data.isSuccess) {
                this.data = data.data;
                this.originalData = cloneData(this.data);
                super.next(this.data);
            } else {
                this.data = [];
                this.originalData = [];
                super.next([]);
            }

        });
    }

    public create(item: any): void {
        this.createdItems.push(item);
        this.data.unshift(item);
        super.next(this.data);
    }

    public update(item: any): void {
        if (!this.isNew(item)) {
            const index = itemIndex(item, this.updatedItems);
            if (index !== -1) {
                this.updatedItems.splice(index, 1, item);
            } else {
                this.updatedItems.push(item);
            }
        } else {
            const index = this.createdItems.indexOf(item);
            this.createdItems.splice(index, 1, item);
        }
    }

    public remove(item: any): void {
        let index = itemIndex(item, this.data);
        this.data.splice(index, 1);

        index = itemIndex(item, this.createdItems);
        if (index >= 0) {
            this.createdItems.splice(index, 1);
        } else {
            this.deletedItems.push(item);
        }

        index = itemIndex(item, this.updatedItems);
        if (index >= 0) {
            this.updatedItems.splice(index, 1);
        }

        super.next(this.data);
    }

    public isNew(item: any): boolean {
        return !item.wosequence;
    }

    public hasChanges(): boolean {
        return Boolean(this.deletedItems.length || this.updatedItems.length || this.createdItems.length);
    }
    

    public saveChanges(): void {
        if (!this.hasChanges()) {
            return;
        }

        const completed = [];
        let woScheduleListParam: any;

        if (this.deletedItems.length) {
            // completed.push(this.fetch(REMOVE_ACTION, this.deletedItems));
        }

        if (this.updatedItems.length) {
            woScheduleListParam = this.updatedItems[0];
            completed.push(this.bulkUpdatePaymentSchedule(this.updatedItems));
        }

        if (this.createdItems.length) {
            // completed.push(this.fetch(CREATE_ACTION, this.createdItems));
        }

        this.reset();
        zip(...completed).subscribe(() => this.read(woScheduleListParam));
    }


    public updateChanges(changesFor, reqParams): void {
        if (!this.hasChanges()) {
            return;
        }

        const completed = [];
        let gridParam: any;

        if (typeof changesFor == "boolean") {
            if (this.serviceFor == "valuation") {
                const { userId, ps } = reqParams;
                gridParam = ps;
                const params = { struserid: userId, model: this.updatedItems }
                if (changesFor) {
                    completed.push(this.setValuationToZeroPayment(params));
                } else {
                    completed.push(this.updateWorksOrderAssetValuation(params));
                }
            }
        }

        if (completed.length == 0) return;

        zip(...completed).subscribe((data) => {
            if (data[0] != undefined) {
                const resp: any = data[0];
                if (resp.isSuccess) {
                    if (resp.data.validYN == "Y") {
                        this.alertService.success(resp.data.validationMessage);
                        this.reset();
                        this.read(gridParam)
                    } else this.alertService.error(resp.data.validationMessage);
                } else this.alertService.error(resp.message)
            }

        });
    }

    public cancelChanges(): void {
        this.reset();
        this.data = this.originalData;
        this.originalData = cloneData(this.originalData);
        super.next(this.data);
    }

    public assignValues(target: any, source: any): void {
        Object.assign(target, source);
    }

    public reset() {
        this.data = [];
        this.deletedItems = [];
        this.updatedItems = [];
        this.createdItems = [];
        super.next([]);
    }

    private serializeModels(data?: any): string {
        return data ? `&models=${JSON.stringify(data)}` : '';
    }

    //edit payment schedule api
    private getWOScheduleData({ wprsequence, wosequence }) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersPaymentScheduleForWorksOrder?wprsequence=${wprsequence}&wosequence=${wosequence}`, this.httpOptions)
            .pipe(map(res => <any[]>res));

    }

    private bulkUpdatePaymentSchedule(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/BulkUpdateWorksOrderPaymentSchedule`, params, this.httpOptions);
    }


    //valuation api
    private getValuation({ wosequence, wpspaymentdate }) {
        const paymentdate = this.helperService.getMDY(wpspaymentdate);
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWebWorksOrdersAssetValuation?wosequence=${wosequence}&paymentdate=${paymentdate}`, this.httpOptions)
            .pipe(map(res => <any[]>res));
    }

    public getAssetValuationTotal({ wosequence, wpspaymentdate }) {
        const paymentdate = this.helperService.getMDY(wpspaymentdate);
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWebWorksOrdersAssetValuationTotal?wosequence=${wosequence}&paymentdate=${paymentdate}`, this.httpOptions)
            .pipe(map(res => <any[]>res));
    }

    private setValuationToZeroPayment(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetValuationToZeroPayment`, params, this.httpOptions);
    }

    private updateWorksOrderAssetValuation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderAssetValuation`, params, this.httpOptions);
    }



}
