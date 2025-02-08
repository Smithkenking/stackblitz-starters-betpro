import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'racingTimes',
  standalone: true
})
export class RacingTimePipe implements PipeTransform {

  transform(betName: any): any {
    const arr = betName.split(': ');
    if (arr && arr.length >= 2) {

      let time = arr[1];
      let hours = Number(time.match(/^(\d+)/)[1]);
      let minutes = Number(time.match(/:(\d+)/)[1]);
      let AMPM = time.match(/\s(.*)$/)[1];
      let AMPMTrim = AMPM.trim().toLowerCase();
      if (AMPMTrim == "pm" && hours < 12) hours = hours + 12;
      if (AMPMTrim == "am" && hours == 12) hours = hours - 12;
      let sHours = hours.toString();
      let sMinutes = minutes.toString();
      if (hours < 10) sHours = "0" + sHours;
      if (minutes < 10) sMinutes = "0" + sMinutes;
      const timeFormate = sHours + ":" + sMinutes;
      return timeFormate;
    }
    return '';
  }

}
