import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitVSPipe',
  standalone: true
})
export class splitVSPipe implements PipeTransform {

  transform(value: string, isteam1:boolean): string {
    let teamName = '';
    let vrunnerName;
    if (value.includes(" V ")) {
      vrunnerName = value.split(' V ');
    } else if (value.includes(' @ ')) {
      vrunnerName = value.split(' @ ');
    } else {
      vrunnerName = value.split(' v ');
    }
      if (vrunnerName !== null || vrunnerName !== undefined) {
          if (isteam1) {
            teamName = vrunnerName[0] ? vrunnerName[0] : '';
          } else {
            teamName = vrunnerName[1] ? vrunnerName[1] : ''; 
        } 
        
    }
    return teamName;
  }

}
