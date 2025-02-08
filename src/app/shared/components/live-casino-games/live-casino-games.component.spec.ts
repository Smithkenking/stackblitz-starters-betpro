import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCasinoGamesComponent } from './live-casino-games.component';

describe('LiveCasinoGamesComponent', () => {
  let component: LiveCasinoGamesComponent;
  let fixture: ComponentFixture<LiveCasinoGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveCasinoGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveCasinoGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
