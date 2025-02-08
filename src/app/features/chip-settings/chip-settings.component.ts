import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ChipFacadeService } from '@clientApp-core/services/chip/chip-facade.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';

@Component({
  selector: 'app-chip-settings',
  templateUrl: './chip-settings.component.html',
  styleUrls: ['./chip-settings.component.scss']
})
export class ChipSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('chipsSetting', { static: true }) template: ElementRef;
  chipsModalInstances:any;
  chipsSettingForm: UntypedFormGroup;
  chips: UntypedFormArray;
  loading:boolean = false;
  chipResponse: any[];
  maxLen: number = 0;
  constructor(private formBuilder: UntypedFormBuilder,
    private chipService: ChipFacadeService,
    private toastr: ToastrService,
    private router: Router,
    public commonService: CommonService) { }

  ngOnInit() {
    this.maxLen = websiteSettings.data.isChipNameValMaxLan ? websiteSettings.data.isChipNameValMaxLan : 6;
  }
  onSubmit() {
    this.loading = true;
    if (this.chipsSettingForm.valid) {
      const updatedChips = [];
      this.chipsSettingForm.get('items')['controls'].forEach(control => {
        // tslint:disable-next-line:max-line-length
        updatedChips.push({ appChipsName: control.value.chipsName, appChips: control.value.chipsValue, appChipsTemplateID: control.value.chipsTemplateId });
      });
      this.chipService.saveCustomChips$(updatedChips).pipe(take(1)).subscribe((reponse: any) => {
        if (reponse.statusCode === 200) {
          this.toastr.success(`Chips Setting Update Success.`,"Notification",{
            toastClass: "custom-toast-success"
          });
          this.init();
          this.onReset();
          this.router.navigateByUrl('/home');
        } else {
          this.toastr.error(`Chips Setting Update Failed.`,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
        this.loading = false;
      });
    } else {
      this.chipsSettingForm.markAllAsTouched();
      this.loading = false;
    }
  }

  onReset() {
    this.loading = false;
    this.chipsSettingForm = this.formBuilder.group({
      items: this.formBuilder.array(this.chipResponse.map(chips => this.createItem(chips)))
    });
    this.chipsModalInstances.close();
  }

  createItem(chips: any): UntypedFormGroup {
    const namePatt = '^[A-Za-z0-9]{1,'+this.maxLen+'}$';
    return this.formBuilder.group({
      chipsName: [chips.appChipsName, { validators: [Validators.required, Validators.pattern(namePatt)], updateOn: 'blur' }],
      chipsValue: [chips.appChips, { validators: [Validators.required, Validators.pattern('^[0-9]*$')], updateOn: 'blur' }],
      chipsTemplateId: chips.appChipsTemplateID
    });
  }
  public noWhitespaceValidator(control: UntypedFormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  private init() {
    this.chipService.getChips$().pipe(take(1)).subscribe(chipResponse => {
      this.chipResponse = chipResponse;
      this.chipsSettingForm = this.formBuilder.group({
        items: this.formBuilder.array(chipResponse.map(chips => this.createItem(chips)))
      });
    });
  }

  ngOnDestroy() { }

}
