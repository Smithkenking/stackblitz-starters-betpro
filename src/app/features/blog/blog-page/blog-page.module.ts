import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogDetailsComponent } from '../blog-details/blog-details.component';
import { BlogPageComponent } from './blog-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { FilterBlogPipe } from "../filter-blog.pipe";
import { SlickCarouselModule } from 'ngx-slick-carousel';

const route: Routes = [
  {path: '', component: BlogPageComponent},
  {path: ':bi/:su', component: BlogPageComponent}
];

@NgModule({
    declarations: [
        BlogDetailsComponent,
        BlogPageComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(route),
        FilterBlogPipe,
        SlickCarouselModule
    ]
})
export class BlogPageModule { }
