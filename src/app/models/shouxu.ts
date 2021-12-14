import { Moment } from "moment";

export interface Shouxu{
    id?:number;
    caseID?:number;
    company?:string;
    docNumber?:string;
    createDate?:Moment;
    requestUser1?:string;
    requestUser2?:string;
}