export interface FormDataModel {
  nome: string;
  cognome: string;
  email: string;
  codiceFiscale: string;
  comuneResidenza: number | null;
  cap: string;
  sesso: string;
  password: string;
  passwordConfirm: string;
}

export interface RegistrationModel extends FormDataModel {
  id: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  id?: number;
  insertId?: number;
}