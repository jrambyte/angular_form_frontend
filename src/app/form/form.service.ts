import { Injectable } from '@angular/core';
import { AppService } from '../app.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class FormService {
  private formEndpoint = 'process-form.php';
  private comuniEndpoint = 'select.php';
  private capEndpoint = 'select-cap.php';

  constructor(private appService: AppService) { }

  getFormData(): Observable<any> {
    return this.appService.get<any>(this.formEndpoint);
  }

  getComuneById(id: string | number): Observable<any> {
    const url = `${this.comuniEndpoint}?id=${id}`;
    return this.appService.get<any>(url).pipe(
      map((response: any) => response?.status === 'success' ? response.data : null),
      catchError(() => of(null))
    );
  }

  getComuniService(search: string = ''): Observable<any[]> {
    if (!search || search.length < 2) {
      return of([]);
    }

    const url = `${this.comuniEndpoint}?search=${encodeURIComponent(search)}`;
    
    return this.appService.get<any>(url).pipe(
      map((response: any) => response?.status === 'success' && Array.isArray(response?.data) ? response.data : []),
      catchError(() => of([]))
    );
  }

  getCAPByComune(comuneId: string): Observable<any[]> {
    const url = `${this.capEndpoint}?comuneId=${comuneId}`;
    
    return this.appService.get<any>(url).pipe(
      map((response: any) => response?.status === 'success' && Array.isArray(response?.data) ? response.data : []),
      catchError(() => of([]))
    );
  }

  saveFormData(formData: any): Observable<any> {
    return this.appService.post<any>(this.formEndpoint, formData);
  }
}