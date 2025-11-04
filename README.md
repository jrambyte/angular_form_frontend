# Form Component - Documentazione Architettura

## Struttura Cartella

```
form/
├── form.component.ts          Componente principale (UI logic)
├── form.component.html        Template form
├── form.component.css         Stili
├── form.service.ts            Servizio HTTP
├── form-config.ts             Costanti e opzioni dropdown
├── form-models.ts             Interfacce TypeScript
└── README.md                  Questa documentazione
```

---

## Architettura Generale

### Flusso Dati

```
User Input (HTML)
    ↓
form.component.ts (event handlers)
    ↓
form.service.ts (HTTP calls)
    ↓
Backend PHP (process-form.php, select.php, select-cap.php)
    ↓
Database
    ↓
Response
    ↓
form.component.ts (update UI)
    ↓
SharedDataService (notifica tabella)
```

---

## File: form-config.ts

**Scopo:** Centralizzare tutte le costanti e configurazioni UI.

**Contenuti:**

```typescript
SESSO_ITEMS
  - Array di opzioni per dropdown sesso
  - Uso: editorOptions

EDITOR_OPTIONS_COMUNE
  - Configurazione dropdown ricerca comuni
  - searchEnabled: true → permette ricerca
  - minSearchLength: 2 → ricerca da 2+ caratteri
  - searchTimeout: 500 → debounce 500ms

EDITOR_OPTIONS_CAP
  - Configurazione dropdown CAP
  - searchEnabled: true → permette ricerca
  - displayExpr: 'cap' → mostra campo cap
  - valueExpr: 'id' → salva id in formData.cap
```

**Vantaggi:**
- Facile modificare stili senza toccare logica
- Unico punto di modifica per tutte le opzioni
- Evita duplicazione codice

---

## File: form-models.ts

**Scopo:** Definire interfacce TypeScript per type safety.

**Interfacce:**

```typescript
FormDataModel
  ├── nome: string
  ├── cognome: string
  ├── email: string
  ├── codiceFiscale: string
  ├── comuneResidenza: number | null  ← ID del comune
  ├── cap: string                      ← CAP selezionato
  └── sesso: string

RegistrationModel extends FormDataModel
  └── id: number                       ← Aggiunge ID registrazione

ApiResponse<T>
  ├── status: 'success' | 'error'
  ├── data?: T
  ├── message?: string
  ├── id?: number
  └── insertId?: number                ← ID dal DB (MySQL)
```

**Vantaggi:**
- Type checking in compile time
- Autocomplete IDE
- Previene errori runtime
- Documentazione codice

---

## File: form.service.ts

**Scopo:** Gestire tutte le chiamate HTTP verso backend.

### Metodi:

#### `getFormData(): Observable<any>`
- Endpoint: `process-form.php`
- Uso: Caricare dati preesistenti (non usato attualmente)
- Return: Observable di form data

#### `getComuniService(search: string): Observable<any[]>`
- Endpoint: `select.php?search={search}`
- Input: stringa ricerca (minimo 2 caratteri)
- Logic:
  ```
  se search.length < 2 → return []
  altrimenti → chiama endpoint
  → estrae response.data
  → se errore → return []
  ```
- Return: Array comuni `[{ id, text }, ...]`

#### `getCAPByComune(comuneId: number): Observable<any[]>`
- Endpoint: `select-cap.php?comuneId={comuneId}`
- Input: ID del comune selezionato
- Logic:
  ```
  chiama endpoint con comuneId
  → estrae response.data
  → se errore → return []
  ```
- Return: Array CAP `[{ id, cap }, ...]`

#### `saveFormData(formData: any): Observable<any>`
- Endpoint: `process-form.php` (POST)
- Input: FormDataModel compilato
- Logic:
  ```
  POST formData
  → se errore → lancia eccezione
  ```
- Return: ApiResponse con id/insertId

**Error Handling:**
- Tutti i metodi tornano array vuoto `[]` se errore (tranne save)
- Save lancia eccezione per gestione custom nel component

---

## File: form.component.ts

**Scopo:** Logica UI e orchestrazione service.

### Properties:

```typescript
formData: FormDataModel              ← Dati form compilati
sessoItems: string[]                ← Opzioni sesso (da config)
editorOptionsComune: any            ← Config dropdown comuni
editorOptionsCAP: any               ← Config dropdown CAP
loading: boolean                    ← Flag invio in corso
formReg: DxFormComponent            ← Riferimento form DevExtreme
```

### Metodi:

#### `ngOnInit(): void`
**Quando:** Al caricamento componente
**Cosa fa:** Inizializza CustomStore per ricerca comuni
```
1. Crea CustomStore con logica ricerca
2. CustomStore intercetta searchValue dall'input
3. Se searchValue >= 2 char → chiama service
4. Assegna CustomStore a editorOptionsComune.dataSource
```

#### `initializeCustomStore(): void (private)`
**Quando:** Dalla ngOnInit
**Cosa fa:** Setup CustomStore per dropdown comuni
```
CustomStore.load(loadOptions):
  - Estrae searchValue
  - Se < 2 char → return []
  - Se >= 2 char → chiama getComuniService
  - Ritorna {data: comuni, totalCount}
```
**Perché:** DevExtreme CustomStore permette ricerca lato server con debounce

#### `onComuneChange(event: any): void`
**Quando:** Utente seleziona/cambia comune
**Cosa fa:** 
```
1. Estrae comuneId da event.value
2. Se comuneId → chiama loadCAPByComune
3. Se null → resetta dropdown CAP e formData.cap
```

#### `loadCAPByComune(comuneId: number): void (private)`
**Quando:** Dalla onComuneChange
**Cosa fa:**
```
1. Chiama formService.getCAPByComune(comuneId)
2. Se dati arrivano → popola editorOptionsCAP.dataSource
3. Se errore → resetta a []
```
**Result:** Dropdown CAP si riempie con CAP del comune

#### `saveFormData(e?: any): void`
**Quando:** Utente clicca "Invia"
**Logica:**
```
1. Valida form con validateForm()
2. Se invalido → return (non invia)
3. loading = true
4. Chiama formService.saveFormData(formData)
5. Se successo:
   - Estrae serverId da response (fallback: Date.now())
   - Crea RegistrationData completo
   - Notifica SharedDataService (aggiorna tabella)
   - Resetta form
   - loading = false
6. Se errore:
   - Log console
   - loading = false
```

#### `validateForm(): boolean (private)`
**Quando:** Prima di inviare
**Cosa fa:**
```
1. Controlla formReg.instance esista
2. Esegue validazione DevExtreme
3. Controlla comuneResidenza != null
4. Return true se tutto valido
```
**Validazioni devextreme (nel template):**
- Nome: required
- Cognome: required
- Email: required, email format
- CF: required, regex pattern
- Comune: required
- CAP: required

#### `resetForm(): void (private)`
**Quando:** Dopo invio successo
**Cosa fa:**
```
1. Resetta tutti campi a valori iniziali
2. Chiama formReg.instance.resetValues()
3. Svuota errori validazione
```

---

## File: form.component.html

**Elementi chiave:**

```html
<dx-form #formReg [formData]="formData" [colCount]="2">

  <!-- Campo Comune -->
  <dxi-item 
    dataField="comuneResidenza"
    editorType="dxSelectBox"
    [editorOptions]="editorOptionsComune"
    (onValueChanged)="onComuneChange($event)"
  >
    <!-- (onValueChanged) scatta quando cambia valore -->
  </dxi-item>

  <!-- Campo CAP -->
  <dxi-item 
    dataField="cap"
    editorType="dxSelectBox"
    [editorOptions]="editorOptionsCAP"
  >
    <!-- popola da formService.getCAPByComune() -->
  </dxi-item>

  <!-- Button Invia -->
  <dx-button
    [text]="'Invia'"
    (onClick)="saveFormData($event)"
  />
</dx-form>
```

---

## Data Binding

### Flow Input → Output:

```
User seleziona comune
  ↓
(onValueChanged) event triggered
  ↓
onComuneChange() legge event.value
  ↓
formData.comuneResidenza = event.value (automatico DevExtreme)
  ↓
loadCAPByComune() chiama service
  ↓
editorOptionsCAP.dataSource si popola
  ↓
Dropdown CAP si aggiorna in real-time

User invia form
  ↓
(onClick) scatta
  ↓
saveFormData() legge formData completo
  ↓
POST al backend
  ↓
Response torna con id
  ↓
SharedDataService notifica
  ↓
Tabella (altra pagina) riceve evento
  ↓
Tabella aggiorna con nuova riga
```

---

## Comunicazione tra Componenti

### Form → Tabella (via SharedDataService):

```typescript
// form.component.ts
const nuovaRegistrazione: RegistrationData = { ... };
this.sharedDataService.notificaNuovaRegistrazione(nuovaRegistrazione);

// registrazioni.component.ts
this.sharedDataService.nuovaRegistrazione$.subscribe(
  (registro: RegistrationData) => {
    this.aggiungiRigaTabella(registro);
  }
);
```

---

## Nomi Endpoint Backend

**Attesi dal service:**

| Endpoint | Metodo | Parametri | Response |
|----------|--------|-----------|----------|
| `select.php` | GET | `search={string}` | `{ status: 'success', data: [{id, text}] }` |
| `select-cap.php` | GET | `comuneId={number}` | `{ status: 'success', data: [{id, cap}] }` |
| `process-form.php` | POST | `{...formData}` | `{ status: 'success', id/insertId: number }` |

---

## Error Handling

| Scenario | Gestione |
|----------|----------|
| Ricerca comuni < 2 char | Service ritorna `[]` |
| Ricerca comuni errore API | Service ritorna `[]` |
| CAP non trovati | Service ritorna `[]` |
| Form invalido | Validazione previene invio |
| Invio errore | console.error, loading = false |

---

## Type Safety

Grazie a form-models.ts:

```typescript
// ✅ Type safe
const reg: FormDataModel = { nome: 'Luigi', ... };

// ❌ Errore compile time
const reg: FormDataModel = { nome: 123 }; // Type 'number' not assignable to 'string'
```

---

## Modifiche Future

Se devi aggiungere campi:

1. **Aggiungi a FormDataModel** (form-models.ts)
2. **Aggiungi a formData** (form.component.ts)
3. **Aggiungi `<dxi-item>` in HTML** (form.component.html)
4. **Se dropdown:** aggiungi opzioni a form-config.ts

Tutto sincronizzato automaticamente.

---

## Testing

Punti da testare:

- [ ] Ricerca comuni con < 2 caratteri (deve tornare [])
- [ ] Ricerca comuni con 2+ caratteri (deve tornare dati)
- [ ] Selezione comune carica CAP corrispondenti
- [ ] Form validation (required fields)
- [ ] Invio form non valido (blocca)
- [ ] Invio form valido (invia + reset)
- [ ] Cambio comune resetta CAP
- [ ] SharedDataService notifica tabella

---

## Note

- Form usa DevExtreme Components (DxForm, DxSelectBox)
- CustomStore permette lazy-loading e ricerca lato server
- Tutto è type-safe grazie a form-models.ts
- Config centralizzata in form-config.ts (facile manutenzione)