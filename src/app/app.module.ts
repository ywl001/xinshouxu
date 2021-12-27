import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from './components/components.module';
import { ThirdModule } from './third/third.module';
import { AppInjector } from './app-injector';
import { StoreModule } from '@ngrx/store';
import { configDataReducer, caseReducer as appDataReducer } from './app-store/app-reducer';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app-store/app-effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ComponentsModule,
    ThirdModule,
    StoreModule.forRoot({configData:configDataReducer,appData:appDataReducer}),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(injector: Injector){
    AppInjector.setInjector(injector);
  }
}
