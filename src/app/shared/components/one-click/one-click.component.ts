import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren,EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
// import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { SharedModule } from '@clientApp-shared/shared.module';
import * as M from "materialize-css/dist/js/materialize";
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'app-one-click',
  templateUrl: './one-click.component.html',
  styleUrls: ['./one-click.component.scss']
})
export class OneClickComponent implements OnInit, AfterViewInit,  OnDestroy {
  oneClickInstances: any;
  oneClickStakeData = [];
  selectedIndex = 0;
  stakeSettingForm: UntypedFormGroup;
  isEditStakeValue: boolean = false;
  @ViewChild('oneclick', { static: true }) template: ElementRef;
  @ViewChildren('input') inputs: QueryList<ElementRef>;
    selectedStakeValue: string;
  isCheckedOneClickBet: boolean = false;
  Addcustomstake: boolean = false;
  notifier = new Subject();
  constructor(private formBuilder: UntypedFormBuilder,private toastr: ToastrService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.init();
    this.commonService.getOneClickBetStatus().pipe(takeUntil(this.notifier)).subscribe(isChecked => {
      this.isCheckedOneClickBet = isChecked;
    });
    this.commonService.getOneClickStakeStatus().pipe(takeUntil(this.notifier)).subscribe(stakevalue => this.selectedStakeValue = stakevalue);
  }
  ngAfterViewInit() {
    this.oneClickInstances = M.Modal.init(this.template.nativeElement, { dismissible: false });
    var elcollapsible = document.querySelectorAll('.collapsible');
    var icollapsible = M.Collapsible.init(elcollapsible, {});
  }
  setChipValue(stakeValue: string, index: number) {
    this.selectedIndex = index;
    this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(stakeValue));
    this.toastr.success(`Chip set Successfully`,"Notification",{
      toastClass: "custom-toast-success"
    });
    this.commonService.setOneClickStakeStatus(stakeValue);
    this.selectedStakeValue = stakeValue;
  }
  init() {
    const oneclickCurrentState = this.commonService.getCookieValue('isCheckedOneClickBet');
    this.isCheckedOneClickBet = (oneclickCurrentState != null && oneclickCurrentState != undefined && oneclickCurrentState != '' && JSON.parse(oneclickCurrentState).isCheckedOneClickBet) ? true : false;
    this.commonService.setOneClickBetStatus(this.isCheckedOneClickBet);
    const oneClickStakeValuesData = this.commonService.getCookieValue('oneClickStakeValuesData');
    if (oneClickStakeValuesData != null && oneClickStakeValuesData != undefined && oneClickStakeValuesData != '' && JSON.parse(oneClickStakeValuesData)) {
      this.oneClickStakeData = JSON.parse(oneClickStakeValuesData);
    } else {
      this.oneClickStakeData = apiEndPointData.data.oneClickStakeValue;
    }
    const oneClickSelectedStake = this.commonService.getCookieValue('oneClickSelectedStake');
    this.selectedStakeValue = oneClickSelectedStake != null && oneClickSelectedStake != undefined && oneClickSelectedStake != '' ? JSON.parse(oneClickSelectedStake) : '';
    if (oneClickSelectedStake != null && oneClickSelectedStake != undefined && oneClickSelectedStake != '' && JSON.parse(oneClickSelectedStake)) {
      const ind = this.oneClickStakeData.findIndex(x => x === JSON.parse(oneClickSelectedStake));
      this.selectedIndex = ind > -1 ? ind : 0;
    } else {
      this.selectedIndex = 0;
      this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+this.oneClickStakeData[0]));
      this.commonService.setOneClickStakeStatus(this.oneClickStakeData[0]);
    }
    this.stakeSettingForm = this.formBuilder.group({
      items: this.formBuilder.array(this.oneClickStakeData.map(chips => this.createItem(chips)))
    });
  }
  createItem(chip: any): UntypedFormGroup {
    return this.formBuilder.group({
      chipValue: [chip],
    });
  }
  onSubmit() {
    if (this.isEditStakeValue) {
      const updatedChips = [], self = this;
      const currentSelectedStakeVal = self.oneClickStakeData[this.selectedIndex];
      this.stakeSettingForm.get('items')['controls'].forEach((control , index) => {
        if (control.value.chipValue !== null && control.value.chipValue !== undefined) {
          const value = +control.value.chipValue
          updatedChips.push(value.toString());
        } else {
          const value = self.oneClickStakeData[index];
          updatedChips.push(value);
        }
      });
      this.oneClickStakeData = Object.assign([],updatedChips);
      this.commonService.setCookieValue('oneClickStakeValuesData', JSON.stringify(updatedChips));
      this.toastr.success(`Chip set Successfully`,"Notification",{
        toastClass: "custom-toast-success"
      });
      const updatedSelectedStakeVal = self.oneClickStakeData[this.selectedIndex];
      if (currentSelectedStakeVal !== updatedSelectedStakeVal) {
        this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+updatedSelectedStakeVal));
        this.commonService.setOneClickStakeStatus(updatedSelectedStakeVal);
      }
    } else {
      setTimeout(() => {
        this.inputs.first.nativeElement.focus();
      },50)
    }
    this.isEditStakeValue = !this.isEditStakeValue;
  }

  onReset() {
    this.stakeSettingForm = this.formBuilder.group({
      items: this.formBuilder.array(this.oneClickStakeData.map(chips => this.createItem(chips)))
    });
  }
  openPopup() {
    this.Addcustomstake = true;
    this.isEditStakeValue = false;
    this.oneClickInstances.open();
  }
  hideModal() {
    this.isEditStakeValue = false;
    this.oneClickInstances.close();
  }
  cancelClick() {
    this.isEditStakeValue = false;
    this.onReset();
  }
  onChange(isChecked: boolean) {
    if (isChecked) {
      this.isCheckedOneClickBet = true;
      this.commonService.setCookieValue('isCheckedOneClickBet', JSON.stringify({ isCheckedOneClickBet: true }));
      this.commonService.setOneClickBetStatus(true);
      const oneClickSelectedStake = this.commonService.getCookieValue('oneClickSelectedStake');
      if (oneClickSelectedStake != null && oneClickSelectedStake != undefined && oneClickSelectedStake != '' && JSON.parse(oneClickSelectedStake)) {
        this.selectedStakeValue = JSON.parse(oneClickSelectedStake);
      } else {
        const oneClickStakeValuesData = this.commonService.getCookieValue('oneClickStakeValuesData');
        if (oneClickStakeValuesData != null && oneClickStakeValuesData != undefined && oneClickStakeValuesData != '' && JSON.parse(oneClickStakeValuesData)) {
          this.oneClickStakeData = JSON.parse(oneClickStakeValuesData);
        } else {
          this.oneClickStakeData = apiEndPointData.data.oneClickStakeValue;
        }
        this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+this.oneClickStakeData[0]));
        this.commonService.setOneClickStakeStatus(this.oneClickStakeData[0]);
      }
    } else {
      this.isCheckedOneClickBet = false;
      this.isEditStakeValue = false;
      this.hideModal();
      this.commonService.setOneClickBetStatus(false);
      this.commonService.setCookieValue('isCheckedOneClickBet', JSON.stringify({ isCheckedOneClickBet: false }));
    }
  }
  onChangeAddCustomStake(isChecked: boolean) {
    this.Addcustomstake = isChecked;
    if(!isChecked){
      if(!this.oneClickStakeData.includes(this.selectedStakeValue)){
        this.selectedStakeValue = this.oneClickStakeData[0];
        this.selectedIndex = 0;
        this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+this.oneClickStakeData[0]));
        this.commonService.setOneClickStakeStatus(this.oneClickStakeData[0]);
      }
    }
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();  
  }
}
