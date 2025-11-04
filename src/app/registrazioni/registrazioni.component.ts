import { DxDataGridModule, DxLookupModule } from 'devextreme-angular';
import { RegistrazioniService } from './registrazioni.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedDataService, RegistrationData } from '../servizioCondiviso/serviceCondivisioneDati';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registrazioni',
  templateUrl: './registrazioni.component.html',
  styleUrls: ['./registrazioni.component.css'],
  standalone: true,
  imports: [
    DxDataGridModule,
    DxLookupModule,
  ]
})
export class RegistrazioniComponent implements OnInit, OnDestroy {

  registrazioni: RegistrationData[] = [];
  loading: boolean = true;
  sessoItems: string[] = ['Uomo', 'Donna', 'Preferisco non specificare'];

  private subscriptions = new Subscription();

  constructor(
    private registrazioniService: RegistrazioniService,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.loadRegistrazioni();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupRealTimeUpdates(): void {
    const newRegistrationSub = this.sharedDataService.registrazioneAggiunta$.subscribe(
      (nuovaRegistrazione: RegistrationData) => {
        this.registrazioni.unshift(nuovaRegistrazione);
      }
    );

    this.subscriptions.add(newRegistrationSub);
  }

  private loadRegistrazioni(): void {
    this.loading = true;

    this.registrazioniService.getAllRegistrazioni().subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.registrazioni = response.data;
        } else {
          this.registrazioni = [];
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore caricamento registrazioni:', error);
        this.loading = false;
      }
    });
  }
}