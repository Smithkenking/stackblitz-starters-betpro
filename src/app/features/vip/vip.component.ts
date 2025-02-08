import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
declare var $: any;
import Swiper, { Autoplay, Pagination } from 'swiper';
Swiper.use([Autoplay, Pagination]);
@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  styleUrls: ['./vip.component.scss']
})
export class VipComponent implements OnInit, AfterViewInit, OnDestroy {
  vipCategories: any = [];
  selectedTab = "All";
  isNewsExits: boolean;
  vipCategory: any;
  myVIPLevel: any;
  currentLevel: any;
  vipLevelInPer: any;
  clientCategoryData: any;
  selectedvipCategories: any;
  constructor(private bonusService: BonusService, public commonService: CommonService,
    private authService: AuthFacadeService) { }

  ngOnInit(): void {
    this.vipCategory = websiteSettings.data.vipCategory;
    this.isNewsExits = this.commonService.isNewsExits;
    this.getConfig()
    this.getNews();
    this.GetAllClientVipCategory()
  }
  ngAfterViewInit(): void {
    if ($('.iconMenu-bar').hasClass('open') && $(window).width() > 991) {
      $('main').addClass('sidebar-open');
    }

    // var bannerSlider = new Swiper('.vip_slider', {
    //   loop: true,
    //   slidesPerView: 1,
    //   // centeredSlides: true,
    //   spaceBetween: 25,
    //   autoplay:{ delay: 5000,},
    //   navigation: {
    //     nextEl: ".swiper-next",
    //     prevEl: ".swiper-prev",
    //   },
    //   modules: [Autoplay,Pagination],
    //   breakpoints: {
    //     768: {
    //       slidesPerView: 1
    //     },

    //     1600: {
    //       slidesPerView: 1
    //     }
    //   }
    // });

  }
  GetAllClientVipCategory() {
    this.commonService.setLoadingStatus(true);
    this.bonusService.GetAllClientVipCategory().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      this.commonService.setLoadingStatus(false);
      if (reponse.isSuccess) {
        this.vipCategories = reponse.result.vipCategories;
        this.clientCategoryData = reponse.result.clientCategoryData;
        this.myVIPLevel = this.vipCategories.find(x => x.categoryId == this.vipCategory)?.applyOrder;
        this.currentLevel = this.vipCategories.findIndex(x => x.applyOrder == this.myVIPLevel);
        this.vipLevelInPer = (this.vipCategory / this.vipCategories.length) * 100;
        this.selectedvipCategories = this.vipCategories[this.currentLevel];
      }
    }, err => { this.commonService.setLoadingStatus(false); console.log('GetCampaignList', err) });
  }
  prev() {
    if (this.currentLevel > 0) {
      this.currentLevel = this.currentLevel - 1;
      this.selectedvipCategories = this.vipCategories[this.currentLevel];
    }

  }
  next() {
    if (this.currentLevel + 1 < this.vipCategories.length) {
      this.currentLevel = this.currentLevel + 1;
      this.selectedvipCategories = this.vipCategories[this.currentLevel];
    }

  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(take(1),
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.vipCategory = websiteSettings.data.vipCategory;
          this.vipLevelInPer = (this.vipCategory / this.vipCategories
            .length) * 100;
        }
      }, err => console.log('getConfig', err));
  }
  getNews() {
    this.authService.getNews$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.isNewsExits = true;
          this.commonService.isNewsExits = true;
        }
      }, err => console.log('getNews', err));
  }
  onselectTab(tab) {
    this.selectedTab = tab;
  }
  ngOnDestroy(): void {

  }
}

