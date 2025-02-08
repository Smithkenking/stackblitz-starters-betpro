import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { catchError, take } from 'rxjs/operators';
import { Subscription,throwError } from 'rxjs';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
declare var $: any;

@Component({
  selector: 'app-casino-games',
  templateUrl: './casino-games.component.html',
  styleUrls: ['./casino-games.component.scss']
})
export class CasinoGamesComponent implements OnInit, AfterContentInit, AfterViewInit,OnDestroy {
  gameCode: string;
  lobbyUrl: any;
  iframeUrl: any;
  elem: any;
  isFullScreen: boolean;
  isNewsExits: boolean;
  private subscription: Subscription;
  @ViewChild('myIframe', {static: true}) iframe: ElementRef;
  constructor(public router: Router, private route: ActivatedRoute, private toastr: ToastrService,
     public commonService: CommonService, private authFacadeService: AuthFacadeService) {
      this.subscription = this.route.params.subscribe((params) => {
      this.gameCode = params.id;
      if (this.gameCode) {
        this.loadIframeData();
      }
    });
   }

  ngOnInit() {
    const self = this;
    this.init();
    setTimeout(() => {
      self.init();
    }, 100);
    this.elem = document.documentElement;
    this.isNewsExits = this.commonService.isNewsExits;
this.getNews();
  }
  ngAfterContentInit() {
    var currentUrl = document.referrer;
  }
  ngAfterViewInit() {
    $('.fullScreenBtn').on('touchend', function (e) {
      e.stopPropagation();
    });
    var mainDiv = document.getElementById("cgame");
    mainDiv.classList.remove("fullScreenDiv");
  }
  private init() {
  }
  loadIframeData() {
    try {
      this.lobbyUrl = (localStorage.getItem('lobbyUrl')).toString();
      if (this.lobbyUrl && this.lobbyUrl !== null && this.lobbyUrl !== '' && this.lobbyUrl !== undefined) {
          this.iframeUrl = this.lobbyUrl;
      } else {
        this.toastr.error('Unauthorised',"Notification",{
          toastClass: "custom-toast-error"
        });
        this.goToHome();
      }
    } catch (ex) {
      console.log('ex : ', ex);
      this.goToHome();
    }
  }
  goToHome() {
    localStorage.removeItem('lobbyUrl');
    this.router.navigate(['/home']);
  }
  toggleFullScreen() {
    var document: any = window.document;
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      this.isFullScreen = false;
      var mainDiv = document.getElementById("colCenter");
      if (mainDiv.classList.contains('fullScreen')) {
        mainDiv.classList.remove("fullScreen");
      }
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else {
        this.toggleFullScreenClass();
      }
    } else {
      this.isFullScreen = true;
      var mainDiv = document.getElementById("colCenter");
      if (mainDiv.classList.contains('fullScreen')) {
        mainDiv.classList.remove("fullScreen");
        mainDiv.classList.add("fullScreen");
      } else {
        mainDiv.classList.add("fullScreen");
      }
      var element = document.querySelector('#cgame');
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitEnterFullscreen) {
        element.webkitEnterFullscreen(); //for iphone this code worked
      } else {
        this.toggleFullScreenClass();
      }
    }
  }
  toggleFullScreenClass() {
    var mainDiv = document.getElementById("cgame");
    var mainGameDiv = document.getElementById("minGame");
    var colCenter = document.getElementById("colCenter");
    if (mainGameDiv.classList.contains('fullScreenDiv')) {
      mainGameDiv.classList.remove("fullScreenDiv");
      colCenter.classList.add("col-center");
      this.isFullScreen = false;
    } else {
      mainGameDiv.classList.add("fullScreenDiv");
      colCenter.classList.remove("col-center");
      this.isFullScreen = true;
    }
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
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
