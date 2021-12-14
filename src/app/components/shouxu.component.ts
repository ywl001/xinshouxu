import { Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef, Component, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment';
import * as toastr from 'toastr'
import { State } from '../state';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { SQLService } from '../services/sql.service';
import { MessageService } from '../services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { PhpFunctionName } from '../php-function-name';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AppInjector } from '../app-injector';
import * as pinyin from 'pinyin';
import { ActivatedRoute } from '@angular/router';
import * as html2pdf from 'html2pdf.js';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { map, startWith } from 'rxjs/operators';
import { Chaxun } from '../models/chaxun';
import { Dongjie } from '../models/Dongjie';
import { Shouxu } from '../models/shouxu';
import { LawCase } from '../models/lawCase';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    template: ''
})

export abstract class ShouxuComponent {

    private _isSeal: boolean = true;
    public get isSeal(): boolean {
        return this._isSeal;
    }
    public set isSeal(value: boolean) {
        this._isSeal = value;
        this.getCDInstance().markForCheck();
    }

    //公共变量
    //填表人选择列表
    users: Array<any>
    //单位
    unit: string;
    //单位的法律文号，例如吉公
    unit_1: string;
    //小单位，刑事警察大队
    unit_2: string;
    //小单位缩写
    unit_3:string;

    //案件信息
    // lawCase: LawCase;

    //表单组的实例，子类实现
    group: FormGroup;

    //手续信息对象
    // model: Shouxu;

    companys: Array<any>;
    queryTypes: string[];
    bankBin: any;

    //是否显示手续，class绑定
    isShowTable = 'none';

    //金融机构过滤后的数据源
    companys$: Observable<any>;

    //注入的各種服務
    dialog: MatDialog;
    sql: SQLService;
    message: MessageService;
    fb: FormBuilder;
    route: ActivatedRoute;
    // clipboardService: ClipboardService

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

    get lawCase() {
        return LawCase.currentCase;
    }

    private saveData: Subscription;
    private saveDataComplete: Subscription;
    private saveImageSubscription: Subscription;
    private clickCaseItem: Subscription;
    private isSealSubscription: Subscription;
    private saveDataSubscription: Subscription;
    // ChangeDetectorRef必须保留注入子类并传递到super() 无法在父类中直接注入
    // cdr:ChangeDetectorRef;
    constructor() {
        console.log('shou xu constructor')
        const injector = AppInjector.getInjector();
        this.dialog = injector.get(MatDialog);
        this.sql = injector.get(SQLService);
        this.message = injector.get(MessageService);
        this.fb = injector.get(FormBuilder);
        // this.clipboardService = injector.get(ClipboardService);
    }

    ngOnInit() {
        console.log('shou xu init');
        if (!LawCase.currentCase) toastr.info('请先选择案件')
        //设置表单启用禁用
        this.group.disable();

        if (LawCase.currentCase) this.group.enable();

        this.getFc('docNumber').disable()

        //点击案件列表的监听
        this.message.clickCase$.subscribe(res => {
            this.group.enable();
            this.clear();
        })

        //保存按钮点击的监听
        this.saveDataSubscription = this.saveData = this.message.saveData$.subscribe(() => { this.save() })

        //对点击案件手续信息的监听
        this.clickCaseItem = this.message.clickCaseItem$.subscribe((res: Dongjie | Chaxun) => { this.data = res })

        //存图按钮点击的监听
        this.saveImageSubscription = this.message.saveImage$.subscribe(() => {
            this.saveImage()
        })

        this.isSealSubscription = this.message.isSeal$.subscribe((value: boolean) => {
            this.isSeal = value;
        })

        this.saveDataComplete = this.message.saveDataComplete$.subscribe((res: any) => {
            console.log('shouxu save complete')
            // this.model.docNumber = res.docNumber;
            this.setFcVal('docNumber', res.docNumber);
            this.getCDInstance().markForCheck();
            toastr.info('文书编号已返回');
        })

        //获取配置信息，路由resolver
        this.route.data.subscribe(data => {
            const configData: any = data.configData
            this.companys = configData.company;
            this.queryTypes = configData.queryType;
            this.bankBin = configData.bankBin;
            this.unit = configData.unit;
            this.unit_1 = configData.unit_1;
            this.unit_2 = configData.unit_2;
            this.unit_3 = configData.unit_3;
            this.users = configData.user;
        })

        this.companys$ = this.getFc('company').valueChanges.pipe(
            startWith(''),
            map((val: string) => this.filter(val))
        )
    }

    ngOnDestroy() {
        console.log('shouxu on destroy');
        this.saveData.unsubscribe();
        this.saveDataComplete.unsubscribe();
        this.saveImageSubscription.unsubscribe();
        this.clickCaseItem.unsubscribe();
        this.isSealSubscription.unsubscribe();
        this.saveDataSubscription.unsubscribe();
    }

    //子类复写的方法

    //清理表单上显示的数据
    abstract clear();

    //保存数据前的验证数据是否有效
    abstract validate();

    //获取提交保存的数据
    abstract getTableData();

    //子类提供changeDetectorRef的实例，该类无法在基类中注入
    abstract getCDInstance();

    abstract getImgInfos();

    // abstract getLawDocNumber();

    abstract set data(value: Shouxu);

    //获取年月日
    getYear(moment) {
        if (moment) return moment.get('year')
    }

    getMonth(moment) {
        if (moment) return moment.get('month') + 1;
    }

    getDay(moment) {
        if (moment) return moment.get('date');
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
        console.log('save data')
        if (!this.validate()) return;
        let tableData = this.getTableData()
        let data = {
            tableName: State.currentState.value,
            tableData: tableData
        }

        this.sql.exec(PhpFunctionName.INSERT, data).subscribe(res => {
            //插入后会返回当前这条数据，插入后获取有文书编号的情况。文书编号在数据库中使用触发器生成。
            console.log(res)
            if (res && res.length > 0) {
                const item = res[0];
                this.message.saveDataComplete(item);
                console.log('save ok');
                toastr.success('手续数据保存成功');
            }
        })
    }

    private filter(val: string | undefined): any[] {
        if (val == '' || !val) return this.companys;
        return this.companys.filter(item => {
            return item['py'].toLowerCase().indexOf(val) >= 0 || item['label'].indexOf(val) >= 0
        })
    }

    ara2cn(digit:number){
        const arr1 = [1,2,3,4,5,6,7,8,9,0];
        const arr2 = ['一','二','三','四','五','六','七','八','九','〇',];
        return arr2[arr1.indexOf(digit)]
    }

}
