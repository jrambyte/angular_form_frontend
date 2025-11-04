import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  DxFormModule,
  DxButtonModule,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxFormComponent,
} from 'devextreme-angular';
import {DxiValidationRuleModule} from 'devextreme-angular/ui/nested';
import {FormService} from './form.service';
import CustomStore from 'devextreme/data/custom_store';
import {RegistrationData, SharedDataService} from '../servizioCondiviso/serviceCondivisioneDati';
import {
  SESSO_ITEMS,
  EDITOR_OPTIONS_COMUNE,
  EDITOR_OPTIONS_CAP,
  validatePasswordStrength,
  validatePasswordMatch,
  CODICE_FISCALE_PATTERN,
  CODICE_FISCALE_ERROR_MESSAGE,
} from './form-config';
import {FormDataModel, ApiResponse} from './form-models';
import {FieldDataChangedEvent} from 'devextreme/ui/form';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    DxFormModule,
    DxButtonModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxiValidationRuleModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  @ViewChild('formReg', {static: false}) formReg!: DxFormComponent;

  formData: FormDataModel = {
    nome: '',
    cognome: '',
    email: '',
    codiceFiscale: '',
    comuneResidenza: null,
    cap: '',
    sesso: '',
    password: '',
    passwordConfirm: ''
  };

  sessoItems = SESSO_ITEMS;
  editorOptionsComune = {...EDITOR_OPTIONS_COMUNE};
  editorOptionsCAP = {...EDITOR_OPTIONS_CAP};
  
  capList: any[] = [];
  private capCustomStore: any;
  loading = false;

  codiceFiscalePattern = CODICE_FISCALE_PATTERN;
  codiceFiscaleErrorMessage = CODICE_FISCALE_ERROR_MESSAGE;

  constructor (
    private formService: FormService,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.initializeCustomStore();
    this.initializeCapCustomStore();
  }

  validatePassword = (params: any): boolean => {
    return validatePasswordStrength(params.value);
  };

  getPasswordValue = (): string => {
    return this.formData.password;
  };

  private initializeCustomStore(): void {
    const customStore = new CustomStore({
      key: 'id',
      load: (loadOptions: any) => {
        const searchValue = loadOptions.searchValue || '';

        if (!searchValue || searchValue.length < 2) {
          return Promise.resolve({data: [], totalCount: 0});
        }

        return new Promise((resolve) => {
          this.formService.getComuniService(searchValue).subscribe({
            next: (comuni: any[]) => {
              resolve({data: comuni, totalCount: comuni.length});
            },
            error: () => {
              resolve({data: [], totalCount: 0});
            }
          });
        });
      },
      byKey: (key: any) => {
        return new Promise((resolve) => {
          this.formService.getComuneById(key).subscribe({
            next: (comune: any) => {
              resolve(comune);
            },
            error: () => {
              resolve(null);
            }
          });
        });
      }
    });

    this.editorOptionsComune = {
      ...this.editorOptionsComune,
      dataSource: customStore
    };
  }

  private initializeCapCustomStore(): void {
    this.capCustomStore = new CustomStore({
      load: () => {
        return Promise.resolve(this.capList);
      },
      byKey: (key: any) => {
        const item = this.capList.find((c: any) => c.id === key);
        return Promise.resolve(item || null);
      }
    });

    this.editorOptionsCAP = {
      ...this.editorOptionsCAP,
      dataSource: this.capCustomStore
    };
  }

  onFieldDataChanged = (e: FieldDataChangedEvent): void => {
    if (e.dataField === "comuneResidenza" && e.value) {
      this.loadCAPByComune(e.value);
    }
  }
 
  private loadCAPByComune(comuneId: string): void {
    this.formService.getCAPByComune(comuneId).subscribe({
      next: (capList: any[]) => {
        this.capList = capList.map((item: any) => ({
          id: item.id,
          cap: item.cap
        }));
        
        if (this.capCustomStore) {
          this.capCustomStore.clearRawDataCache();
        }
      },
      error: (err) => console.error('CAP load error:', err)
    });
  }

  saveFormData(e?: any): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    const dataToSend = {
      nome: this.formData.nome,
      cognome: this.formData.cognome,
      email: this.formData.email,
      codiceFiscale: this.formData.codiceFiscale,
      comuneResidenza: this.formData.comuneResidenza,
      cap: this.formData.cap,
      sesso: this.formData.sesso,
      password: this.formData.password
    };

    this.formService.saveFormData(dataToSend).subscribe({
      next: (response: ApiResponse<any>) => {
        const serverId = response?.id || response?.data?.id || response?.insertId || Date.now();

        const nuovaRegistrazione: RegistrationData = {
          id: serverId,
          nome: this.formData.nome,
          cognome: this.formData.cognome,
          email: this.formData.email,
          codiceFiscale: this.formData.codiceFiscale,
          comuneResidenza: this.formData.comuneResidenza,
          cap: this.formData.cap,
          sesso: this.formData.sesso
        };

        this.sharedDataService.notificaNuovaRegistrazione(nuovaRegistrazione);
        this.resetForm();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Save error:', error);
        this.loading = false;
      }
    });
  }

  private resetForm(): void {
    this.formData = {
      nome: '',
      cognome: '',
      email: '',
      codiceFiscale: '',
      comuneResidenza: null,
      cap: '',
      sesso: '',
      password: '',
      passwordConfirm: ''
    };

    this.capList = [];
    
    if (this.capCustomStore) {
      this.capCustomStore.clearRawDataCache();
    }

    if (this.formReg?.instance) {
      this.formReg.instance.resetValues();
      setTimeout(() => {
        this.formReg?.instance?.resetValues();
      }, 100);
    }
  }

  private validateForm(): boolean {
    if (!this.formReg?.instance) {
      return false;
    }

    const validationResult = this.formReg.instance.validate();
    
    if (!validationResult.isValid) {
      return false;
    }
    
    if (!this.formData.comuneResidenza) {
      console.error('Comune required');
      return false;
    }
    
    if (!this.formData.cap || this.formData.cap.trim() === '') {
      console.error('CAP required');
      return false;
    }

    if (!validatePasswordMatch(this.formData.password, this.formData.passwordConfirm)) {
      console.error('Passwords mismatch');
      return false;
    }

    return true;
  }
}