import { createAction, props } from "@ngrx/store";
import { ConfigData, Lawcase, ShouxuType } from "./app-entities";


export enum ActionType {
    LOAD_CONFIG_DATA_SUCCESS = "loadConfigDataSuccess",
    GET_ALL_LAWCASE = "getAllCase",
    GET_ALL_LAWCASE_SUCCESS = "getAllCaseSuccess",
    LOAD_CONFIG_DATA = "loadConfigData",
    FILTER_LAWCASE = "filterLawcases",
    INSERT_LAWCASE = "insertLawcase",
    INSERT_LAWCASE_SUCCESS = "insertLawcaseSuccess",
    INSERT_SHOUXU = "insertShouxu",
    INSERT_SHOUXU_SUCCESS = "insertShouxuSuccess",
    UPDATE_LAWCASE = "updateLawcase",
    UPDATE_LAWCASE_SUCCESS = "updateLawcaseSuccess",
    DEL_SHOUXU = "delShouxu",
    DEL_SHOUXU_SUCCESS = "delShouxuSuccess",
    CLICK_LAWCASE = "clickLawcase",
    SAVE_SHOUXU_ITEM = "saveShouxuItem",
    GET_SHOUXU_DATA = "getShouxuData",
    GET_SHOUXU_DATA_SUCCESS = "getShouxuDataSuccess",
    FILTER_COMPANY = "filterCompany",
    SHOUXU_TYPE_CHANGE = "shouxuStateChange",
    SEAL_CHANGE = "isSealChange",
    CLEAR_SHOUXU_ITME = "clearShouxuItem",
    GET_UNFREEZE_DOCNUMBER = "getUnfreezeDocnumber",
    GET_UNFREEZE_DOCNUMBER_SUCCESS = "getUnfreezeDocnumberSuccess",
    UPDATE_UNFREEZE_DATA="updateUnfreezeData",
    UPDATE_UNFREEZE_DATA_SUCCESS="updateUnfreezeDataSuccess"
} 

//获取配置信息
export const action_loadConfigData = createAction(ActionType.LOAD_CONFIG_DATA);
export const action_loadConfigDataSuccess = createAction(ActionType.LOAD_CONFIG_DATA_SUCCESS, props<ConfigData>());

//获取案件列表
export const action_getAllCase = createAction(ActionType.GET_ALL_LAWCASE);
export const action_getAllCaseSuccess = createAction(ActionType.GET_ALL_LAWCASE_SUCCESS, props<{ lawcases: Lawcase[] }>());
//存储当前选择案件
export const action_clickLawcase = createAction(ActionType.CLICK_LAWCASE,props<{lawcase:Lawcase}>())
//插入案件
export const action_insertLawase = createAction(ActionType.INSERT_LAWCASE, props<{ data: any }>())
export const action_insertCaseSuccess = createAction(ActionType.INSERT_LAWCASE_SUCCESS, props<{ data: Lawcase }>())
/**更新案件信息 参数data带有表名、id和数据 */
export const action_updateLawcase = createAction(ActionType.UPDATE_LAWCASE, props<{ data: any }>())
export const action_updateLawcaseSuccess = createAction(ActionType.UPDATE_LAWCASE_SUCCESS, props<{ data: Lawcase }>())

//获取案件手续
export const action_getShouxuData = createAction(ActionType.GET_SHOUXU_DATA)
export const action_getShouxuDataSuccess = createAction(ActionType.GET_SHOUXU_DATA_SUCCESS,props<{data}>())
// 存储清除当前选择手续
export const action_clearShouxuItem = createAction(ActionType.CLEAR_SHOUXU_ITME);
export const action_saveShouxuItem = createAction(ActionType.SAVE_SHOUXU_ITEM,props<{data:any}>())
//插入手续
export const action_insertShouxu = createAction(ActionType.INSERT_SHOUXU, props<{ data: any }>())
export const action_insertShouxuSuccess = createAction(ActionType.INSERT_SHOUXU_SUCCESS, props<{ data: any }>())
//删除手续
export const action_delShouxu = createAction(ActionType.DEL_SHOUXU, props<{data:any}>())
export const action_delShouxuSuccess = createAction(ActionType.DEL_SHOUXU_SUCCESS, props<{data:any}>())

//印章变化信息
export const action_isSealChange = createAction(ActionType.SEAL_CHANGE,props<{isSeal:boolean}>())
//手续类型变化
export const action_shouxuTypeChange = createAction(ActionType.SHOUXU_TYPE_CHANGE,props<{shouxuType:ShouxuType}>())

//获取解冻法律文书编号
export const action_getUnfreezeDocumber = createAction(ActionType.GET_UNFREEZE_DOCNUMBER);
export const action_getUfreezeDocnumberSuccess = createAction(ActionType.GET_UNFREEZE_DOCNUMBER_SUCCESS,props<{docnumber:number}>());
//更新解冻信息
export const action_updateUnfreezeData= createAction(ActionType.UPDATE_UNFREEZE_DATA,props<{data:any}>());
export const action_updateUnfreezeDataSuccess = createAction(ActionType.UPDATE_UNFREEZE_DATA_SUCCESS,props<{data:any}>());






