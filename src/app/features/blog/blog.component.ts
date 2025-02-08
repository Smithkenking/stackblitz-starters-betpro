import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { forkJoin, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {
  isNewsExits: boolean;
  BlogData: any[] = [];
  BlogCategoryData: any[] = [];
  BlogCategoryData1: any[] = [];
  selectedCategory: string = 'home';
  isBlogDetails: boolean = false;
  BlogCategoryList: any;
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
  routeSubscription: any;
  bi: any;
  su: any;
  user: any;
  constructor(public commonService: CommonService, private authService: AuthFacadeService,
    private router: Router,public authFacadeService: AuthFacadeService) {
    }

  ngOnInit(): void {
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
      }
    });
    this.getNews();
  }
  ngAfterViewInit(): void {
    this.scrollEvent();
  }
  scrollEvent() {
    const scroll: any  = document.querySelector(".blog-slider");
    var isDown = false;
    var scrollX;
    var scrollLeft;
   if(scroll){
    // Mouse Up Function
  scroll.addEventListener("mouseup", () => {
    isDown = false;
    scroll.classList.remove("active");
  });
  
  // Mouse Leave Function
  scroll.addEventListener("mouseleave", () => {
    isDown = false;
    scroll.classList.remove("active");
  });
  
  // Mouse Down Function
  scroll.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDown = true;
    scroll.classList.add("active");
    scrollX = e.pageX - scroll.offsetLeft;
    scrollLeft = scroll.scrollLeft;
  });
  
  // Mouse Move Function
  scroll.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    var element = e.pageX - scroll.offsetLeft;
    var scrolling = (element - scrollX) * 2;
    scroll.scrollLeft = scrollLeft - scrolling;
  });
}
  }
  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.router.navigate(['blog', categoryId]);
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  getNews() {
    this.authFacadeService.getNews$()
        .pipe(
            untilDestroyed(this),
            take(1),
            catchError(err => throwError(err))
        ).subscribe(response => {
            if (response &&  response.length > 0) {
                this.isNewsExits = true;
            }
        }, err => console.log('getNews', err));
  }
  trackByFun(index, item) {
    return index;
  }

  ngOnDestroy() {
  }
}
