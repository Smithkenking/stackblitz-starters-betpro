import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-accept',
  templateUrl: './payment-accept.component.html',
  styleUrls: ['./payment-accept.component.scss']
})
export class PaymentAcceptComponent implements OnInit,OnDestroy {

  transactionId: any;
  amount:any;
  constructor() { }

  ngOnInit(): void {
    this.transactionId = localStorage.getItem('stransactionId');
    this.amount = localStorage.getItem('sAmount');
  }
  ngOnDestroy(): void {
    localStorage.removeItem('stransactionId');
    localStorage.removeItem('sAmount');
  }

}
