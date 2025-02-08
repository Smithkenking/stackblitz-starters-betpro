import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'istToPkt',standalone: true
})
export class IstToPktPipe implements PipeTransform {

  transform(value: any | Date): any {
    if (!value) {
      return '';
    }
    const istDate = moment.tz(value, 'Asia/Calcutta'); 
    const pktDate = istDate.clone().tz('Asia/Karachi'); 
    return pktDate.format('HH:mm'); 

    // const userTimeZone = moment.tz.guess();
    // const istDate = moment.tz(value, 'Asia/Calcutta');
    // const pktDate = moment.tz(istDate.format(), userTimeZone);
    // // return new Date(pktDate.format());
    // return pktDate.format('HH:mm');    
  }
}