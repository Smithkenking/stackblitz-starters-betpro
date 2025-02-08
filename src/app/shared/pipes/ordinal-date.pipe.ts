import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinalDate', standalone: true
})
export class OrdinalDatePipe implements PipeTransform {
  transform(value: any, arg1?: any): string {
    if (!value) {
      return '';
    }
    const currentDate = new Date();
    const someDate = new Date(value);
    if (someDate.getDate() == currentDate.getDate() &&
      someDate.getMonth() == currentDate.getMonth() &&
      someDate.getFullYear() == currentDate.getFullYear()) {
      return 'Today';
    } else if (someDate.getDate() == currentDate.getDate() + 1 &&
      someDate.getMonth() == currentDate.getMonth() &&
      someDate.getFullYear() == currentDate.getFullYear()) {
      if (arg1 === 'leftpanel') {
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${someDate.getDate()}${this.nth(someDate.getDate())} ${months[someDate.getMonth()]}`;
      } else {
        return 'Tomorrow';
      }
    } else {
      let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${someDate.getDate()}${this.nth(someDate.getDate())} ${months[someDate.getMonth()]}`;
    }
  }

 nth(d) {
  if (d > 3 && d < 21) return 'th'; 
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}
}