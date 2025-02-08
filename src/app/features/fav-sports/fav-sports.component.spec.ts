import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavSportsComponent } from './fav-sports.component';

describe('FavSportsComponent', () => {
  let component: FavSportsComponent;
  let fixture: ComponentFixture<FavSportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FavSportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FavSportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
