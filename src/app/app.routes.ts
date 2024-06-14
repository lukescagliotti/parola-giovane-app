import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pagine/home/home.component';
import { ChiSiamoComponent } from './pagine/chi-siamo/chi-siamo.component';
import { ContattiComponent } from './pagine/contatti/contatti.component';
import { EventiComponent } from './pagine/eventi/eventi.component';
import { ProgettiComponent } from './pagine/progetti/progetti.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'chi-siamo', component: ChiSiamoComponent },
  { path: 'contatti', component: ContattiComponent },
  { path: 'eventi', component: EventiComponent },
  { path: 'progetti', component: ProgettiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
