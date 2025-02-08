import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnmatchBetComponent } from './unmatch-bet.component';

describe('UnmatchBetComponent', () => {
  let component: UnmatchBetComponent;
  let fixture: ComponentFixture<UnmatchBetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnmatchBetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnmatchBetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
