import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBlog',
  standalone: true,
})
export class FilterBlogPipe implements PipeTransform {

  transform(value: any, categoryId: any): any {
    return value.filter(blog => blog.bcids.includes(categoryId));
  }

}
