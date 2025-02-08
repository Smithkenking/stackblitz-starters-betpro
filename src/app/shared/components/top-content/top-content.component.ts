import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// import { NavigationEnd, Router } from '@angular/router';
import { LandingPageBT } from '@clientApp-core/enums/banner.types';
import { AuthFacadeService, DCOBanner } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { SharedModule } from '@clientApp-shared/shared.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swiper, { Autoplay, Pagination} from 'swiper';
Swiper.use([Autoplay,Pagination]);
@Component({
  standalone: true,
  imports:[CommonModule,SharedModule,SlickCarouselModule],
  selector: 'app-top-content',
  templateUrl: './top-content.component.html',
  styleUrls: ['./top-content.component.scss']
})
export class TopContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() openPopup = new EventEmitter();
  isDCOBanner: boolean = false;
  user: any;
  bannerSlides = [];
  mySubscription: any;
  topBanner: any;
  PromotionImages: any;
  SportsCasinoImg: any;
  paymentImg: any;
  topBannerConfig = {
    slidesToShow: 1,
    infinite: true,
    arrows: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 2500,
  };
  constructor(private authService: AuthFacadeService, public deviceInfoService: DeviceInfoService,
    public router: Router) {
      // this.mySubscription =  this.router.events.subscribe(val => {
      //   if (val instanceof NavigationEnd) {
      //     if(val.urlAfterRedirects.indexOf('/home') !== 0 ){
      //       this.banner();
      //     }
      //   }
      //   });
     }

  ngOnInit(): void {
    this.isDCOBanner = apiEndPointData.data.isDB;
    this.banner();
    // this.authService.getDcoBanner$().pipe(
    //   untilDestroyed(this),
    //   catchError(err => throwError(err))
    // ).subscribe(response => {
    //   if (response.success) {
    //     this.banner();
    //     this.initSlides();
    //   }
    // }, err => console.log('getDcoBanner', err));
  }
  ngAfterViewInit(): void {
    this.initSlides();
  }
  banner() {
    const bannerData = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
        if (bannerData && bannerData.length > 0) {
          this.topBanner = this.shuffleArray(bannerData.filter(first => first.bt === LandingPageBT.LP_Top_Banner));
          this.PromotionImages = bannerData.filter(second => second.bt === LandingPageBT.LP_Promotion_Images);
          this.SportsCasinoImg = bannerData.filter(third => third.bt === LandingPageBT.LP_Sports_Casino);
          this.paymentImg = bannerData.find(four => four.bt === LandingPageBT.LP_Payment);
        }
    // this.user = JSON.parse(localStorage.getItem('token'));
    // let casinoBanner:any =[], sportsBanner=[];
    // if (this.isDCOBanner) {
    //   const banners = DCOBanner.data ? DCOBanner.data : [];
    //   if (this.user != null) {
    //     sportsBanner = banners.filter(x => x.position == 'Banner' && (x.displayType === DCOBannerType.After_Login || x.displayType == DCOBannerType.Before_and_After_Login));
    //     casinoBanner = banners.filter(x => x.position == 'Banner' && (x.displayType === DCOBannerType.Casino_Banner_After_Login || x.displayType == DCOBannerType.Casino_Banner_Before_and_After_Login));
    //   } else {
    //     sportsBanner = banners.filter(x => x.position == 'Banner' && (x.displayType === DCOBannerType.Before_Login || x.displayType == DCOBannerType.Before_and_After_Login));
    //     casinoBanner = banners.filter(x => x.position == 'Banner' && (x.displayType === DCOBannerType.Casino_Banner_Before_Login || x.displayType == DCOBannerType.Casino_Banner_Before_and_After_Login));
    //   }
    //   if(this.router.url.indexOf('/live-casino') === 0 && casinoBanner.length > 0){
    //     this.bannerSlides = this.shuffleArray(casinoBanner);
    //   } else {
    //     this.bannerSlides = this.shuffleArray(sportsBanner);
    //   }
    // } else {
    //   const banners = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
      
    //   if (this.user != null) {
    //     this.bannerSlides = banners.filter(x => x.bt === BannerType.HomePage_Banner || x.bt == BannerType.Banner_Before_and_After_Login).sort(function (a, b) {
    //       return a.dor - b.dor;
    //     });
        
    //   } else {
    //     this.bannerSlides = banners.filter(x => x.bt === BannerType.Dashboard_Banner || x.bt == BannerType.Banner_Before_and_After_Login).sort(function (a, b) {
    //       return a.dor - b.dor;
    //     });
       
    //   }
    //   if (this.deviceInfoService.isMobile()) {
    //     this.bannerSlides = this.shuffleArray(this.bannerSlides.filter(x => x.imv));
    //   } else {
    //     this.bannerSlides = this.shuffleArray(this.bannerSlides.filter(x => x.iwv));
    //   }
    // }
    // this.initSlides();
  }
  trackByFun(index, item) {
    return index;
  }

  onDCOBannerClick(slide: any) {
    if (slide && slide.redirecturl !== null && slide.redirecturl !== undefined && slide.redirecturl !== '') {
      window.open(slide.redirecturl, slide.targetWindow);
    }
  }
  onBannerClick(slide: any) {
    if (slide && slide.url !== null && slide.url !== undefined && slide.url !== '') {
      window.open(slide.url, '_self'); 
    } else if (slide && slide.mi !== null && slide.mi !== undefined && slide.mi !== '' && slide.mi !== 0) {
      this.router.navigate(['event', slide.mi]);
    }
  }
  initSlides() {
    var bannerSlider = new Swiper('.slider1', {
      loop: false,
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 25,
      modules: [Autoplay,Pagination],
      autoplay:{ delay: 5000,},
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      }
    });
  }
  shuffleArray(array) {
    var m = array.length, t, i;
 
    while (m) {    
     i = Math.floor(Math.random() * m--);
     t = array[m];
     array[m] = array[i];
     array[i] = t;
    }
 
   return array;
 }
  ngOnDestroy(): void {
    // this.mySubscription.unsubscribe();
  }

}
