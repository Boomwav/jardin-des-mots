import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { GameComponent } from './game';
import { GameService, MotJeu } from '../../services/game';
import { StateService } from '../../services/state';
import { DbData } from '../../models';
import { vi } from 'vitest';

// --- MOCKS ---

const mockDbData: DbData = {
  profils: [
    {
      id: 1,
      nom: 'Test User',
      avatar: '👩‍🚀',
      inventaire: { carotte: 0, tomate: 0 },
      carottes_or: 0,
      listes: [
        { id: 1, titre: 'Liste 1', description: 'desc 1', mots: ['un', 'deux'] }
      ]
    }
  ]
};

class MockStateService {
  profils = signal(mockDbData.profils);
  loadInitialData = vi.fn().mockReturnValue(of(mockDbData));
}

class MockGameService {
  feedbackState = signal<'waiting' | 'success' | 'error'>('waiting');
  vegetableStage = signal<number>(0);
  streak = signal<number>(0);
  currentWord = signal<MotJeu | null>(null);

  startSession = vi.fn();
  checkAnswer = vi.fn();
}

class MockRouter {
    navigate = vi.fn();
}


describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameService: MockGameService;
  let stateService: MockStateService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent, HttpClientTestingModule],
      providers: [
        { provide: GameService, useClass: MockGameService },
        { provide: StateService, useClass: MockStateService },
        { provide: Router, useClass: MockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'profilId' ? '1' : '1'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService) as unknown as MockGameService;
    stateService = TestBed.inject(StateService) as unknown as MockStateService;
    router = TestBed.inject(Router);
    fixture.detectChanges(); // This triggers ngOnInit
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and start a game session on ngOnInit', () => {
    expect(stateService.profils).toBeDefined();
    expect(component.profilId).toBe(1);
    expect(gameService.startSession).toHaveBeenCalledWith(1, ['un', 'deux']);
  });

  it('should load data if not present and then start the game', () => {
    stateService.profils.set([]);
    component.ngOnInit();
    expect(stateService.loadInitialData).toHaveBeenCalled();
    expect(gameService.startSession).toHaveBeenCalledWith(1, ['un', 'deux']);
  });

  describe('valider', () => {
    it('should not do anything if userInput is empty', () => {
      component.userInput = '';
      component.valider();
      expect(gameService.checkAnswer).not.toHaveBeenCalled();
    });

    it('should call checkAnswer', () => {
      component.userInput = 'test';
      component.valider();
      expect(gameService.checkAnswer).toHaveBeenCalledWith('test');
    });
  });

  describe('effects', () => {
    it('should clear input on success', async () => {
        component.userInput = 'test';
        gameService.feedbackState.set('success');
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.userInput).toBe('');
    });

    it('should clear input after a delay on error', async () => {
        vi.useFakeTimers();
        component.userInput = 'test';
        gameService.feedbackState.set('error');
        fixture.detectChanges();
        await fixture.whenStable();
        vi.advanceTimersByTime(2000);
        expect(component.userInput).toBe('');
    });
  });

  it('should navigate to dashboard on quitter', () => {
    component.profilId = 1;
    component.quitter();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 1]);
  });
});
