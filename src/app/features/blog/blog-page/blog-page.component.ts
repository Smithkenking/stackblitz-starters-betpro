import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { initialState } from '@clientApp-store/selected-market/state/selected-market.state';
import { Subscription,forkJoin } from 'rxjs';
import Swiper, { Autoplay, Pagination} from 'swiper';
Swiper.use([Autoplay,Pagination]);
@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss']
})
export class BlogPageComponent implements OnInit,AfterViewInit, OnDestroy {
  user: any;
  routeSubscription: any;
  bi: any;
  su: any;
  BlogCategoryList: any;
  isNewsExits: boolean;
  BlogData: any[] = [];
  BlogCategoryData: any[] = [];
  BlogCategoryData1: any[] = [];
  selectedCategory: string = '';
  isBlogDetails: boolean = false;
  private subscription: Subscription;
  blogConfig = {
    autoplay: false,
      autoplaySpeed: 1500,
      slidesToShow: 3,
      slidesToScroll: 1,
      dots: false,
      focusOnSelect: true,
      arrows: true,
      prevArrow: '<i class="fas fa-chevron-left prev-arrow"></i>',
      nextArrow: '<i class="fas fa-chevron-right next-arrow"></i>',
      responsive: [
          {
          breakpoint: 1700,
          settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              adaptiveHeight: true,
          },
          },
          {
          breakpoint: 600,
          settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
          },
          },
      ],
  }
  constructor(public commonService: CommonService, private route: ActivatedRoute,
    private authService: AuthFacadeService, private router: Router) {
      this.routeSubscription = this.route.params.pipe().subscribe((params) => {
      if (params && !this.isEmpty(params)) {
        this.bi = +params['bi'];
        if (params && params.su) {
          let paramValue = params['su'];
          if (paramValue) {
            paramValue = paramValue.replace(/\s+/g, '-').toLowerCase();
            this.su = paramValue;
            this.openBlogDetails(+params['bi'],paramValue);
          }
        }
      }
  });
   }

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      const selectedCategory = params['categoryId'];
      this.selectedCategory = selectedCategory;
    });
    this.user = JSON.parse(localStorage.getItem('token'));
    this.isNewsExits = this.commonService.isNewsExits;
    let res1 = this.authService.getBlogCategoryData();
    let res2 = this.authService.getBlogData();
    forkJoin([res1, res2])
    .subscribe(response =>{
      const res1:any  =response[0];
      const res2:any  =response[1];
      if (res1.isSuccess) {
        this.BlogCategoryData = res1.result.data;
        if (res2.isSuccess) {
          const blogCategoryIds = this.BlogCategoryData.map(category => category.bcid.toString());
          this.BlogData = res2.result.data.filter(blog => blogCategoryIds.includes(blog.bcids));
          this.BlogCategoryData1 = this.BlogCategoryData.filter(category =>
            this.BlogData.some(blog => blog.bcids === category.bcid.toString()));
        }
        const obj = this.BlogCategoryData.find(x => x.bcid == this.bi);
        // if(obj){
        //   this.selectedCategory = obj.bcid;
        // } else {
        //   this.selectedCategory = 'home';
        // }
        this.initSlider();
        setTimeout(() => {
          this.initSlider();
        }, 1000);
        
      }
    });
    // this.getNews();
  }
  ngAfterViewInit(): void {
    this.initSlider();
  }
  initSlider(){
    var bannerSlider = new Swiper('.blog_slider', {
      loop: true,
      slidesPerView: 1,
      modules: [Autoplay,Pagination],
      spaceBetween: 25,
      autoplay:{ delay: 5000,},
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        768: {
          slidesPerView: 2
        },
        
        1600: {
          slidesPerView: 3
        }
      }
    });
  }
  openBlogDetails(bi, su) {
    this.isBlogDetails = true;
    this.BlogCategoryList = this.BlogData.find(x =>x.bi == bi);
    const obj = this.BlogCategoryData.find(x => x.bcid == bi);
    //  if(obj){
    //   this.selectedCategory = obj.bcid;
    //  } else {
    //   this.selectedCategory = 'home';
    // }
    su = su.replace(/\s+/g, '-').toLowerCase(); 
    this.router.navigate(['/blog/details', bi, su]);
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  trackByFun(index, item) {
    return index;
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }
}
