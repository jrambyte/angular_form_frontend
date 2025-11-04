import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { FormComponent } from './form/form.component';
import { RegistrazioniComponent } from './registrazioni/registrazioni.component';

export const routes: Routes = [
  {path:'', redirectTo: 'home',  pathMatch: 'full'},
  {path: 'home', component: HomepageComponent},
  {path: 'form', component: FormComponent},
  {path: 'grid', component: RegistrazioniComponent}
];


