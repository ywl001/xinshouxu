import { Moment } from "moment";
import { Shouxu } from "./shouxu";

export interface Dongjie extends Shouxu{
    freezeName?:string;
    freezeNumber?:string;
    freezeMoney?:string;
    unfreezeDocNumber?:string;
    unfreezeCreateDate?:Moment;
}