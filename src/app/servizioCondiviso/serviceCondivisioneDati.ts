import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Interfaccia per i dati di registrazione
export interface RegistrationData {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  codiceFiscale: string;
  comuneResidenza: any; // Oggetto con id e text del comune
  cap: string;
  sesso: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  
  //  Subject che trasporta i DATI della nuova registrazione
  private registrazioneAggiunta = new Subject<RegistrationData>();
  
  // Observable pubblico per i componenti
  registrazioneAggiunta$ = this.registrazioneAggiunta.asObservable();
  
  //  Metodo che passa i dati della nuova registrazione
  notificaNuovaRegistrazione(nuovaRegistrazione: RegistrationData): void {
    console.log(' Invio nuova registrazione:', nuovaRegistrazione);
    this.registrazioneAggiunta.next(nuovaRegistrazione);
  }}
