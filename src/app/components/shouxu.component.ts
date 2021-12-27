import { Component } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import * as pinyin from "pinyin";
import * as html2pdf from 'html2pdf.js';
import * as toastr from 'toastr'
import { Observable, Subscription } from "rxjs";
import { mergeMap, startWith, map } from "rxjs/operators";
import { AppInjector } from "../app-injector";
import { action_clearShouxuItem, action_insertShouxu } from "../app-store/app-actions";
import { Lawcase, ShouxuType } from "../app-store/app-entities";
import { selector_selectedCase, selector_user, selector_queryType, selector_bankBin, selector_unit, selector_unit1, selector_unit2, selector_unit3, selector_isSeal, selector_allCompany } from "../app-store/app-selector";
import { MessageService } from "../services/message.service";


@Component({
    template: ''
})

export abstract class ShouxuComponent {

    isSeal$

    //公共变量
    //填表人选择列表
    users$
    //单位
    unit$
    //单位的法律文号，例如吉公
    unit_1$:Observable<string>;
    //小单位，刑事警察大队
    unit_2$;
    //小单位缩写
    unit_3$:Observable<string>;;

    companys$;
    queryTypes$;
    bankBin$;

    lawcase$;
    lawcase: Lawcase;
    shouxuType: ShouxuType

    //是否显示手续，class绑定
    isShowTable = 'none';

    //注入的各種服務
    dialog: MatDialog;
    // sql: SQLService;
    message: MessageService;
    fb: FormBuilder;
    store: Store;

    //表单组的实例，子类实现
    group: FormGroup;

    get createDate() {
        return this.getFcVal('createDate')
    }

    get createDate_str() {
        return this.getFcVal('createDate').format('YYYY年MM月DD日')
    }

    get docNumber() {
        return this.getFcVal('docNumber')
    }

    get company() {
        return this.getFcVal('company')
    }

    private saveImageSubscription: Subscription;
    private saveDataSubscription: Subscription;

    // ChangeDetectorRef必须保留注入子类并传递到super() 无法在父类中直接注入
    // cdr:ChangeDetectorRef;
    constructor() {
        console.log('shou xu constructor')
        const injector = AppInjector.getInjector();
        this.dialog = injector.get(MatDialog);
        this.message = injector.get(MessageService);
        this.fb = injector.get(FormBuilder);
        this.store = injector.get(Store);
        this.lawcase$ = this.store.select(selector_selectedCase)
    }

    ngOnInit() {
        console.log('shou xu init');
        this.users$ = this.store.select(selector_user);
        this.queryTypes$ = this.store.select(selector_queryType);
        this.bankBin$ = this.store.select(selector_bankBin);
        this.unit$ = this.store.select(selector_unit);
        this.unit_1$ = this.store.select(selector_unit1);
        this.unit_2$ = this.store.select(selector_unit2);
        this.unit_3$ = this.store.select(selector_unit3);
        this.isSeal$ = this.store.select(selector_isSeal);

        this.store.dispatch(action_clearShouxuItem())

        this.lawcase$.subscribe(val => this.lawcase = val)

        if (!this.lawcase) {
            toastr.info('请先选择案件')
            //设置表单启用禁用
            this.group.disable();
        }

        //禁用docNumber，自动生成
        this.getFc('docNumber').disable()

        //点击案件列表的监听
        this.message.clickCase$.subscribe(res => {
            this.group.enable();
            this.clear();
        })

        //保存按钮点击的监听
        this.saveDataSubscription = this.message.saveData$.subscribe(() => { this.save() })

        //存图按钮点击的监听
        this.saveImageSubscription = this.message.saveImage$.subscribe(() => {
            this.saveImage()
        })

        this.companys$ = this.store.select(selector_allCompany).pipe(
            mergeMap(arr => this.getFc('company').valueChanges.pipe(
                startWith(''),
                map(val => arr?.filter(item => item.py.toLowerCase().indexOf(val) >= 0 || item.label.indexOf(val) >= 0))
            ))
        )
    }

    ngOnDestroy() {
        console.log('shouxu on destroy');
        this.saveImageSubscription.unsubscribe();
        this.saveDataSubscription.unsubscribe();
    }

    /**通过银行卡号，设置银行名称 */
    setCompanyValueByBankbin(numberInputName: string, companyName: string) {
        this.getFc(numberInputName).valueChanges.subscribe(value => {
            const ids = value?.match(/[\w\.@]{6,}/g);
            if (ids && ids.length > 0 && this.getBankNameByCard(ids[0])) {
                this.setFcVal(companyName, this.getBankNameByCard(ids[0]))
            }
        })
    }

    private getBankNameByCard(idCard: string) {
        if (!idCard)
            return;
        let bankBin;
        this.store.select(selector_bankBin).subscribe(b => bankBin = b)
        for (let i = 10; i > 2; i--) {
            if (bankBin[idCard.substr(0, i)])
                return bankBin[idCard.substr(0, i)];
        }
        return ""
    }

    //子类复写的方法

    //清理表单上显示的数据
    abstract clear();

    //保存数据前的验证数据是否有效
    abstract validate();

    //获取提交保存的数据
    abstract getTableData();

    //子类提供changeDetectorRef的实例，该类无法在基类中注入
    // abstract getCDInstance();

    abstract getImgInfos();

    //获取年月日
    getYear(moment) {
        return moment?.get('year')
    }

    getMonth(moment) {
        return moment?.get('month') + 1;
    }

    getDay(moment) {
        return moment?.get('date');
    }

    //字符串是否为空
    isEmptyStr(str: string) {
        let str1 = str?.trim();
        if (str1 == undefined || str1 == null || str1 == '')
            return true;
        return false;
    }

    //日期转中文
    toChineseDate(moment) {
        // console.log('to chinese date', moment)
        const cn = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九", ''];
        let s = [];

        let YY = moment.year().toString();
        for (var i = 0; i < YY.length; i++) {
            s.push(cn[YY.charAt(i)]);
        }
        s.push("年");

        let MM = moment.month() + 1;
        if (MM < 10)
            s.push(cn[MM]);
        else {
            let second = MM % 10;
            s.push("十")
            if (second != 0) s.push(cn[second])
        }
        s.push('月');

        let d = moment.date();
        if (d < 10) {
            s.push(cn[d])
        } else {
            let first = Math.floor(d / 10);
            if (first == 1) first = 10;
            let second = d % 10;
            if (second == 0) second = 10;
            s.push(cn[first] + '十' + cn[second])
        }
        // console.log(s)
        s.push("日");
        return s.join('');
    }

    get signal_minjing1() {
        if (this.getFcVal('requestUser1')) {
            return `assets/${pinyin(this.getFcVal('requestUser1'), { style: pinyin.STYLE_NORMAL }).join('')}.png`;
        }
        return `assets/jiangmianli.png`
    }

    get signal_minjing2() {
        if (this.getFcVal('requestUser2')) {
            return `assets/${pinyin(this.getFcVal('requestUser2'), { style: pinyin.STYLE_NORMAL }).join('')}.png`;
        }
        return `assets/niumengmeng.png`
    }

    //表单的取值
    getFcVal(controlName: string) {
        return this.group.get(controlName)?.value;
    }

    //设置表单控件的值
    setFcVal(controlName: string, value: any) {
        return this.group.get(controlName)?.setValue(value);
    }

    getFc(name: string) {
        return this.group.get(name)
    }

    //保存图片
    private saveImage() {
        const imgInfos = this.getImgInfos();
        for (let i = 0; i < imgInfos.length; i++) {
            const item = imgInfos[i];
            const element = item.element;
            const imgName = item.imgName;

            const opt = {
                margin: [130, 80, 80, 110],
                filename: imgName,
                image: { type: 'jpeg', quality: 0.8 },
                html2canvas: { scale: 2, letterRendering: true },
                jsPDF: { unit: 'px', format: [795, 1125], orientation: 'p' },
            };

            html2pdf().set(opt).from(element).save();
        }
    }

    //保存数据
    private save() {
        console.log('save shouxu data')
        if (!this.validate()) return;

        //从子类获取保存的数据后统一加上caseID
        let tableData = this.getTableData();
        tableData.caseID = this.lawcase.id;

        let data = {
            tableName: this.shouxuType.value,
            tableData: tableData
        }

        this.store.dispatch(action_insertShouxu({ data: data }))
        toastr.info('手续编号已返回')
    }

    ara2cn(digit: number) {
        const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        const arr2 = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '〇',];
        return arr2[arr1.indexOf(digit)]
    }

}
