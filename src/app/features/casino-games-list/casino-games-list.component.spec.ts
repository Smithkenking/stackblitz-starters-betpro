import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoGamesListComponent } from './casino-games-list.component';

describe('CasinoGamesListComponent', () => {
  let component: CasinoGamesListComponent;
  let fixture: ComponentFixture<CasinoGamesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasinoGamesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoGamesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
