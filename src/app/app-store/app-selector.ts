import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ConfigData, DataState } from "./app-entities";
import * as pinyin from 'pinyin'

export const selector_configData = createFeatureSelector<ConfigData>('configData');

export const selector_dataState = createFeatureSelector<DataState>('appData');

export const selector_user = createSelector(
    selector_configData,
    state => state.user
)

export const selector_allCompany = createSelector(
    selector_configData,
    state => state.company
)

export const selector_unit = createSelector(
    selector_configData,
    state => state.unit
)
export const selector_unit1 = createSelector(
    selector_configData,
    state => state.unit_1
)
export const selector_unit2 = createSelector(
    selector_configData,
    state => state.unit_2
)
export const selector_unit3 = createSelector(
    selector_configData,
    state => state.unit_3
)
export const selector_bankBin = createSelector(
    selector_configData,
    state => state.bankBin
)
export const selector_freezeType = createSelector(
    selector_configData,
    state => state.freezeType
)
export const selector_queryType = createSelector(
    selector_configData,
    state => state.queryType
)
export const selector_unFreezeType = createSelector(
    selector_configData,
    state => state.unFreezeType
)

export const selector_allCase = createSelector(
    selector_dataState,
    state => state.lawcases
)

export const selector_shouxuData = createSelector(
    selector_dataState,
    state => state.shouxuData
)

export const selector_selectedCase = createSelector(
    selector_dataState,
    state => state.selectedCase
)

export const selector_shouxuType = createSelector(
    selector_dataState,
    state => state.shouxuType
)

export const selector_isSeal = createSelector(
    selector_dataState,
    state => state.isSeal
)

export const selector_unFreezeDocnumber = createSelector(
    selector_dataState,
    state => state.unFreezeDocnumber
)

export const selector_shouxuItem = createSelector(
    selector_dataState,
    state => state.shouxuItem
)



