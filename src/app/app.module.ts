import {BrowserModule} from '@angular/platform-browser';
import {registerLocaleData} from '@angular/common';
import {LOCALE_ID, NgModule} from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import {AppComponent} from './app.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {ChartsModule} from 'ng2-charts';
import {HeadComponent} from './sections/head/head.component';
import {AppRoutingModule} from './app-routing.module';
import {AboutComponent} from './about/about.component';
import {FooterComponent} from './sections/footer/footer.component';
import {AttestationComponent} from './confinement/attestation/attestation.component';
import {PdfJsViewerModule} from 'ng2-pdfjs-viewer';
import { FormPersoComponent } from './confinement/attestation/form-perso/form-perso.component';
import { FormProComponent } from './confinement/attestation/form-pro/form-pro.component';
import {PdfService} from '../services/pdf.service';
import {ReactiveFormsModule} from '@angular/forms';
import {PdfDataModel} from '../models/attestation/pdfData.model';
import {OWL_DATE_TIME_LOCALE, OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import {NowService} from '../services/now.service';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";

registerLocaleData(localeFr);

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HeadComponent,
    AboutComponent,
    FooterComponent,
    AttestationComponent,
    FormPersoComponent,
    FormProComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ChartsModule,
    AppRoutingModule,
    PdfJsViewerModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }
    )
  ],
  providers: [
    PdfService,
    PdfDataModel,
    NowService,
    {provide: LOCALE_ID, useValue: 'fr-FR' },
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'fr'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
