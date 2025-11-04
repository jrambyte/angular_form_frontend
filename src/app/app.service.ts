import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = 'http://localhost/backend-php/api/';

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string): Observable<T> {
    // GET senza header personalizzati - evita preflight CORS
    return this.http.get<T>(this.apiUrl + endpoint);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    // POST con header
    return this.http.post<T>(this.apiUrl + endpoint, data, {
      headers: this.getHeaders()
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
}