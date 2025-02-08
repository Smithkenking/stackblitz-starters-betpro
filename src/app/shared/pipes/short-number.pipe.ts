import { Pipe, PipeTransform } from '@angular/core';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

@Pipe({
    name: 'shortNumber', standalone: true
})
export class ShortNumberPipe implements PipeTransform {

    transform(number: number, args?: any): any {
        const user = JSON.parse(localStorage.getItem('token'));
        let websitesettings: any;
        if (user == null || user == undefined || user == '') {
        websitesettings = apiEndPointData.data ? apiEndPointData.data : {};
        } else {
        websitesettings = websiteSettings.data ? websiteSettings.data : apiEndPointData.data ? apiEndPointData.data : {};
        }
        if (websitesettings.isShowShortNumber || websitesettings.issn) {
            if (isNaN(number)) return null; // will only work value is a number
            if (number === null) return null;
            if (number === 0) return null;
            let abs = Math.abs(number);
            const rounder = Math.pow(10, 1);
            const isNegative = number < 0; // will also work for Negetive numbers
            let key = '';

            const powers = [
                // { key: 'Q', value: Math.pow(10, 15) }, // quadrillion
                // { key: 'T', value: Math.pow(10, 12) }, // Trillion
                // { key: 'B', value: Math.pow(10, 9) },  // Billion
                // { key: 'M', value: Math.pow(10, 6) },  // Million   
                // { key: 'C', value: Math.pow(10, 7) }, // Crore 
                { key: 'L', value: Math.pow(10, 5) }, // Lakh
                { key: 'K', value: 1000 }             // Thousand
            ];

            for (let i = 0; i < powers.length; i++) {
                let reduced = abs / powers[i].value;
                reduced = Math.round(reduced * rounder) / rounder;
                if (reduced >= 1) {
                    abs = reduced;
                    key = powers[i].key;
                    break;
                }
            }
            return (isNegative ? '-' : '') + abs + key;
        } else {
            return number;
        }    
    }
}
