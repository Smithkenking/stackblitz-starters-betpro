import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportbookTypeComponent } from './sportbook-type.component';

describe('SportbookTypeComponent', () => {
  let component: SportbookTypeComponent;
  let fixture: ComponentFixture<SportbookTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SportbookTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SportbookTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
