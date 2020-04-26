import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {Router} from '@angular/router';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css']
})
export class HeadComponent implements OnInit {
  constructor(public router: Router, public translate: TranslateService) { }

  ngOnInit() {
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
}
