import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumOddsComponent } from './premium-odds.component';

describe('PremiumOddsComponent', () => {
  let component: PremiumOddsComponent;
  let fixture: ComponentFixture<PremiumOddsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremiumOddsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumOddsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
