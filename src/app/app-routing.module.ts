import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AttestationComponent} from './confinement/attestation/attestation.component';

const routes: Routes = [
  {path: '', component: AttestationComponent, pathMatch: 'full'},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
