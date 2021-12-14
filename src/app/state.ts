export class State {
    label!:string;
    value!:string;
    static chaxun = {label:'查询',value:'chaxun'};
    static dongjie = {label:'冻结',value:'dongjie'};
    static currentState:State = State.chaxun;
}