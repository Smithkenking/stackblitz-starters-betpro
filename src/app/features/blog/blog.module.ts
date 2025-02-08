import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './blog.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { LoginRightsidebarComponent } from "../../shared/components/login-rightsidebar/login-rightsidebar.component";

const route: Routes = [{
  path: '',
  component: BlogComponent,
  children: [
    { path: '',redirectTo: 'home', pathMatch: 'full' },
    {
      path: ':categoryId',
      loadChildren: () => import('../blog/blog-page/blog-page.module').then(m => m.BlogPageModule),
      data: {title: 'blog'}
    },
  ]}
];

@NgModule({
    declarations: [BlogComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        RightsidebarComponent,
        LoginRightsidebarComponent
    ]
})
export class BlogModule { }
