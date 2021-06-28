export class WorkOrdersPaymentScheduleModel {
    mPgoA: string
    mPgpA: string
    mPgqA: string
    mPgrA: string
    mPgsA: string
    mPgtA: string
    miN_PAYMENTDATE: string
    woname: string
    wosequence: number
    wprsequence: number
    wpsactualcount: number = 0
    wpsactualworkvalue: number = 0
    wpscontractcostvalue: number = 0
    wpsenddate: string
    wpsestimatedpaymentvalue: number = 0
    wpsestimatedretentionvalue: number = 0
    wpsfixedpaymentvalue: number = 0
    wpspaymentdate: string
    wpspaymentstatus: string
    wpsplannedcount: number = 0
    wpsplannedworkvalue: number = 0
    wpsreleasedretentionvalue: number = 0
    wpsretentionpct: number = 0
    wpsretentionvalue: number = 0
    wpsstartdate: string
    wpstargetcount: number = 0
    wpstargetworkvalue: number = 0
    wpsvaluation: number = 0

}
