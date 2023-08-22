import { TestBed, inject } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageTranslationService } from './language-translation.service';

describe('LanguageTranslationService', () => {
  let service: LanguageTranslationService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [LanguageTranslationService],
    });
    service = TestBed.inject(LanguageTranslationService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize language to default if no selectedLanguage', () => {
    // spyOn(window.navigator, 'language' as never).and.returnValue('de' as never); // Simulating German browser language
    spyOn(localStorage, 'getItem').and.returnValue(null);

    service.initializeLanguage();

    expect(translateService.defaultLang).toBe('en');
    expect(translateService.currentLang).toBe('en');
  });

  it('should initialize language to browser language if supported', () => {
    spyOn(window.navigator, 'language' as never).and.returnValue('en' as never);
    spyOn(localStorage, 'getItem').and.returnValue(null);

    service.initializeLanguage();

    expect(translateService.defaultLang).toBe('en');
    expect(translateService.currentLang).toBe('en');

  });

  it('should initialize language to default if browser language not supported', () => {
    spyOn(window.navigator, 'language' as never).and.returnValue('it' as never); // Simulating Italian browser language
    spyOn(localStorage, 'getItem').and.returnValue(null);

    service.initializeLanguage();

    expect(translateService.defaultLang).toBe('en');
    expect(translateService.currentLang).toBe('en');
  });

  it('should initialize language to selectedLanguage if supported', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fr');

    service.initializeLanguage();

    expect(translateService.defaultLang).toBe('en');
    expect(translateService.currentLang).toBe('fr');
  });
});
