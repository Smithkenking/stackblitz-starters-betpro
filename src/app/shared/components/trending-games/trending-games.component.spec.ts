import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingGamesComponent } from './trending-games.component';

describe('TrendingGamesComponent', () => {
  let component: TrendingGamesComponent;
  let fixture: ComponentFixture<TrendingGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrendingGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendingGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
