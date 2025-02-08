import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportbookBetDetailsComponent } from './sportbook-bet-details.component';

describe('SportbookBetDetailsComponent', () => {
  let component: SportbookBetDetailsComponent;
  let fixture: ComponentFixture<SportbookBetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SportbookBetDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SportbookBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
