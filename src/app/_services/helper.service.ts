import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { Observable, Subject } from 'rxjs';
import { SharedService } from '../_services/shared.service';
import * as moment from "moment";
import { anyChanged } from '@progress/kendo-angular-grid/dist/es2015/utils';
import { SubSink } from 'subsink';
import { EventService } from './event.service';
import { WorksorderManagementService } from './works-order/worksorder-management.service';



@Injectable({
    providedIn: 'root',
})

export class HelperService {
    subs = new SubSink();
    assetData: any;
    month_names = ["Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"];

    constructor(
        private sharedService: SharedService,
        private notificationService: EventService,
        private worksorderManagementService: WorksorderManagementService,
    ) { }

    public exportAsExcelFile(json: any[], excelFileName: string, labels): void {
        const keys = Object.keys(labels);
        const arrayLen = keys.length - 1;
        const jsnArr = json.map(row => {
            const arr = new Object();
            keys.filter((k, i) => {

                if (row[k] != null || row[k] != undefined) {
                    arr[labels[k]] = row[k];
                }
                if (i == arrayLen) {
                    return arr;
                }
            })
            return arr;
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsnArr);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public exportToexcelWithAssetDetails(json: any[], excelFileName: string, labels): void {
        this.sharedService.sharedAsset.subscribe(res => { this.assetData = res });
        const keys = Object.keys(labels);
        const arrayLen = keys.length - 1;
        const jsnArr = json.map(row => {
            const arr = new Object();
            arr['Asset ID'] = this.assetData.assetId;
            arr['Address'] = this.assetData.address;
            keys.filter((k, i) => {

                if (row[k] != null || row[k] != undefined) {
                    arr[labels[k]] = row[k];
                }
                if (i == arrayLen) {
                    return arr;
                }
            })
            return arr;
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsnArr);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);

    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    }

    exportAsHtmlFile(json: any[], fileName: string, labels) {
        const keys = Object.keys(labels);
        const arrayLen = keys.length - 1;
        const jsnArr = json.map(row => {
            const arr = new Object();
            keys.filter((k, i) => {
                if (row[k] != null || row[k] != undefined) {
                    arr[labels[k]] = row[k];
                }
                if (i == arrayLen) {
                    return arr;
                }
            })
            return arr;
        });

        const htmlContent = this.createHtmlContent(jsnArr, labels);
        const blob = new Blob([htmlContent], { type: 'html/plain;charset=utf-8;' });

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, fileName);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

    }

    private createHtmlContent(data, labels) {
        var table = '<table border="1" style="border-collapse:collapse"><thead><tr>';
        var tr = '';
        for (let head in labels) {
            tr += `<th>${labels[head]}</th>`;
        }
        tr += '</tr>';
        for (let td of data) {
            tr += '<tr>';
            for (let hd in labels) {
                tr += `<td>${td[labels[hd]]}</td>`;
            }
        }
        tr += '</tr>';
        table += tr;
        return table;

    }


    exportToCsv(filename: string, rows: object[], ignore: any, label: any) {
        if (!rows || !rows.length) {
            return;
        }
        const separator = ',';
        const keys = Object.keys(label);
        const csvContent =
            keys.map(r => {
                return label[r];
            }).join(separator) +
            '\n' +
            rows.map(row => {
                return keys.map(k => {
                    let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                    cell = cell instanceof Date
                        ? cell.toLocaleString()
                        : cell.toString().replace(/"/g, '""');
                    if (cell.search(/("|,|\n)/g) >= 0) {
                        cell = `"${cell}"`;
                    }
                    return cell;
                }).join(separator);
            }).join('\n');

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }


    moneyFormat(value) {
        if (isNaN(Number(value)) || value == "" || value == null) { return "0.00"; }
        return parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    dateFormat(val) {
        if (val != "" && val != undefined) {
            let newdate = this.replaceAll(val, '/', '-').split('-');

            let date = new Date(`${newdate[2]}-${newdate[1]}-${newdate[0]}`);
            let day = (date.getDate() < 10 ? '0' : '') + date.getDate();;
            let month_index = date.getMonth();
            let year = date.getFullYear();
            const formatedDate = "" + day + "-" + this.month_names[month_index] + "-" + year;
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate;
        } else {
            return null;
        }

    }

    formatDateTime(d) {
        if (d != "" && d != undefined) {
            const date = new Date(d);

            let hours = date.getHours();
            let minutes: any = date.getMinutes();

            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            const formatedDate = "" + this.zeorBeforeSingleDigit(date.getDate()) + "-" + this.month_names[date.getMonth()] + "-" + date.getFullYear();
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate + " " + strTime;

        } else {
            return null;
        }
        //return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }

    // for IE
    formatDateTime1(d) {
        if (d != "" && d != undefined) {
            const date = new Date(d);

            let ua = window.navigator.userAgent;
            let IExplorerAgent = ua.indexOf("MSIE") > -1 || ua.indexOf("rv:") > -1;

            if (IExplorerAgent) {
                let spaceSplit = d.split(" ");
                if (spaceSplit.length > 1) {
                    let datesplit = spaceSplit[0].split("-");
                    if (datesplit.length > 0) {
                        if (datesplit[0] == 1753) {
                            return "";
                        }
                        let mn = datesplit[1].replace(/^0+/, '');
                        //console.log(this.month_names[mn]);
                        let tm = "";
                        if (spaceSplit[1] != undefined) {
                            let timeSplit = spaceSplit[1].split(":");
                            if (timeSplit.length == 3) {
                                let ampm = timeSplit[0] >= 12 ? 'pm' : 'am';
                                let hr = timeSplit[0];
                                let mn = timeSplit[1];
                                hr = hr % 12;
                                hr = hr ? hr : 12;
                                mn = mn < 10 && mn > 0 ? '' + mn : mn;
                                tm = hr + ":" + mn + " " + ampm
                            }
                        }


                        return datesplit[2] + "-" + this.month_names[mn - 1] + "-" + datesplit[0] + " " + tm
                    }

                }
                return "";
            }

            let hours = date.getHours();
            let minutes: any = date.getMinutes();

            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            const formatedDate = "" + this.zeorBeforeSingleDigit(date.getDate()) + "-" + this.month_names[date.getMonth()] + "-" + date.getFullYear();
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate + " " + strTime;

        } else {
            return null;
        }
        //return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }




    formatDateMDYwithTime(d) {
        if (d != "" && d != undefined) {
            let newDate: any;
            if (d.includes('/')) {
                let tempnewDate = moment(d).format('MM/DD/YYYY');
                console.log(tempnewDate)
                // let tempnewDate = this.replaceAll(d, '/', '-').split('-');
                // newDate = `${tempnewDate[1]}/${tempnewDate[0]}/${tempnewDate[2]}`
                // console.log(newDate);
                debugger
            } else {
                newDate = d;
            }

            const date = new Date(newDate);

            let hours = date.getHours();
            let minutes: any = date.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            const formatedDate = "" + (date.getMonth() + 1) + "/" + this.zeorBeforeSingleDigit(date.getDate()) + "/" + date.getFullYear();
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate + " " + strTime;

        } else {
            return null;
        }
        //return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }



    formatDateWithoutTime(d) {
        if (d != "" && d != undefined) {
            const date = new Date(d);
            let hours = date.getHours();
            let minutes: any = date.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            const formatedDate = "" + this.zeorBeforeSingleDigit(date.getDate()) + "-" + this.month_names[date.getMonth()] + "-" + date.getFullYear();
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate;

        } else {
            return null;
        }
        //return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }

    formatDateWithoutTimeWithCheckDateObj(d) {
        if (d != "" && d != undefined) {
            let date: any;
            if (d instanceof Date) {
                date = d;
            } else {
                date = new Date(d);
            }

            let hours = date.getHours();
            let minutes: any = date.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            const formatedDate = "" + this.zeorBeforeSingleDigit(date.getDate()) + "-" + this.month_names[date.getMonth()] + "-" + date.getFullYear();
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate;

        } else {
            return null;
        }
        //return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }


    formatDateWithoutTimeYMD(d) {
        if (d != "" && d != undefined) {
            const date = new Date(d);
            let hours = date.getHours();
            let minutes: any = date.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            const formatedDate = "" + this.zeorBeforeSingleDigit(date.getFullYear()) + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            if (formatedDate == '01-Jan-1753') {
                return null;
            }
            return formatedDate;

        } else {
            return null;
        }
        //return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
    }



    ddmmyyFormat(inputFormat, hyphen = false) {
        let d = new Date(inputFormat)

        if (hyphen) {
            return [this.zeorBeforeSingleDigit(d.getDate()), this.zeorBeforeSingleDigit(d.getMonth() + 1), d.getFullYear()].join('-')
        } else {
            return [this.zeorBeforeSingleDigit(d.getDate()), this.zeorBeforeSingleDigit(d.getMonth() + 1), d.getFullYear()].join('/')
        }

    }

    replaceAll(str, term, replacement) {
        return str.replace(new RegExp(this.escapeRegExp(term), 'g'), replacement);
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    selectedAvailableAttributeObs: Subject<any> = new Subject<any>();

    setSelectedAvailableAttr(attr) {
        this.selectedAvailableAttributeObs.next(attr);
    }

    assetManagementSecurityObs: Subject<any> = new Subject<any>();

    setAssetManagementSecurity(data) {
        this.assetManagementSecurityObs.next(data);
    }

    checkAssetManagementAccess(data, param) {
        if (data != undefined) {
            if (data.find(d => d == param) != undefined) {
                return true
            } else {
                return false;
            }
        }
        return false;
    }

    ngbDatepickerFormat(val) {
        if (val != "" && val != " " && val != null) {
            const date = new Date(val.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
            if (date.getFullYear() <= 1753) {
                return "";
            }
            return {
                "day": date.getDate(),
                "year": date.getFullYear(),
                "month": date.getMonth() + 1
            }
        }
        return "";
    }

    getFileSizeUnit(size) {
        let sizeU;
        let unit;
        if (size < 1000) {
            sizeU = size;
            unit = "bytes";
        } else if (size < 1000 * 1000) {
            sizeU = size / 1000;
            unit = "kb";
        } else if (size < 1000 * 1000 * 1000) {
            sizeU = size / 1000 / 1000;
            unit = "mb";
        } else {
            sizeU = size / 1000 / 1000 / 1000;
            unit = "gb";
        }
        // check if value is float
        if (sizeU % 1 != 0) {
            sizeU = sizeU.toFixed(2);
        }

        return sizeU + unit;
    }


    checkValidDate(date) {
        //const dt = `${date.year}-${date.month}-${date.day}`;
        const dt = `${this.zeorBeforeSingleDigit(date.day)}/${this.zeorBeforeSingleDigit(date.month)}/${date.year}`;
        const dateObj = moment(dt, "DD/MM/YYYY", true);
        if (isNaN(dateObj.year()) || isNaN(dateObj.month()) || isNaN(dateObj.date())) {
            return false;
        }
        if (dateObj.isValid()) {
            return true;
        }

        return false;


    }

    zeorBeforeSingleDigit(n) {
        const result = Number(n);
        if (result < 10) {
            return "0" + result;
        } else {
            return result;
        }
    }


    setNgbDate2(val) {
        if (val != "" && val != " ") {
            const date = moment(val, "DD/MM/YYYY", true);
            if (date.isValid()) {
                return {
                    "year": date.year(),
                    "month": date.month() + 1,
                    "day": date.date(),
                }
            }
            return val;
        }
        return "";
    }


    checkServicePortalTabInArr(arr: any) {
        const tabArr = ["Service Details Tab", "Service Attribute Tab", "Service History Tab", "Service Info Tab", "Service Notepads Tab", "Resident Contacts Tab"];
        let res = false;
        tabArr.forEach((v) => {
            if (arr.indexOf(v) !== -1 && arr.indexOf('Management Tab')) {
                res = true;
            }
        });
        return res;
    }



    checkValidRange(rangeArr, lowerInp, higherInp, range) {
        //console.log({ rangeArr, lowerInp, higherInp, range })
        let highest = range.max;
        let lowest = range.min;
        let isTrue: boolean = true;
        let isValid: boolean = true;
        let isInpHigher: boolean = false;
        let isInpLower: boolean = false;
        let checkVlaueExist = rangeArr.some(x => x.hasrisklower == lowerInp || x.hasriskupper == lowerInp || x.hasriskupper == higherInp || x.hasrisklower == higherInp);
        if (checkVlaueExist) {
            return false;
        }

        if ((lowerInp >= lowest && lowerInp <= highest) && (higherInp <= highest)) {
            rangeArr.forEach((v, i) => {
                if (isValid) {
                    isValid = this.checkOtherRangeExistInThisRange(v, lowerInp, higherInp, isValid);
                    // isTrue = true;
                    // if (((lowerInp > v.hasrisklower && lowerInp > higherInp) && (higherInp > v.hasrisklower && higherInp > v.hasriskupper) || (lowerInp < v.hasrisklower && lowerInp < v.hasriskupper) && (higherInp < v.hasrisklower && higherInp < v.hasriskupper))) {
                    //     isTrue = true;
                    // } else {
                    //     isTrue = false;
                    // }
                } else {
                    isTrue = false;
                }
            });
        } else if ((lowerInp < lowest) && (higherInp < lowest)) {
            isTrue = true;
        } else if ((lowerInp < lowest) && (higherInp > lowest)) {
            isInpLower = true;
        } else {
            isTrue = false;
            isInpHigher = true;
        }

        return { isTrue: isTrue, isInpHigher: isInpHigher, isInpLower: isInpLower, lowest: lowest, highest: highest };
    }

    checkOtherRangeExistInThisRange(v, lowerInp, higherInp, isValid) {
        if ((v.hasrisklower >= lowerInp && v.hasrisklower <= higherInp) && (v.hasriskupper >= lowerInp && v.hasriskupper <= higherInp)) {
            isValid = false
        } else {
            isValid = true;
        }
        return isValid;
    }


    checkNDateReturnDDMMYY(date) {
        let slash = moment(date, "DD/MM/YYYY", true);
        if (slash.isValid()) {
            return `${this.zeorBeforeSingleDigit(slash.date())}/${this.zeorBeforeSingleDigit(slash.month() + 1)}/${this.zeorBeforeSingleDigit(slash.year())}`;
        } else {
            return this.ddmmyyFormat(date)
        }
    }

    ddmmyyywithslash(val, strType = true) {
        if (val != "" && val != " ") {
            let modifiedDate = val;
            if (val.indexOf('-') !== -1) {
                modifiedDate = this.replaceAll(val, '-', '/');
            }

            if (strType) {
                const slash = moment(modifiedDate, "DD/MM/YYYY", true);
                if (slash.isValid()) {
                    return `${this.zeorBeforeSingleDigit(slash.date())}/${this.zeorBeforeSingleDigit(slash.month() + 1)}/${this.zeorBeforeSingleDigit(slash.year())}`;
                }

            } else {
                const date = moment(modifiedDate, "DD/MM/YYYY", true);
                if (date.isValid()) {
                    return {
                        "year": date.year(),
                        "month": date.month() + 1,
                        "day": date.date(),
                    }
                }
            }
        }
        return "";
    }


    checkValidDateR(d) {
        let date: any
        if (d instanceof Date) {
            date = d;
        } else {
            date = new Date(d);
        }

        if (date.getFullYear() < 1900) {
            return '';
        }

        return date
    }

    convertMoneyToFlatFormat(val) {
        val = typeof val == "number" ? val.toString() : val;
        return val == "" ? val : val.replace(/[^0-9.]+/g, '');
    }


    updateNotificationOnTop() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.subs.add(
            this.notificationService.eventSummary(currentUser.userId).subscribe(
                notification => {
                    this.sharedService.changeUserNotification(notification.data)
                }
            )
        )
    }

    getWorkOrderSecurity(wo) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.subs.add(
            this.worksorderManagementService.workOrderUserSecurity(currentUser.userId, wo).subscribe(
                wosecurtiy => {
                    // console.log(wosecurtiy)
                    this.sharedService.changeWoSecurity(wosecurtiy.data)
                }
            )
        )
    }


    getUserTypeWithWOAndWp(wo, wp) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.subs.add(
            this.worksorderManagementService.getUserTypeDetails(wo, wp, currentUser.userId).subscribe(
                userType => {
                    // console.log(wosecurtiy)
                    this.sharedService.changeUserType(userType.data)
                }
            )
        )
    }


    yesterday() {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let yesterdayObj = {
            year: yesterday.getFullYear(),
            month: yesterday.getMonth() + 1,
            day: yesterday.getDate()
        }

        return yesterdayObj;
    }


    dateObjToString(value) {
        if (value == undefined || typeof value == 'undefined' || typeof value == 'string') {
            return new Date('1753-01-01').toJSON()
        }
        const dateStr = `${value.year}-${this.zeorBeforeSingleDigit(value.month)}-${this.zeorBeforeSingleDigit(value.day)}`;
        return new Date(dateStr).toJSON()
    }

 
    getDateString(type = "Today") {
        let todayDateObj = new Date();

        if (type == "Tomorrow") {
            let tomDateObj = new Date(todayDateObj);
            tomDateObj.setDate(todayDateObj.getDate() + 1);
            return `${this.zeorBeforeSingleDigit(tomDateObj.getFullYear())}-${this.zeorBeforeSingleDigit(tomDateObj.getMonth() + 1)}-${this.zeorBeforeSingleDigit(tomDateObj.getDate())}`;
        }

        if (type == "Next 7") {
            let next7DateObj = new Date(todayDateObj);
            next7DateObj.setDate(todayDateObj.getDate() + 7);
            return `${this.zeorBeforeSingleDigit(next7DateObj.getFullYear())}-${this.zeorBeforeSingleDigit(next7DateObj.getMonth() + 1)}-${this.zeorBeforeSingleDigit(next7DateObj.getDate())}`;
        }

        if (type == "Yesterday") {
            let yesterdayDateObj = new Date(todayDateObj);
            yesterdayDateObj.setDate(todayDateObj.getDate() - 1);
            return `${this.zeorBeforeSingleDigit(yesterdayDateObj.getFullYear())}-${this.zeorBeforeSingleDigit(yesterdayDateObj.getMonth() + 1)}-${this.zeorBeforeSingleDigit(yesterdayDateObj.getDate())}`;
        }

        //Default Today
        return `${this.zeorBeforeSingleDigit(todayDateObj.getFullYear())}-${this.zeorBeforeSingleDigit(todayDateObj.getMonth() + 1)}-${this.zeorBeforeSingleDigit(todayDateObj.getDate())}`;

    }


}