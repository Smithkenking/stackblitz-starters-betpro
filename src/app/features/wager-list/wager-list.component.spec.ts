import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WagerListComponent } from './wager-list.component';

describe('WagerListComponent', () => {
  let component: WagerListComponent;
  let fixture: ComponentFixture<WagerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WagerListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WagerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
