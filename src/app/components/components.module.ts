import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordsComponent } from './records/records.component';
import { ThirdModule } from '../third/third.module';
import { ChaxunComponent } from './chaxun/chaxun.component';
import { DongjieComponent } from './dongjie/dongjie.component';
import { AddUnfreezeComponent } from './add-unfreeze/add-unfreeze.component';
import { AddCaseComponent } from './add-case/add-case.component';

@NgModule({
  declarations: [
    RecordsComponent, 
    ChaxunComponent, 
    DongjieComponent,
    AddUnfreezeComponent,
    AddCaseComponent
  ],
  imports: [
    CommonModule,
    ThirdModule
  ],
  exports: [RecordsComponent]
})
export class ComponentsModule { }
