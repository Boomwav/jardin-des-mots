import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordListFormComponent } from './word-list-form.component';

describe('WordListFormComponent', () => {
  let component: WordListFormComponent;
  let fixture: ComponentFixture<WordListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordListFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
