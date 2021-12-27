export interface User {
    name: string;
    email: string;
    phoneNumber: string;
}

export interface Lawcase {
    id: number;
    caseName: string;
    caseNumber: string;
    caseContent: string;
}

export interface ShouXu {
    id: number
    caseID: number
    createDate: string
    company: string

    docNumber: string
    requestUser1: string
    requestUser2: string
}

export interface Chaxun extends ShouXu {
    queryType: string
    queryContent: string
}

export interface Dongjie extends ShouXu {
    freezeNumber: string
    freezeMoney: string
    freezeName: string
    other?: string
    unfreezeCreateDate?: string
    unfreezeDocNumber?: string
}

export interface ShouxuType {
    label?: string;
    value: string;
}

export const chaxunType:ShouxuType = { label: '查询', value: 'chaxun' }
export const dongjieType:ShouxuType = { label: '冻结', value: 'dongjie' }

export enum PhpFunctionName {
    INSERT = 'insert',
    UPDATE = 'update',
    DEL = 'del',
    SELECT_LAST_DOCUMENT_NUMBER = "selectLastDocNumber",
    GET_SELECT_RESULT = "getSelectResult",
    SELECT_CASES = "selectCases",
    SELECT_CASE_ITEMS = "selectCaseItems"
}

export interface ConfigData {
    company: any[];
    bankBin: any;
    user: User[];
    queryType: string[];
    unit: string;
    unit_1: string;
    unit_2: string;
    unit_3: string;
    freezeType: string[];
    unFreezeType: string[];
}

export interface DataState {
    lawcases?: Lawcase[];
    selectedCase?: Lawcase;
    shouxuType?: ShouxuType;
    shouxuData?: any[];
    shouxuItem?:any;
    isSeal?: boolean;
    unFreezeDocnumber?:number;
}
