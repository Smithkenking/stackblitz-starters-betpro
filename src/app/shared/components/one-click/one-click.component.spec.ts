import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneClickComponent } from './one-click.component';

describe('OneClickComponent', () => {
  let component: OneClickComponent;
  let fixture: ComponentFixture<OneClickComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OneClickComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneClickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
