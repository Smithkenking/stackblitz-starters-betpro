import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { ScriptService } from '@clientApp-core/services/shared/script.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
declare var $: any;
@Component({
  selector: 'app-report-page-layout',
  templateUrl: './report-page-layout.component.html',
  styleUrls: ['./report-page-layout.component.scss']
})
export class ReportPageLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  inMaintenance: boolean;
  isNewsExits: boolean;
  user: any;
  currentRoute: string;
  isB2C: boolean = false;
  mySubscription: any;
  acTabConfig = {
    speed: 2500,
    dots: false,
    infinite: false,
    variableWidth: true,
    autoplay: false,
    arrows: true,
    swipeToSlide: true,
    slidesToShow: 8,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 8,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1450,
        settings: {
          slidesToShow: 7,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1350,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }],
  };
  menuList: any = [
    {
      name: 'User Profile',
      route: '/user-profile',
      isB2C: false
    },
    {
      name: 'Wallets',
      route: '/bonus-list',
      isB2C: true
    },
    {
      name: 'Deposit',
      route: '/deposit',
      isB2C: true
    },
    {
      name: 'Withdraw',
      route: '/withdraw',
      isB2C: true
    },
    {
      name: 'Account Statement',
      route: '/account-statement',
      isB2C: false
    },
    {
      name: 'Open Bets',
      route: '/open-bets',
      isB2C: false
    },
    {
      name: 'Transaction History',
      route: '/transaction-history',
      isB2C: true
    },
  ];
  constructor(public router: Router, private authService: AuthFacadeService,
     public commonService: CommonService, private scriptService: ScriptService,private deviceInfoService : DeviceInfoService) {
    this.currentRoute = router.url;
    this.mySubscription = this.router.events.subscribe(val => {
      if (
        val instanceof NavigationEnd) {
          this.currentRoute  = val.urlAfterRedirects;
      }
    });
   }

  ngOnInit(): void {
    this.loadScript();
    this.inMaintenance = apiEndPointData.data.inMaintenance;
    this.isNewsExits = this.commonService.isNewsExits;
    this.isB2C = websiteSettings.data.isB2C; 
    this.user = JSON.parse(localStorage.getItem('token')); 
    this.getConfig();
    this.getNews();
    
  }
  ngAfterViewInit(): void {
      this.sportScrollEvent();
      if ($('.iconMenu-bar').hasClass('open') &&  $(window).width() > 991) {
        $('main').addClass('sidebar-open');
      }
      setTimeout(() => {
        var element = document.querySelector(".ac_slider a.active");
        element?.scrollIntoView({behavior: "smooth" ,inline: "center"});
      }, 500);
  }
  sportScrollEvent() {
    const scroll: any  = document.querySelector(".ac_slider");
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
redirectTo(path) {
   if (path !== '/user-profile') {
    if (websiteSettings.data.isReportPageOpenInNewTab) {
      let newRelativeUrl = this.router.createUrlTree([path]);
      let baseUrl = window.location.href.replace(this.router.url, '');
      window.open(baseUrl + newRelativeUrl, '_blank');
    } else {
      this.router.navigateByUrl(path);
    }
  } else {
    if (this.isB2C) {
      this.router.navigateByUrl(path);
    }
  }
}
getConfig() {
  this.authService.getConfig$()
      .pipe(catchError(err => throwError(err))
      ).subscribe(response => {
          if (response) {
            this.isB2C = websiteSettings.data.isB2C;
            setTimeout(() => {
              this.sportScrollEvent();
            }, 500);
          }
      }, err => console.log('getConfig', err));
}
trackByFun(index, item) {
  return index;
}
  getNews() {
    this.authService.getNews$()
        .pipe(
            untilDestroyed(this),
            take(1),
            catchError(err => throwError(err))
        ).subscribe(response => {
            if (response &&  response.length > 0) {
                this.isNewsExits = true;
                this.commonService.isNewsExits = true;
            }
        }, err => console.log('getNews', err));
  }
  loadScript() {
    this.scriptService.load('external').then(data => {
  }).catch(error => console.log('loadScript',error));
  }
  ngOnDestroy(): void {
    this.mySubscription.unsubscribe();
  }
}
