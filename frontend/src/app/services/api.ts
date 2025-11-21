// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DbData } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = '/api';
  constructor(private http: HttpClient) {}

  getData(): Observable<DbData> {
    return this.http.get<DbData>(`${this.apiUrl}/data`);
  }

  saveData(data: DbData): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, data);
  }
}