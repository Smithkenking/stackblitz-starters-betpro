import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})
export class NotfoundComponent implements OnInit {
  logoUrl = apiEndPointData.data.darkLogoUrl;
  websiteOrigin: any;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.logoUrl = apiEndPointData.data.darkLogoUrl;
    this.websiteOrigin = window.location.host;
  }
  retunHomeClick() {
    this.router.navigateByUrl('/home');
  }
}
