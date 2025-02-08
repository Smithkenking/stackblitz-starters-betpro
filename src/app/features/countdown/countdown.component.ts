import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStatus } from '@clientApp-core/enums/payment-status';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit,OnDestroy {
  notifier = new Subject();
  transactionId: any;
  amount:any;
  constructor(private marketRateService: MarketRateFacadeService,private router: Router) {

  }

  ngOnInit(): void {
      this.marketRateService.getdepositRequestStatus$().pipe(takeUntil(this.notifier)).subscribe(data => {
          if(data.appStatus == PaymentStatus.Success){
              localStorage.setItem('sAmount', data.appAmount);
              localStorage.setItem('stransactionId', data.appTransactionId);
              this.router.navigate(['/payment-accept']);
          } else if(data.appStatus == PaymentStatus.Failed){
              localStorage.setItem('sAmount', data.appAmount);
              localStorage.setItem('stransactionId', data.appTransactionId);
              this.router.navigate(['/payment-reject']);
          }
      });
      this.transactionId = localStorage.getItem('transactionId');
      this.amount = localStorage.getItem('Amount');
      // countdown
      const FULL_DASH_ARRAY = 250;
      const WARNING_THRESHOLD = 10;
      const ALERT_THRESHOLD = 5;

      const COLOR_CODES = {
          info: {
              color: "green"
          },
          warning: {
              color: "orange",
              threshold: WARNING_THRESHOLD
          },
          alert: {
              color: "red",
              threshold: ALERT_THRESHOLD
          }
      };

      const TIME_LIMIT = 60;
      let timePassed = 0;
      let timeLeft = TIME_LIMIT;
      let timerInterval = null;
      let remainingPathColor = COLOR_CODES.info.color;

      document.getElementById("app").innerHTML = `
              <div class="base-timer">
              <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g class="base-timer__circle">
              <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
              <path
              id="base-timer-path-remaining"
              stroke-dasharray="250"
              class="base-timer__path-remaining ${remainingPathColor} remaining-time-dot"
              d="
              M 40, 50
              m -30, 0
              a 40,40 0 1,0 80,0
              a 40,40 0 1,0 -80,0
              "
              ></path>
              </g>
              </svg>
              <span id="base-timer-label" class="base-timer__label">${formatTime(
                          timeLeft
                      )}</span>
              </div>
`;

      startTimer();

      function onTimesUp() {
          clearInterval(timerInterval);
      }

      function startTimer() {
          timerInterval = setInterval(() => {
              timePassed = timePassed += 1;
              timeLeft = TIME_LIMIT - timePassed;
              if(document.getElementById("base-timer-label") != null){
              document.getElementById("base-timer-label").innerHTML = formatTime(
                  timeLeft
              );
              setCircleDasharray();
              setRemainingPathColor(timeLeft);

              if (timeLeft <= 0) {
                  onTimesUp();
                  }
              } else {
                  onTimesUp(); 
              }
          }, 1000);
      }

      function formatTime(time) {
          const minutes = Math.floor(time / 60);
          let seconds: any = time % 60;

          if (seconds < 10) {
              seconds = `0${seconds}`;
          }

          return `0${minutes}:${seconds}`;
      }

      function setRemainingPathColor(timeLeft) {
          const { alert, warning, info } = COLOR_CODES;
          if (timeLeft <= alert.threshold) {
              document
                  .getElementById("base-timer-path-remaining")
                  .classList.remove(warning.color);
              document
                  .getElementById("base-timer-path-remaining")
                  .classList.add(alert.color);
          } else if (timeLeft <= warning.threshold) {
              document
                  .getElementById("base-timer-path-remaining")
                  .classList.remove(info.color);
              document
                  .getElementById("base-timer-path-remaining")
                  .classList.add(warning.color);
          }
      }

      function calculateTimeFraction() {
          const rawTimeFraction = timeLeft / TIME_LIMIT;
          return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
      }

      function setCircleDasharray() {
          const circleDasharray = `${(
              calculateTimeFraction() * FULL_DASH_ARRAY
          ).toFixed(0)} 250`;
          document
              .getElementById("base-timer-path-remaining")
              .setAttribute("stroke-dasharray", circleDasharray);
      }
  }
  ngOnDestroy(): void {
    this.notifier.next();
    this.notifier.complete();
      localStorage.removeItem('transactionId');
      localStorage.removeItem('Amount');
  }

}
