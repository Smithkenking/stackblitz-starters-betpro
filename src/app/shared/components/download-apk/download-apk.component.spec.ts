import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadApkComponent } from './download-apk.component';

describe('DownloadApkComponent', () => {
  let component: DownloadApkComponent;
  let fixture: ComponentFixture<DownloadApkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DownloadApkComponent]
    });
    fixture = TestBed.createComponent(DownloadApkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
