import { Pipe, PipeTransform } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'countdown',
  standalone: true
})
export class CountdownPipe implements PipeTransform {

  public transform(futureDate: string, isVirualSports?:boolean): Observable<any> {
    if (!futureDate || this.getMsDiff(futureDate) < 0) {
      return null;
    }

    const source = timer(0, 1000);
    return source.pipe(map((_) => this.msToTime(this.getMsDiff(futureDate), isVirualSports)));
  }
  private getMsDiff = (futureDate: string): number =>
                      +new Date(futureDate) - Date.now();

  private msToTime(msRemaining: number, isVirualSports): string | null {
    if (msRemaining < 0) {
      return null;
    }
    let day: string | number = Math.floor(msRemaining / 86400000); // days
    let hours: string | number = Math.floor((msRemaining % 86400000) / 3600000); // hours
    let minutes: string | number = Math.round(((msRemaining % 86400000) % 3600000) / 60000); // minutes
    let seconds : string | number = Math.floor((msRemaining % 60000) / 1000);
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    day = day < 10 ? '0' + day : (Number(day) ? day : 0);
    seconds = seconds < 10 ? '0' + seconds  : (Number(seconds) ? seconds : 0);

    return isVirualSports ? `${Number(minutes) ? minutes : '00'} : ${Number(seconds) ? seconds : 0}`  : `${day} days : ${Number(hours) ? hours : 0} hr : ${Number(minutes) ? minutes : 0} min`;
  }
  

}
