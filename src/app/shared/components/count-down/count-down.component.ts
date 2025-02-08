import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { SharedModule } from '@clientApp-shared/shared.module';
import { Observable, interval, of } from 'rxjs';
import { tap, takeWhile, switchMap } from 'rxjs/operators';
import * as moment from 'moment-timezone';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule],
  selector: 'pb-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.css']
})
export class CountDownComponent implements OnInit {
  @Input() remaingTime: number; // Remaining time in seconds
  private counter$: Observable<number>;
  public days: number;
  public hours: number;
  public minutes: number;
  public seconds: number;
  public showCountDown = true;

  constructor() {}

  ngOnInit() {
    // Convert IST time to PKT time
    this.remaingTime = this.convertToPktTime(this.remaingTime);

    this.counter$ = interval(1000).pipe(
      tap(() => {
        this.remaingTime = this.remaingTime - 1;
        this.showCountDown = this.remaingTime >= 0;
      }),
      takeWhile(() => this.remaingTime >= 0),
      switchMap(() => of(this.remaingTime))
    );

    this.counter$.subscribe((time) => {
      this.getRemainingTime(time);
    });
  }

  /**
   * Converts the remaining time from IST to PKT
   * @param remaingTimeInSeconds Remaining time in seconds
   * @returns Adjusted remaining time in seconds
   */
  private convertToPktTime(remaingTimeInSeconds: number): number {
    const currentIstTime = moment.tz(new Date(), 'Asia/Calcutta'); // IST timezone
    const currentPktTime = currentIstTime.clone().tz('Asia/Karachi'); // PKT timezone

    // Calculate the difference in seconds between IST and PKT
    const timeDifferenceInSeconds =
      currentPktTime.utcOffset() * 60 - currentIstTime.utcOffset() * 60;

    return remaingTimeInSeconds + timeDifferenceInSeconds;
  }

  private getRemainingTime(time: number): void {
    this.days = Math.floor(time / 86400);
    time -= this.days * 86400;
    this.hours = Math.floor(time / 3600) % 24;
    time -= this.hours * 3600;
    this.minutes = Math.floor(time / 60) % 60;
    time -= this.minutes * 60;
    this.seconds = Math.floor(time % 60);
  }

  counterValue(value: any): number[] {
    if (value >= 0 && value < 10) {
      value = '0' + value;
    } else {
      value = value ? value.toString() : value;
    }
    let digits: number[] = [];
    if (value) {
      digits = value.split('').map((num) => parseInt(num, 10));
    }
    return digits;
  }
}
