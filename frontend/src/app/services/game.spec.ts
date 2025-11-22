import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { GameService } from './game';
import { StateService } from './state';
import { of } from 'rxjs';
import { DbData } from '../models';

class MockStateService {
  addCarotte = vi.fn();
  addCarotteOr = vi.fn();
}

describe('GameService', () => {
  let service: GameService;
  let stateService: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: StateService, useClass: MockStateService }
      ]
    });
    service = TestBed.inject(GameService);
    stateService = TestBed.inject(StateService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startSession', () => {
    it('should initialize the game state', async () => {
      vi.useFakeTimers();
      const words = ['mot1', 'mot2', 'mot3'];
      service.startSession(1, words);
      vi.advanceTimersByTime(500); // for the speak timeout

      expect(service.queue().length).toBe(2);
      expect(service.currentWord()).not.toBeNull();
      expect(service.currentWord()?.texte).toBeDefined();
      expect(service.streak()).toBe(0);
      expect(service.vegetableStage()).toBe(0);
      expect(service.feedbackState()).toBe('waiting');
    });
  });

  describe('checkAnswer', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      // We use a predictable list to test the logic
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      service.startSession(1, ['un', 'deux']);
      vi.advanceTimersByTime(500); // initial speak
    });

    it('should handle a correct answer', async () => {
      const currentWord = service.currentWord()!.texte;
      service.checkAnswer(currentWord);

      expect(service.feedbackState()).toBe('success');
      expect(service.vegetableStage()).toBe(1);
      expect(service.streak()).toBe(1);

      vi.advanceTimersByTime(3000); // for nextWord timeout

      expect(service.currentWord()?.texte).not.toBe(currentWord);
      expect(service.queue().length).toBe(0);
    });

    it('should handle an incorrect answer', async () => {
      const incorrectWord = 'wrong';
      const originalWord = service.currentWord()!;

      service.checkAnswer(incorrectWord);

      expect(service.feedbackState()).toBe('error');
      expect(service.streak()).toBe(0);
      expect(service.queue().length).toBe(2); // The other word + the failed one at the end
      expect(service.queue()[1].texte).toBe(originalWord.texte);
      expect(service.queue()[1].erreurs).toBe(1);

      vi.advanceTimersByTime(3000); // for nextWord timeout

      expect(service.currentWord()?.texte).not.toBe(originalWord.texte);
    });

    it('should handle success streak and vegetable growth', async () => {
        service.startSession(1, ['a', 'b', 'c', 'd']);
        vi.advanceTimersByTime(500);

        // 1st success
        service.checkAnswer(service.currentWord()!.texte);
        vi.advanceTimersByTime(1500);
        expect(service.vegetableStage()).toBe(1);
        expect(service.streak()).toBe(1);
        expect(stateService.addCarotte).not.toHaveBeenCalled();
        expect(stateService.addCarotteOr).not.toHaveBeenCalled();

        // 2nd success
        service.checkAnswer(service.currentWord()!.texte);
        vi.advanceTimersByTime(1500);
        expect(service.vegetableStage()).toBe(2);
        expect(service.streak()).toBe(2);
        expect(stateService.addCarotte).not.toHaveBeenCalled();
        expect(stateService.addCarotteOr).not.toHaveBeenCalled();

        // 3rd success (streak resets, vegetable is harvested)
        service.checkAnswer(service.currentWord()!.texte);
        expect(service.streak()).toBe(3);
        expect(service.vegetableStage()).toBe(3);
        expect(stateService.addCarotte).not.toHaveBeenCalled();
        expect(stateService.addCarotteOr).toHaveBeenCalledWith(1);

        vi.advanceTimersByTime(1000); // timeout to reset vegetable stage
        expect(service.vegetableStage()).toBe(0);

        vi.advanceTimersByTime(500); // remaining timeout for nextWord

        // 4th success
        service.checkAnswer(service.currentWord()!.texte);
        vi.advanceTimersByTime(1500);
        expect(service.vegetableStage()).toBe(1);
        expect(service.streak()).toBe(4);
    });

    it('should end the game when queue is empty', async () => {
        service.startSession(1, ['un']);
        vi.advanceTimersByTime(500);

        service.checkAnswer('un');
        vi.advanceTimersByTime(1500);

        expect(service.currentWord()).toBeNull();
    });
  });
});
