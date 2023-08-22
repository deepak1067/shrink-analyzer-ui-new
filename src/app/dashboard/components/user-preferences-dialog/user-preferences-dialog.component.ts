import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {LanguageTranslationService} from "../../../shared/services/language-translation.service";

@Component({
  selector: 'app-user-preferences-dialog',
  templateUrl: './user-preferences-dialog.component.html',
  styleUrls: ['./user-preferences-dialog.component.scss']
})
export class UserPreferencesDialogComponent {

  supportedLanguages = [
    { value: 'zh', label: 'Chinese' },
    { value: 'en', label: 'English(US)' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' }
  ];
  displayName! : string;
  selectedLanguage! : string;

  constructor(public dialogRef : MatDialogRef<UserPreferencesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public translate : TranslateService,
              public languageTranslation: LanguageTranslationService) {
    this.displayName = data.displayName;
    this.selectedLanguage = localStorage.getItem('selectedLanguage') ?? this.translate.currentLang ?? this.supportedLanguages[0].value;
  }

  onApply(language: string) {
    this.selectedLanguage = language;
  }

  onSave() {
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
    this.languageTranslation.reloadPage()
    this.dialogRef.close()
  }
}
