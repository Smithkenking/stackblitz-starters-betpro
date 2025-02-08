import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingEffectComponent } from './loading-effect.component';

describe('LoadingEffectComponent', () => {
  let component: LoadingEffectComponent;
  let fixture: ComponentFixture<LoadingEffectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingEffectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingEffectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
