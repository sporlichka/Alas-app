import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomProductComponent } from './random-product.component';

describe('RandomProductComponent', () => {
  let component: RandomProductComponent;
  let fixture: ComponentFixture<RandomProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandomProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
