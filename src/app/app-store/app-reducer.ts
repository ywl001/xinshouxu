import { Action, ActionReducerMap, createReducer, on } from "@ngrx/store"
import {
    action_loadConfigDataSuccess,
    action_getAllCaseSuccess,
    action_getShouxuDataSuccess,
    action_shouxuTypeChange,
    action_isSealChange,
    action_updateLawcaseSuccess,
    action_insertShouxuSuccess,
    action_delShouxuSuccess,
    action_clickLawcase,
    action_insertCaseSuccess,
    action_clearShouxuItem,
    action_getUfreezeDocnumberSuccess,
    action_updateUnfreezeDataSuccess,
    action_saveShouxuItem
} from "./app-actions"
import { DataState, Lawcase } from "./app-entities"

const initConfigDataState = {}
export const configDataReducer = createReducer(
    initConfigDataState,
    on(action_loadConfigDataSuccess, (state, configData) => configData),
)


const initDataState: DataState = { shouxuType: { label: "查询", value: "chaxun" }, isSeal: true }
export const caseReducer = createReducer(
    initDataState,
    //获取所有案件成功，设置值
    on(action_getAllCaseSuccess, (state, action) => ({ ...state, lawcases: action.lawcases })),
    //获取案件手续成功，设置值
    on(action_getShouxuDataSuccess, (state, action) => ({ ...state, shouxuData: action.data })),
    //选择案件后，存储值
    on(action_clickLawcase, (state, action) => ({ ...state, selectedCase: action.lawcase })),
    //手续类型改变后，存储值
    on(action_shouxuTypeChange, (state, action) => {
        console.log('reducer save shouxu state')
        return { ...state, shouxuType: action.shouxuType }
    }),

    on(action_clearShouxuItem, (state, action) => ({ ...state, shouxuItem: null })),

    //设置是否显示印章
    on(action_isSealChange, (state, action) => {
        return { ...state, isSeal: action.isSeal }
    }),

    on(action_saveShouxuItem, (state, action) => {
        return { ...state, shouxuItem: action.data }
    }),


    //插入案件成功后，添加到所有案件中
    on(action_insertCaseSuccess, (state, action) => {
        let arr = state.lawcases.slice()
        arr.unshift(action.data)
        return { ...state, lawcases: arr }
    }),
    on(action_updateLawcaseSuccess, (state, action) => {
        const c: Lawcase = action.data
        let arr = state.lawcases.slice()
        const index = arr.findIndex(e => e.id == c.id);
        arr.splice(index, 1, c)
        return { ...state, lawcases: arr, selectedCase: c }
    }),

    on(action_insertShouxuSuccess, (state, action) => {
        let arr = state.shouxuData.slice()
        arr.unshift(action.data)
        console.log(action)
        return { ...state, shouxuData: arr,shouxuItem:action.data}
    }),

    on(action_delShouxuSuccess, (state, action) => {
        let arr = state.shouxuData.slice()
        const index = arr.findIndex(e => e.id == action.data.id);
        arr.splice(index, 1)
        return { ...state, shouxuData: arr }
    }),

    on(action_getUfreezeDocnumberSuccess, (state, action) => {
        return { ...state, unFreezeDocnumber: action.docnumber }
    }),

    on(action_updateUnfreezeDataSuccess, (state, action) => {
        let arr = state.shouxuData.slice();
        console.log(arr)
        console.log(action)
        const index = arr.findIndex(e => e.id == action.data.id);
        let o = {...arr[index]};
        console.log(o)
        o['unfreezeDocNumber'] = action.data.tableData.unfreezeDocNumber;
        o['unfreezeCreateDate'] = action.data.tableData.unfreezeCreateDate;

        arr.splice(index, 1, o)
        return { ...state, shouxuData: arr,shouxuItem:o }
    })
)

