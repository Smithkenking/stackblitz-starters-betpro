import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChipSettingsComponent } from './chip-settings.component';

describe('ChipSettingsComponent', () => {
  let component: ChipSettingsComponent;
  let fixture: ComponentFixture<ChipSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
