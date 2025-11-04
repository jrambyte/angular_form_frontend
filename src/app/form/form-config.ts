export const SESSO_ITEMS = ['Uomo', 'Donna', 'Preferisco non specificare'];

export const EDITOR_OPTIONS_COMUNE: any = {
  dataSource: [],
  displayExpr: 'text',
  valueExpr: 'id',
  placeholder: 'Digita per cercare comuni...',
  searchEnabled: true,
  searchMode: 'contains',
  searchExpr: ['text'],
  searchTimeout: 500,
  minSearchLength: 2
};

export const EDITOR_OPTIONS_CAP: any = {
  dataSource: [],
  displayExpr: 'cap',
  valueExpr: 'id',
  placeholder: 'Seleziona CAP...',
  searchEnabled: false,
  searchMode: 'contains',
  searchExpr: ['cap'],
  searchTimeout: 500,
  minSearchLength: 1
};

export const PASSWORD_CONFIG = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialCharacter: true
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_ERROR_MESSAGE = 
  'La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale (@$!%*?&)';

export const CODICE_FISCALE_PATTERN = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
export const CODICE_FISCALE_ERROR_MESSAGE = 'Codice fiscale non valido. Formato: XXXXXX##X##X###X';

export function validatePasswordStrength(password: string): boolean {
  if (!password || password.length < PASSWORD_CONFIG.minLength) {
    return false;
  }
  
  if (PASSWORD_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }
  
  if (PASSWORD_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }
  
  if (PASSWORD_CONFIG.requireDigit && !/\d/.test(password)) {
    return false;
  }
  
  if (PASSWORD_CONFIG.requireSpecialCharacter && !/[@$!%*?&]/.test(password)) {
    return false;
  }
  
  return true;
}

export function validatePasswordMatch(password1: string, password2: string): boolean {
  return password1 === password2 && password1.length > 0;
}

export function validateCodiceFiscale(codiceFiscale: string): boolean {
  if (!codiceFiscale) {
    return false;
  }
  return CODICE_FISCALE_PATTERN.test(codiceFiscale);
}