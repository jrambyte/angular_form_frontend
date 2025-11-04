import { Injectable } from '@angular/core';
import { AppService } from '../app.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrazioniService {
  private registrazioniEndpoint = 'registrazioni.php';
  private comuniEndpoint = 'select.php';
  getComuniService: any;

  constructor(private appService: AppService) { }

  /**
   * Recupera tutte le registrazioni dal database
   */
  getAllRegistrazioni(): Observable<any> {
    return this.appService.get<any>(this.registrazioniEndpoint);
  }

  getComuniForLookup(): Observable<any> {
      return this.appService.get<any>(this.comuniEndpoint);
    }
  }
  
/**
 *  Flusso completo:
RegistrazioniComponent chiama RegistrazioniService.getAllRegistrazioni()
il Service fa una richiesta HTTP al server PHP
registrazioni.php interroga il database MySQL
Database restituisce tutti i record della tabella datiform
PHP formatta i dati in JSON e li invia ad Angular
RegistrazioniComponent riceve i dati e li mostra nella griglia
 */