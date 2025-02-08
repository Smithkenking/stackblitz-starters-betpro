import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sportsIcon',
  standalone: true
})
export class SportsIconPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): any {
    if (value !== null && value !== undefined && value !== '') {
      value = value.toLowerCase().replace(/ /g,"-");
    }
    if (value === 'Home' || value === 'home') {
      value = 'all-sports'
    } else if (value === 'home-icon') {
      value = 'home';
    } else if (value === 'Inplay' || value === 'inplay') {
      value = 'inplay';
    }
    return value;
  
  }
  

}
