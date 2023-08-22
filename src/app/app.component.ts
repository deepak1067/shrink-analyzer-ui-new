import {Component, OnInit} from '@angular/core';
import {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {environment} from 'src/environments/environment';
import {TranslateService} from "@ngx-translate/core";
import {Title} from "@angular/platform-browser";
import {LanguageTranslationService} from "./shared/services/language-translation.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;
  googleMapKey = environment.googleMapKey;
  language!: string;


  constructor(
    private router: Router,
    private translateService: TranslateService,
    private titleService: Title,
    private languageService: LanguageTranslationService) {
    this.router.events.subscribe((e: Event) => {
      this.navigationInterceptor(e);
    });
  }

  ngOnInit(): void {
    this.setTranslatedTitle();
    this.language = this.languageService.initializeLanguage();
    this.loadGoogleMap();
  }

  setTranslatedTitle(): void {
    this.translateService.get('appTitle').subscribe((translatedTitle: string) => {
      this.titleService.setTitle(translatedTitle);
    });
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: Event): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      this.loading = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
    }
  }

  clearGoogleMap() {
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.remove();
    }
  }

  loadGoogleMap() {
    this.clearGoogleMap();

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapKey}&language=${this.language}&callback=Function.prototype`;
    document.head.append(script);
  }
}
