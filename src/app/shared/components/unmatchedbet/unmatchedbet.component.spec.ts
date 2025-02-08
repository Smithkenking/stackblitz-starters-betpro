import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnmatchedbetComponent } from './unmatchedbet.component';

describe('UnmatchedbetComponent', () => {
  let component: UnmatchedbetComponent;
  let fixture: ComponentFixture<UnmatchedbetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnmatchedbetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnmatchedbetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
