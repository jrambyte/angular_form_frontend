# Modulo Registrazioni Utenti

Componente Angular per la visualizzazione e gestione delle registrazioni utenti attraverso una griglia dati con supporto per lookup dei comuni italiani.

## 📋 Panoramica

Il modulo **Registrazioni** permette di:
- Visualizzare tutte le registrazioni utenti in formato tabellare
- Risolvere automaticamente i codici id comuni in nomi leggibili
- Gestire il caricamento asincrono dei dati
- Fornire un'interfaccia user-friendly per la consultazione dei dati

## 🏗️ Architettura

### Componenti principali

| File | Responsabilità |
|------|----------------|
| `registrazioni.component.ts` | Logica di presentazione e gestione stato |
| `registrazioni.component.html` | Template con griglia DevExtreme |
| `registrazioni.service.ts` | Gestione chiamate HTTP al backend |

### Flusso dei dati

```
Database MySQL → PHP Backend → Angular Service → Component → DevExtreme Grid
```

## 🚀 Installazione e Setup

### Prerequisiti
- Angular 15+
- DevExtreme Angular
- Backend PHP con endpoint REST

### Dipendenze
```typescript
import { DxDataGridModule, DxLookupModule } from 'devextreme-angular';
```

### Configurazione
1. Assicurarsi che gli endpoint backend siano configurati:
   - `registrazioni.php` - per le registrazioni
   - `select.php` - per i comuni
2. Importare il componente nel modulo desiderato
3. Aggiungere il routing se necessario

## 📊 Struttura Dati

### RegistrationData Interface
```typescript
interface RegistrationData {
  id?: number;                // ID univoco generato dal database
  nome: string;              // Nome utente
  cognome: string;           // Cognome utente
  email: string;             // Email utente
  codiceFiscale: string;     // Codice fiscale
  comuneResidenza: any;      // Oggetto {id: number, text: string}
}
```

### Formato risposta backend
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nome": "Mario",
      "cognome": "Rossi",
      "email": "mario.rossi@email.com",
      "codiceFiscale": "RSSMRA80A01H501X",
      "comuneResidenza": {
        "id": 3001,
        "text": "Milano"
      }
    }
  ]
}
```

## 🔧 Funzionalità Principali

### Caricamento Dati
- **Automatico**: al caricamento del componente
- **Manuale**: tramite `refreshData()`
- **Gestione errori**: logging e fallback per dati mancanti

### Visualizzazione Griglia
- **Colonne**: ID, Nome, Cognome, Email, Codice Fiscale, Comune
- **Lookup Comuni**: risoluzione automatica ID → Nome comune
- **Responsive**: adattamento automatico larghezza colonne
- **Styling**: bordi e linee per migliore leggibilità

### Gestione Stati
- **Loading**: indicatore di caricamento
- **Error Handling**: gestione errori HTTP
- **Data Validation**: controllo struttura dati ricevuti

## 🎯 Utilizzo

### Integrazione nel template
```html
<app-registrazioni></app-registrazioni>
```

### Personalizzazione colonne
Le colonne della griglia possono essere personalizzate modificando il template HTML:

```html
<dxi-column 
  dataField="nuovoCampo" 
  caption="Nuova Colonna"
  [width]="120">
</dxi-column>
```

### Aggiunta funzionalità
Per estendere il componente:

1. **Nuovi campi**: aggiornare `RegistrationData` interface
2. **Nuovi endpoint**: estendere `RegistrazioniService`
3. **Nuove colonne**: modificare il template HTML

## 🔍 API Endpoints

### GET /registrazioni.php
Recupera tutte le registrazioni dal database.

**Risposta:**
```json
{
  "status": "success|error",
  "data": RegistrationData[],
  "message": "Messaggio opzionale"
}
```

### GET /select.php
Recupera l'elenco dei comuni per il lookup.

**Risposta:**
```json
{
  "status": "success|error", 
  "data": [
    {"id": 1, "text": "Nome Comune"}
  ]
}
```

## 🐛 Troubleshooting

### Problemi comuni

**Griglia vuota**
- Verificare la connessione al backend
- Controllare la console per errori HTTP
- Verificare il formato della risposta JSON

**Comuni non visualizzati**
- Assicurarsi che `select.php` restituisca dati
- Verificare che `comuneResidenza` abbia la struttura `{id, text}`

**Errori di caricamento**
- Controllare gli endpoint nel service
- Verificare i permessi CORS se necessario
- Controllare i log del server PHP

### Debug
Abilitare i log nella console:
```typescript
console.log('Dati caricati:', response);
console.log('Comuni caricati:', this.comuniDataSource.length);
```

## 📝 Note di Sviluppo

- Il componente è **standalone** e non richiede un modulo dedicato
- Utilizza **OnPush change detection** per ottimizzare le performance
- Gestisce automaticamente la **mappatura dei dati** per compatibilità con DevExtreme
- Include **gestione errori** robusta per scenari di produzione

## 🔄 Roadmap

### Funzionalità future
- [ ] Filtri avanzati per la griglia
- [ ] Esportazione dati (Excel, PDF)
- [ ] Editing inline delle registrazioni
- [ ] Paginazione server-side
- [ ] Cache dei comuni per migliorare le performance

---

**Versione:** 1.0.0  
**Ultima modifica:** Giugno 2025  
**Compatibilità:** Angular 15+, DevExtreme 22+