import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class LanguageTranslationService {

  constructor(private translateService: TranslateService) { }

  AG_GRID_LOCALE_EN = {
    blanks: '(Blanks)',
    equals: 'Equals',
    notEqual: 'Not equal',
    blank: 'Blank',
    notBlank: 'Not blank',
    empty: 'Choose One',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    lessThanOrEqual: 'Less than or equal',
    greaterThanOrEqual: 'Greater than or equal',
    inRange: 'In range',
    inRangeStart: 'from',
    inRangeEnd: 'to',
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    andCondition: 'AND',
    orCondition: 'OR',
    Page : 'page'
  }

  AG_GRID_LOCALE_ES = {
    blanks: '(En blanco)',
    filterOoo: 'Filtrar...',
    equals: 'Igual',
    notEqual: 'No igual',
    blank: 'En blanco',
    notBlank: 'No en blanco',
    empty: 'Elegir uno',
    lessThan: 'Menor que',
    greaterThan: 'Mayor que',
    lessThanOrEqual: 'Menor o igual que',
    greaterThanOrEqual: 'Mayor o igual que',
    inRange: 'En rango',
    inRangeStart: 'desde',
    inRangeEnd: 'hasta',
    contains: 'Contiene',
    notContains: 'No contiene',
    startsWith: 'Empieza con',
    endsWith: 'Termina con',
    andCondition: 'Y',
    orCondition: 'O',
    sum: 'Suma',
    first: 'Primero',
    last: 'Último',
    min: 'Mínimo',
    max: 'Máximo',
    none: 'Ninguno',
    count: 'Recuento',
    avg: 'Promedio',
    to: 'a',
    of: 'de',
    page: 'Página',
    pageLastRowUnknown: '?',
    nextPage: 'Página Siguiente',
    lastPage: 'Última Página',
    firstPage: 'Primera Página',
    previousPage: 'Página Anterior',
  };

  AG_GRID_LOCALE_ZH = {
    "blanks": "(空白)",
    "filterOoo": "筛选...",
    "equals": "等于",
    "notEqual": "不等于",
    "blank": "空白",
    "notBlank": "非空白",
    "empty": "选择一个",
    "lessThan": "小于",
    "greaterThan": "大于",
    "lessThanOrEqual": "小于等于",
    "greaterThanOrEqual": "大于等于",
    "inRange": "在范围内",
    "inRangeStart": "从",
    "inRangeEnd": "到",
    "contains": "包含",
    "notContains": "不包含",
    "startsWith": "以...开始",
    "endsWith": "以...结束",
    "andCondition": "与",
    "orCondition": "或",
    "sum": "求和",
    "first": "第一个",
    "last": "最后一个",
    "min": "最小值",
    "max": "最大值",
    "none": "无",
    "count": "计数",
    "avg": "平均值",
    "to": "至",
    "of": "的",
    "page": "页面",
    "pageLastRowUnknown": "?",
    "nextPage": "下一页",
    "lastPage": "最后一页",
    "firstPage": "第一页",
    "previousPage": "上一页"
  };

  AG_GRID_LOCALE_PT = {
    "blanks": "(Em branco)",
    "filterOoo": "Filtrar...",
    "equals": "Igual",
    "notEqual": "Não igual",
    "blank": "Em branco",
    "notBlank": "Não em branco",
    "empty": "Escolher um",
    "lessThan": "Menor que",
    "greaterThan": "Maior que",
    "lessThanOrEqual": "Menor ou igual que",
    "greaterThanOrEqual": "Maior ou igual que",
    "inRange": "Em faixa",
    "inRangeStart": "de",
    "inRangeEnd": "até",
    "contains": "Contém",
    "notContains": "Não contém",
    "startsWith": "Começa com",
    "endsWith": "Termina com",
    "andCondition": "E",
    "orCondition": "Ou",
    "sum": "Soma",
    "first": "Primeiro",
    "last": "Último",
    "min": "Mínimo",
    "max": "Máximo",
    "none": "Nenhum",
    "count": "Contagem",
    "avg": "Média",
    "to": "a",
    "of": "de",
    "page": "Página",
    "pageLastRowUnknown": "?",
    "nextPage": "Próxima Página",
    "lastPage": "Última Página",
    "firstPage": "Primeira Página",
    "previousPage": "Página Anterior"
  };

  AG_GRID_LOCALE_FR = {
  "blanks": "(Vide)",
  "filterOoo": "Filtrer...",
  "equals": "Égale",
  "notEqual": "Pas égale",
  "blank": "Vide",
  "notBlank": "Pas vide",
  "empty": "Choisir",
  "lessThan": "Moins que",
  "greaterThan": "Plus que",
  "lessThanOrEqual": "Moins ou égal que",
  "greaterThanOrEqual": "Plus ou égal que",
  "inRange": "Dans la plage",
  "inRangeStart": "de",
  "inRangeEnd": "à",
  "contains": "Contient",
  "notContains": "Ne contient pas",
  "startsWith": "Commence par",
  "endsWith": "Finit par",
  "andCondition": "Et",
  "orCondition": "Ou",
  "sum": "Somme",
  "first": "Premier",
  "last": "Dernier",
  "min": "Minimum",
  "max": "Maximum",
  "none": "Aucun",
  "count": "Compte",
  "avg": "Moyenne",
  "to": "à",
  "of": "de",
  "page": "Page",
  "pageLastRowUnknown": "?",
  "nextPage": "Page Suivante",
  "lastPage": "Dernière Page",
  "firstPage": "Première Page",
  "previousPage": "Page Précédente"
  };

  initializeLanguage(): string {
    const defaultLanguage = 'en';
    const supportedLanguages = ['zh', 'en', 'fr', 'pt', 'es'];
    const browserLanguage = window.navigator.language.toLowerCase();

    let selectedLanguage = localStorage.getItem('selectedLanguage');

    if (!selectedLanguage || !supportedLanguages.includes(selectedLanguage)) {
      if (supportedLanguages.includes(browserLanguage)) {
        selectedLanguage = browserLanguage;
      } else {
        selectedLanguage = defaultLanguage;
      }
    }

    this.translateService.setDefaultLang(defaultLanguage);
    this.translateService.use(selectedLanguage);

    return selectedLanguage;
  }

  reloadPage(): void {
    window.location.reload();
  }
}
