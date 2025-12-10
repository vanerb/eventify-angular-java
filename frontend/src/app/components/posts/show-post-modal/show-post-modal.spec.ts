import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPostModal } from './show-post-modal';

describe('ShowPostModal', () => {
  let component: ShowPostModal;
  let fixture: ComponentFixture<ShowPostModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowPostModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowPostModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
