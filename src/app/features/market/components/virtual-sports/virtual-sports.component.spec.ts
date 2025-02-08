import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualSportsComponent } from './virtual-sports.component';

describe('VirtualSportsComponent', () => {
  let component: VirtualSportsComponent;
  let fixture: ComponentFixture<VirtualSportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VirtualSportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualSportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
