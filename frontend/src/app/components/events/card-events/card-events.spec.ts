import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEvents } from './card-events';

describe('CardEvents', () => {
  let component: CardEvents;
  let fixture: ComponentFixture<CardEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
