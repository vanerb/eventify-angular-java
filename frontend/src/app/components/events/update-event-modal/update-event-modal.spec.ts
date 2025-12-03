import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEventModal } from './update-event-modal';

describe('UpdateEventModal', () => {
  let component: UpdateEventModal;
  let fixture: ComponentFixture<UpdateEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEventModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
