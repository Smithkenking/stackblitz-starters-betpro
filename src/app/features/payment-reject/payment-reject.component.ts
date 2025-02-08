import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-reject',
  templateUrl: './payment-reject.component.html',
  styleUrls: ['./payment-reject.component.scss']
})
export class PaymentRejectComponent implements OnInit,OnDestroy {

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
