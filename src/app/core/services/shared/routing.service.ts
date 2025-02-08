import { Injectable } from '@angular/core';
import { Routes } from '@angular/router';
import { appRoutes } from 'app/app.routing';

@Injectable({
  providedIn: 'root'
})
export class routingService  {
  constructor() { } 
}
export function setRoutesBasedOnRoles() {
    let routes: Routes = appRoutes;
    return routes
}
