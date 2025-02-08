import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, Injectable, Injector } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app.component';
import { ConfigService } from '@clientApp-core/services/config/connfig.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@clientApp-core/core.module';
import { SharedModule } from '@clientApp-shared/shared.module';
import { ParkBetStoreModule } from '@clientApp-store/store.module';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CustomPreloadingStrategyService } from '@clientApp-core/services/custom/custom-preloading-strategy.service';
import { setAppInjector } from './app-injector';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LoadingBarComponent } from "./shared/components/loading-bar/loading-bar.component";
import { GoogleLoginProvider, FacebookLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { SocialService } from '@clientApp-core/services/social/social.service';
export function loadConfigurations(configService: ConfigService) {
  return () => configService.loadAppConfig();
}
@Injectable()
@NgModule({
    declarations: [
        AppComponent        
    ],
    providers: [CookieService, DatePipe, DecimalPipe, Title, CustomPreloadingStrategyService,
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [ConfigService],
            useFactory: loadConfigurations,
        },
    {
      provide: 'SocialAuthServiceConfig',
      useFactory: (socialService: SocialService) => {
        return {
          autoLogin: false,
          providers: [
            {
              id: GoogleLoginProvider.PROVIDER_ID,
              provider: new GoogleLoginProvider(socialService.getGoogleClientId())
            },
            {
              id: FacebookLoginProvider.PROVIDER_ID,
              provider: new FacebookLoginProvider(socialService.getFacebookAppId()),
            },
          ]
        } as SocialAuthServiceConfig;
      },
      deps: [SocialService]
    }
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        CoreModule,
        SharedModule,
        AppRoutingModule,
        StoreModule.forRoot({}),
        ParkBetStoreModule,
        ServiceWorkerModule.register('ngsw-worker1.js', {
            enabled: true,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
        LoadingBarComponent
    ]
})
export class AppModule {
  constructor(injector: Injector) {
    setAppInjector(injector);
  }
 }
