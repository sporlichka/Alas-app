import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesaggingAdminComponent } from './mesagging-admin.component';

describe('MesaggingAdminComponent', () => {
  let component: MesaggingAdminComponent;
  let fixture: ComponentFixture<MesaggingAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaggingAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesaggingAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
