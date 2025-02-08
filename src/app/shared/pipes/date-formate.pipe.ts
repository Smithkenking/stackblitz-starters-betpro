import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormate',standalone: true
})
export class DateFormatePipe implements PipeTransform {
constructor(public datepipe: DatePipe) {}
  transform(date: any): any {
    const currentDate = new Date();
    const someDate = new Date(date);
    if(someDate.getDate() == currentDate.getDate() &&
      someDate.getMonth() == currentDate.getMonth() &&
      someDate.getFullYear() == currentDate.getFullYear()) {
      return 'Today, ' + this.datepipe.transform(date, 'h:mm a');
    } else if(someDate.getDate() == currentDate.getDate()+1 &&
              someDate.getMonth() == currentDate.getMonth() &&
              someDate.getFullYear() == currentDate.getFullYear()) {
      return 'Tomorrow, ' + this.datepipe.transform(date, 'h:mm a');
    } else {
      return this.datepipe.transform(date, 'dd-MM-yyyy, h:mm a');
  }
    
  }

}
