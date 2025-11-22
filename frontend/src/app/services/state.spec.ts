import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { StateService } from './state';
import { ApiService } from './api';
import { DbData } from '../models';
import { vi } from 'vitest';

const mockDbData: DbData = {
  profils: [
    {
      id: 1,
      nom: 'Test User',
      avatar: '👩‍🚀',
      inventaire: { carotte: 0, tomate: 0 },
      carottes_or: 0,
      listes: []
    }
  ]
};

class MockApiService {
  getData() {
    return of(JSON.parse(JSON.stringify(mockDbData))); // Deep copy
  }
  saveData(data: DbData) {
    return of(data);
  }
}

describe('StateService', () => {
  let service: StateService;
  let apiService: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StateService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });
    service = TestBed.inject(StateService);
    apiService = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial data and set the signal', () => {
    service.loadInitialData().subscribe(() => {
      expect(service.profils()).toEqual(mockDbData.profils);
    });
  });

  it('should add a carotte to the correct profil', () => {
    service.loadInitialData().subscribe(() => {
      const spy = vi.spyOn(apiService, 'saveData');
      service.addCarotte(1);
      const updatedProfil = service.profils().find(p => p.id === 1);
      expect(updatedProfil?.inventaire.carotte).toBe(1);
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should add a golden carotte to the correct profil', () => {
    service.loadInitialData().subscribe(() => {
      const spy = vi.spyOn(apiService, 'saveData');
      service.addCarotteOr(1);
      const updatedProfil = service.profils().find(p => p.id === 1);
      expect(updatedProfil?.carottes_or).toBe(1);
      expect(spy).toHaveBeenCalled();
    });
  });
});
