import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListeMots } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class WordListService {
  private apiUrl = '/api/profils';

  constructor(private http: HttpClient) { }

  getWordLists(profilId: number): Observable<ListeMots[]> {
    return this.http.get<ListeMots[]>(`${this.apiUrl}/${profilId}/listes`);
  }

  addWordList(profilId: number, list: ListeMots): Observable<ListeMots> {
    return this.http.post<ListeMots>(`${this.apiUrl}/${profilId}/listes`, list);
  }

  updateWordList(profilId: number, list: ListeMots): Observable<ListeMots> {
    return this.http.put<ListeMots>(`${this.apiUrl}/${profilId}/listes/${list.id}`, list);
  }

  deleteWordList(profilId: number, listId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${profilId}/listes/${listId}`);
  }
}
