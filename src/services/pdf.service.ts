import {Subject, Subscription} from 'rxjs';
import {PDFDocument, PDFPage} from 'pdf-lib';
import {PdfModel} from '../models/attestation/pdf.model';
import {formatDate} from '@angular/common';
import {PdfDataModel} from '../models/attestation/pdfData.model';
import {AttestationType} from '../models/attestation/attestationType.enum';
import {PdfDataService} from './pdf-data.service';
import {Injectable} from '@angular/core';
import * as Qrious from 'qrious';
import {NowService} from './now.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private pdf: PdfModel;
  private nowSubscription: Subscription;
  private now: Date;

  pdfSubject = new Subject<PdfModel>();

  constructor(private pdfDataService: PdfDataService, private nowService: NowService) {
    this.nowSubscription = nowService.nowSubject.subscribe((now: Date) => {
      this.now = now;
    });
  }

  draw() {
    const proMarch2020 = 'justificatif-deplacement-professionnel-fr_20200330.pdf';
    const persoMarch2020 = 'attestation-deplacement-fr-20200324.pdf';
    const persoOct2020 = 'attestation-fr-2020-10.pdf';

    const data = this.pdfDataService.data;
    const pdfName = data.type === AttestationType.Pro ? proMarch2020 : persoOct2020;

    fetch('assets/files/' + pdfName).then(res => {
      res.arrayBuffer().then(buffer => {
        PDFDocument.load(buffer).then((pdf: PDFDocument) => {
          this.nowService.fetch().then(() => {
            data.type === AttestationType.Pro ? this.drawPro(pdf, data) : this.drawPerso0ct2020(pdf, data);

            pdf.saveAsBase64({dataUri: true}).then(dataUri => {
              this.PDF = new PdfModel(this.base64ToArrayBuffer(dataUri.split(';').slice(-1)[0]
                  .split(',').slice(-1)[0]),
                pdfName);
            });
          });
        });
      });
    });
  }

  emitSubject() {
    this.pdfSubject.next(this.pdf);
  }

  set PDF(pdf: PdfModel) {
    this.pdf = pdf;
    this.emitSubject();
  }

  get PDF(): PdfModel {
    return this.pdf;
  }

  private drawPro = (pdf: PDFDocument, data: PdfDataModel) => {
    const page: PDFPage = pdf.getPages()[0];

    page.drawText(data.pro.employerName, {x: 230, y: 660, size: 15}); // Employer full name
    page.drawText(data.pro.employerPosition, {x: 135, y: 635, size: 15});    // Employer position (function)
    page.drawText(data.pro.lastname, {x: 110, y: 540, size: 15}); // Last name
    page.drawText(data.pro.firstname, {x: 120, y: 515, size: 15}); // First name
    if (data.pro.birthday instanceof Date && data.pro.birthday.getFullYear() < new Date().getFullYear()) {
      page.drawText(formatDate(data.pro.birthday, 'dd/MM/yyyy', 'fr_FR'), {x: 170, y: 490, size: 15}); // Birthday
    }
    page.drawText(data.pro.pob, {x: 170, y: 467, size: 15}); // Place of Birth
    page.drawText(data.pro.address, {x: 180, y: 442, size: 15}); // Address
    page.drawText(data.pro.activity, {x: 250, y: 418, size: 13});
    page.drawText(data.pro.workplace, {x: 290, y: 388, size: 15});
    page.drawText(data.pro.validity, {x: 170, y: 345, size: 15});
    page.drawText(data.pro.mean, {x: 195, y: 368, size: 15});

    page.drawText(data.pro.city, {x: 110, y: 260, size: 15});
    page.drawText(formatDate(data.pro.today, 'dd/MM/yyyy', 'fr_FR'), {x: 100, y: 235, size: 15});
    // page.drawText(formatDate(data.pro.today, 'MM', 'fr_FR'), {x: 502, y: 188, size: 15});
  }

  private drawPerso0ct2020 = (pdf: PDFDocument, data: PdfDataModel) => {
    const page: PDFPage = pdf.getPages()[0];
    const reasonPoints = [0, 50, 98, 154, 190, 227, 275, 312];

    page.drawText(data.perso.name, {x: 120, y: 670, size: 14});
    if (data.perso.birthday instanceof Date && data.perso.birthday.getFullYear() < new Date().getFullYear()) {
      page.drawText(formatDate(data.perso.birthday, 'dd/MM/yyyy', 'fr_FR'), {x: 120, y: 644, size: 14});
    }
    page.drawText(data.perso.birthplace, {x: 325, y: 644, size: 14});
    page.drawText(data.perso.address, {x: 130, y: 620, size: 14});

    if (data.perso.reason > -1) {
      const mv = reasonPoints[data.perso.reason];
      // page.drawLine({start: {x: 73.5, y: 540 - mv}, end: {x: 90, y: 522 - mv}});
      // page.drawLine({start: {x: 73.5, y: 522 - mv}, end: {x: 90, y: 540 - mv}});
      page.drawText("X", {x: 74, y: 539 - mv, size: 14});
    }

    page.drawText(data.perso.city, {x: 112, y: 167, size: 15});
    page.drawText(formatDate(data.perso.today, 'dd/MM/yyyy', 'fr_FR'), {x: 96, y: 146, size: 15});
    page.drawText(formatDate(data.perso.today, 'HH:mm', 'fr_FR'), {x: 307, y: 146, size: 15});

    const qr = new Qrious({
      value: data.perso.toString(this.nowService.format(this.now, 'datetime')),
      backgroundAlpha: 0,
      size: 120
    });
    const pngImageBytes = this.base64ToArrayBuffer(qr.toDataURL()
      .split(';').slice(-1)[0]
      .split(',').slice(-1)[0]);
    pdf.embedPng(pngImageBytes).then(image => {
      page.drawImage(image, {x: 410, y: 110});
      // page.drawText('Date de création:', {x: 465, y: 141, size: 8});
      page.drawText(this.nowService.format(this.now, 'datetimeHat'), {x: 453, y: 133, size: 8});

      const qrPage: PDFPage = pdf.addPage([page.getWidth(), page.getHeight()]);
      const fact = 3;
      qrPage.drawImage(image, {x: 30, y: 450, width: image.width * fact, height: image.height * fact});
    });
  }

  private drawPerso = (pdf: PDFDocument, data: PdfDataModel) => {
    const page: PDFPage = pdf.getPages()[0];
    const reasonPoints = [0, 49, 90.5, 126, 182, 229, 265];

    page.drawText(data.perso.name, {x: 134, y: 686, size: 14});
    if (data.perso.birthday instanceof Date && data.perso.birthday.getFullYear() < new Date().getFullYear()) {
      page.drawText(formatDate(data.perso.birthday, 'dd/MM/yyyy', 'fr_FR'), {x: 134, y: 661, size: 14});
    }
    page.drawText(data.perso.birthplace, {x: 134, y: 637, size: 14});
    page.drawText(data.perso.address, {x: 134, y: 613, size: 14});

    if (data.perso.reason > -1) {
      const mv = reasonPoints[data.perso.reason];
      page.drawLine({start: {x: 73.5, y: 540 - mv}, end: {x: 90, y: 522 - mv}});
      page.drawLine({start: {x: 73.5, y: 522 - mv}, end: {x: 90, y: 540 - mv}});
    }

    page.drawText(data.perso.city, {x: 112, y: 225.5, size: 15});
    page.drawText(formatDate(data.perso.today, 'dd/MM/yyyy', 'fr_FR'), {x: 96, y: 201, size: 15});
    page.drawText(formatDate(data.perso.today, 'HH', 'fr_FR'), {x: 195, y: 201, size: 15});
    page.drawText(formatDate(data.perso.today, 'mm', 'fr_FR'), {x: 222, y: 201, size: 15});

    const qr = new Qrious({
      value: data.perso.toString(this.nowService.format(this.now, 'datetime')),
      backgroundAlpha: 0,
      size: 120
    });
    const pngImageBytes = this.base64ToArrayBuffer(qr.toDataURL().split(';').slice(-1)[0]
      .split(',').slice(-1)[0]);
    pdf.embedPng(pngImageBytes).then(image => {
      page.drawImage(image, {x: 410, y: 144});
      page.drawText('Date de création:', {x: 465, y: 141, size: 8});
      page.drawText(this.nowService.format(this.now, 'datetimeHat'), {x: 453, y: 133, size: 8});

      const qrPage: PDFPage = pdf.addPage([page.getWidth(), page.getHeight()]);
      const fact = 3;
      qrPage.drawImage(image, {x: 30, y: 450, width: image.width * fact, height: image.height * fact});
    });

  }

  private base64ToArrayBuffer = (base64): Uint8Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
