import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component } from '@angular/core';

import { Toast, ToastrService, ToastPackage, IndividualConfig } from 'ngx-toastr';
export interface IToastButton {
  id: string;
  title: string;
};

@Component({
  selector: '[custom-toast-component]',
  styleUrls: [`./custom-toast.component.scss`],
  templateUrl: `./custom-toast.component.html`,
  animations: [
    trigger('flyInOut', [
      state(
        'inactive',
        style({
          opacity: 1,
        })
      ),
      transition(
        'inactive <=> active',
        animate(
          '500ms ease-out',
          keyframes([
            style({
              transform: 'translateX(340px)',
              offset: 0,
              opacity: 0,
            }),
            style({
              offset: 0.7,
              opacity: 1,
              transform: 'translateX(-20px)',
            }),
            style({
              offset: 1,
              transform: 'translateX(0)',
            }),
          ])
        )
      ),
      transition(
        'active => removed',
        animate(
          '500ms ease-in',
          keyframes([
            style({
              transform: 'translateX(-20px)',
              opacity: 1,
              offset: 0.2,
            }),
            style({
              opacity: 0,
              transform: 'translateX(340px)',
              offset: 1,
            }),
          ])
        )
      ),
    ]),
  ],
  preserveWhitespaces: false,
})
export class CustomToastComponent extends Toast {
  // used for demo purposes
  undoString = 'undo';
  override options:any;
  // constructor is only necessary when not using AoT
  constructor(
    protected toastrService: ToastrService,
    public toastPackage: ToastPackage
  ) {
    super(toastrService, toastPackage);
  }

  action(btn: IToastButton) {
    event.stopPropagation();
    this.toastPackage.triggerAction(btn);
    this.toastrService.clear();
    return false;
  }
}
