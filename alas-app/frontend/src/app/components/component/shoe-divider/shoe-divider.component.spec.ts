import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoeDividerComponent } from './shoe-divider.component';

describe('ShoeDividerComponent', () => {
  let component: ShoeDividerComponent;
  let fixture: ComponentFixture<ShoeDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoeDividerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoeDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
