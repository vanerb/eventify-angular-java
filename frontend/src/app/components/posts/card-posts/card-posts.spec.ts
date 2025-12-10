import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPosts } from './card-posts';

describe('CardPosts', () => {
  let component: CardPosts;
  let fixture: ComponentFixture<CardPosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPosts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
