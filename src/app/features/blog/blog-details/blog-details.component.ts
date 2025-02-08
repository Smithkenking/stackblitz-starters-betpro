import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit,OnChanges,OnDestroy {
  @Input() BlogData: any[];
  isNewsExits: boolean;
  BlogCategoryData: any[] = [];
  BlogCategoryList: any;
  Blogcategory: any;
  routeSubscription: any;
  bi: any;
  su: any;
  isBlogDetails: boolean = true;
  constructor(public commonService: CommonService, private authService: AuthFacadeService,private route: ActivatedRoute,
    private router: Router) {
      this.routeSubscription = this.route.params.pipe().subscribe((params) => {
        if (params && !this.isEmpty(params)) {
          this.bi = +params['bi'];
          if (params && params.su) {
            let paramValue = params['su'];
            if (paramValue) {
              paramValue = paramValue.replace(/\s+/g, '-').toLowerCase();
              this.su = paramValue;
            }
          }
        }
    });
   }

  ngOnInit(): void {
    this.isNewsExits = this.commonService.isNewsExits;
    this.BlogCategoryList = this.BlogData.find(x =>x.bi == this.bi);
    const filteredBlogs = this.BlogData.filter(blog => blog.bi !== this.bi);
    const randomIndex = Math.floor(Math.random() * filteredBlogs.length);
    this.Blogcategory = filteredBlogs[randomIndex];
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.BlogCategoryList = this.BlogData.find(x =>x.bi == this.bi);
    const filteredBlogs = this.BlogData.filter(blog => blog.bi !== this.bi);
    const randomIndex = Math.floor(Math.random() * filteredBlogs.length);
    this.Blogcategory = filteredBlogs[randomIndex];
  }
  backToBlog() {
    this.isBlogDetails = false; 
    this.router.navigate(['blog']);
  }
  openBlogDetails(bi, su) {
    this.BlogCategoryList = this.BlogData.find(x =>x.bi == bi);
    const filteredBlogs = this.BlogData.filter(blog => blog.bi !== this.bi);
    const randomIndex = Math.floor(Math.random() * filteredBlogs.length);
    this.Blogcategory = filteredBlogs[randomIndex];
    this.router.navigate(['/blog/details', bi, su]);
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
