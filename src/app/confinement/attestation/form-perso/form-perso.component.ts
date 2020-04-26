import {Component, OnInit} from '@angular/core';
import reasonsFr from './reasons.fr.json';
import reasonsEn from './reasons.en.json';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PersoModel} from '../../../../models/attestation/perso.model';
import {PdfDataService} from '../../../../services/pdf-data.service';
import {PdfService} from '../../../../services/pdf.service';
import {PdfModel} from '../../../../models/attestation/pdf.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-form-perso',
  templateUrl: './form-perso.component.html',
  styleUrls: ['./form-perso.component.css']
})
export class FormPersoComponent implements OnInit {

  reasons: { id: number, title: string, description: string }[] = reasonsFr;
  reason = '';

  persoForm: FormGroup;
  downloadUrl: SafeUrl;
  downloadName: string;

  startAt = new Date('1984-01-01');
  today = new Date();

  constructor(private formBuilder: FormBuilder,
              private sanitizer: DomSanitizer,
              private pdfDataService: PdfDataService,
              private pdfService: PdfService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.reasons = this.translate.currentLang === 'fr' ? reasonsFr : reasonsEn;
    this.translate.onLangChange.subscribe(trans => {
      this.reasons = trans.lang === 'fr' ? reasonsFr : reasonsEn;
    });

    this.pdfService.pdfSubject.subscribe((pdf: PdfModel) => {
      this.downloadUrl = this.getSafeUrl(pdf);
      this.downloadName = pdf.name;
    });

    this.persoForm = this.formBuilder.group({
      firstname: this.pdfDataService.perso.firstname,
      lastname: this.pdfDataService.perso.lastname,
      birthday: this.pdfDataService.perso.birthday instanceof Date &&
      this.pdfDataService.perso.birthday.getFullYear() < this.today.getFullYear() ?
        this.pdfDataService.perso.birthday : '',
      birthplace: this.pdfDataService.perso.birthplace,
      address: this.pdfDataService.perso.address,
      reason: this.pdfDataService.perso.reason,
      city: this.pdfDataService.perso.city,
      today: this.pdfDataService.perso.today
      // new FormControl(this.today.toISOString().substring(0, 16))
    });

    this.onChanges();
  }

  changeReason($event: Event) {
    this.reason = this.reasons[($event.target as HTMLSelectElement).value].description;
  }

  private onChanges() {
    this.persoForm.valueChanges.subscribe(value => {
      this.pdfDataService.perso = new PersoModel(value.firstname, value.lastname, value.birthday, value.birthplace, value.address,
        value.reason, value.city, value.today);
    });
  }

  private getSafeUrl(pdf: PdfModel): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(new Blob([pdf.content], {type: 'application/pdf'}))
    );
  }
}
