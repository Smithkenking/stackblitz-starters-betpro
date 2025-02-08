import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterPageLayoutComponent } from './footer-page-layout.component';

describe('FooterPageLayoutComponent', () => {
  let component: FooterPageLayoutComponent;
  let fixture: ComponentFixture<FooterPageLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterPageLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterPageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
