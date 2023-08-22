import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {UserPreferencesDialogComponent} from './user-preferences-dialog.component';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {LanguageTranslationService} from "../../../shared/services/language-translation.service";

describe('UserPreferencesDialogComponent', () => {
    let component: UserPreferencesDialogComponent;
    let fixture: ComponentFixture<UserPreferencesDialogComponent>;

    const matDialogRefMock = {
        close: jasmine.createSpy('close')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserPreferencesDialogComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: matDialogRefMock
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        displayName: 'Test User'
                    }
                },
                {
                    provide: LanguageTranslationService,
                    useClass: MockReloadService
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserPreferencesDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default language', () => {
        expect(component.selectedLanguage).toBeDefined();
        expect(component.selectedLanguage).toEqual(component.supportedLanguages[0].value);
    });

    it('should close the dialog on save', () => {
        component.onSave();
        expect(matDialogRefMock.close).toHaveBeenCalled();
    });

    it('should apply selected language', () => {
        const newLanguage = 'es';
        component.onApply(newLanguage);
        component.translate.currentLang = newLanguage;
        expect(component.selectedLanguage).toEqual(newLanguage);
        expect(component.translate.currentLang).toEqual(newLanguage);
    });
});
class MockReloadService {reloadPage() {}}