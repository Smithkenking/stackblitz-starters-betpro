import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nameHR', standalone: true
})
export class NameFormatePipe implements PipeTransform {

    constructor() { }

    public transform(value: string): string {
        if (value) {
            let realmatchname = value;
            let arr;
            arr = realmatchname.split('| ');
            if (arr && arr.length >= 0) {
                realmatchname = arr[0];
            }
            return realmatchname;
        } else {
            return value;
        }
    }
}