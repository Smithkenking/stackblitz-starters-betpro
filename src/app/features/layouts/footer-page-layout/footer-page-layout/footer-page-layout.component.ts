import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Component({
  selector: 'app-footer-page-layout',
  templateUrl: './footer-page-layout.component.html',
  styleUrls: ['./footer-page-layout.component.scss']
})
export class FooterPageLayoutComponent implements OnInit,OnDestroy {
  isNewsExits: boolean;
  user: any;
  PageContent: any
  pageName: any;
  routeSubscription: any;
  constructor(public commonService: CommonService,private route: ActivatedRoute,private authFacadeService: AuthFacadeService) {
    this.routeSubscription = this.route.params.pipe().subscribe((params) => {
      if (params && !this.isEmpty(params)) {
        const alias = params['appAlias'];
        this.getPageContent(alias);
       }
  });
   }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('token'));
    this.isNewsExits = this.commonService.isNewsExits;
    this.getNews();
  }
  getPageContent(appAlias) {
    this.authFacadeService.getPageContent(appAlias)
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe((response:any) => {
        if (response && response.result) {
          this.PageContent = response.result.message.pageContent;
          this.pageName = response.result.message.pageName;
        }
      }, err => console.log('getPageContent', err));
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
                this.commonService.isNewsExits = true;
            }
        }, err => console.log('getNews', err));
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy(): void {
    
  }
}
