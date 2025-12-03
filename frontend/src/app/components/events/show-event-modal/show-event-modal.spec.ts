import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEventModal } from './show-event-modal';

describe('ShowEventModal', () => {
  let component: ShowEventModal;
  let fixture: ComponentFixture<ShowEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowEventModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
