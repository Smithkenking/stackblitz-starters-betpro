import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacebetCountdownComponent } from './placebet-countdown.component';

describe('PlacebetCountdownComponent', () => {
  let component: PlacebetCountdownComponent;
  let fixture: ComponentFixture<PlacebetCountdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlacebetCountdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacebetCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
