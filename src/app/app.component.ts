import {Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
// tslint:disable-next-line:ban-types
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private router: Router, private translate: TranslateService) {
    translate.addLangs(['fr', 'en']);
    translate.setDefaultLang('fr');

    // https://christianlydemann.com/dynamic-translations-in-angular/
    const browserLang = translate.getBrowserLang();
    // /fr|xx/
    translate.use(browserLang.match(/fr/) ? browserLang : 'en');

    this.router.events.subscribe(event => {
      // if (event instanceof NavigationEnd) {
      //   gtag('config', 'UA-151882787-1', { page_path: event.urlAfterRedirects });
      // }
    });
  }
}
