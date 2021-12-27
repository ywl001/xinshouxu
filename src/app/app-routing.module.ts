import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigDataResolver } from './configdata.resolver';
import { ChaxunComponent } from './components/chaxun/chaxun.component';
import { DongjieComponent } from './components/dongjie/dongjie.component';

const routes: Routes = [
  {path:'',redirectTo: 'chaxun',pathMatch: 'full'},
  {path:'chaxun',component:ChaxunComponent,resolve:{'configData':ConfigDataResolver}},
  {path:'dongjie',component:DongjieComponent,resolve:{'configData':ConfigDataResolver}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
