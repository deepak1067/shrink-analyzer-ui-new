import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-auto-complete-field',
  templateUrl: './auto-complete-field.component.html',
  styleUrls: ['./auto-complete-field.component.scss']
})
export class AutoCompleteFieldComponent {
  toppings = new FormControl('');

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredValue!: Observable<string[]>;
  @Output() sendSelectedValues = new EventEmitter<{ label: string, value: string[] }>();
  @Input() fieldName: FormControl = new FormControl([]);
  @Input() selectedValues: string[] = []
  @Input() siteData: string[] = [];
  @Input() placeholder = ''
  @Input() label = ''

  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;
  @ViewChild('autocompleteTrigger') matACTrigger!: MatAutocompleteTrigger;


  ngOnInit() {
    this.filteredValue = this.fieldName.valueChanges.pipe(
      startWith(null),
      map((siteData: string | null) => (siteData ? this._filter(siteData) : this.siteData.slice())),
    );
  }

  addSiteData(event: string): void {
    const value = (event || '').trim();
    if (value) {
      this.selectedValues.push(value);
      this.sendSelectedValues.emit({ label: this.label, value: this.selectedValues })
    }
    this.fieldName.setValue(null);
  }

  removeSiteData(data: string): void {
    const index = this.selectedValues.indexOf(data);

    if (index >= 0) {
      this.selectedValues.splice(index, 1);
      this.sendSelectedValues.emit({ label: this.label, value: this.selectedValues })
    }
  }

  selectedSiteData(event: string): void {
    const newValue = event;
    if (this.selectedValues.includes(newValue)) {
      this.fieldName.setValue(null);
      this.removeSiteData(newValue);
      return;
    } else {
      this.selectedValues.push(event);
      this.sendSelectedValues.emit({ label: this.label, value: this.selectedValues })
    }

    this.filterInput.nativeElement.value = '';
    this.fieldName.setValue(null);
    requestAnimationFrame(() => {
      this.openAuto(this.matACTrigger);
    })
  }

  openAuto(trigger: MatAutocompleteTrigger) {
    trigger.openPanel();
    this.filterInput.nativeElement.focus();
  }

  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.siteData.filter((data: string) => data.toLowerCase().includes(filterValue));
  }
}