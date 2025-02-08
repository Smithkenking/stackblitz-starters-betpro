import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchedbetComponent } from './matchedbet.component';

describe('MatchedbetComponent', () => {
  let component: MatchedbetComponent;
  let fixture: ComponentFixture<MatchedbetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchedbetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchedbetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
