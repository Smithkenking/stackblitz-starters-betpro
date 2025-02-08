import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { ToastrModule } from 'ngx-toastr';
import { SwiperModule } from 'swiper/angular';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { RecaptchaModule } from 'ng-recaptcha';
import { CustomToastComponent } from 'app/custom-toast/custom-toast.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    declarations: [
        /** Componenets */
        CustomToastComponent

    ],
    exports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AngularDraggableModule,
        SwiperModule,
        NgxIntlTelInputModule,

        /** Componenets */
        CustomToastComponent,
        NgOptimizedImage

    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        NgOptimizedImage,
        ToastrModule.forRoot({
            toastComponent: CustomToastComponent,
            closeButton: true,
            positionClass: 'toast-top-center',
            newestOnTop: false,
            maxOpened: 4,
            timeOut: 3000,
            preventDuplicates: true
            // closeButton: true,
            // progressBar: true,
            // progressAnimation: 'decreasing',
            // maxOpened: 4,
            // timeOut: 3000,
            // preventDuplicates: true,
            // positionClass:'toast-top-center'
        }),
        AngularDraggableModule,
        // DeviceDetectorModule.forRoot(),
        NgxIntlTelInputModule,
        SwiperModule,
        RecaptchaModule,
        InfiniteScrollModule,
    ]
})
export class SharedModule { }
