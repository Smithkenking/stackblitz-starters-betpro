import { Injectable } from '@angular/core';
import { WindowReferenceService } from './WindowReferenceService.service';


@Injectable({
    providedIn: 'root'
})
export class DataLayerService {
   private window; 

   constructor (private _windowRef: WindowReferenceService)
   {
       this.window = _windowRef.nativeWindow; // intialise the window to what we get from our window service

   }

     pingHome(obj)
    {
        if(obj)  this.window.dataLayer.push(obj);
    }
   
   
}