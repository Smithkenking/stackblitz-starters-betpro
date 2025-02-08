import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventShortname',
  standalone: true
})
export class EventShortnamePipe implements PipeTransform {

  transform(value: string): string {
    let shortname = value;
    const string = value.split(" ");
    if (string.length > 2) {
      shortname = string[0].substring(0, 1) + string[1].substring(0, 1) + string[2].substring(0, 1);
    } else if (string.length > 1) {
      shortname = string[0].substring(0, 1) + string[1].substring(0, 1);
    } else {
      shortname = string[0].substring(0, 2);
    }
    return shortname;
  }

}
