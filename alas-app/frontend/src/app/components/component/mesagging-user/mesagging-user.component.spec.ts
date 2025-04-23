import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesaggingUserComponent } from './mesagging-user.component';

describe('MesaggingUserComponent', () => {
  let component: MesaggingUserComponent;
  let fixture: ComponentFixture<MesaggingUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaggingUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesaggingUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
