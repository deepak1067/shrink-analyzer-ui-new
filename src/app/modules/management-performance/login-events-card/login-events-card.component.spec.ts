import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginEventsCardComponent } from './login-events-card.component';
import { MaterialModule } from 'src/app/shared/module/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

describe('LoginEventsCardComponent', () => {
  let component: LoginEventsCardComponent;
  let fixture: ComponentFixture<LoginEventsCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginEventsCardComponent],
      imports: [MaterialModule, SharedModule, TranslateModule.forRoot()]
    });
    fixture = TestBed.createComponent(LoginEventsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
