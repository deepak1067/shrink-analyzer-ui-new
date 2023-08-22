import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompleteFieldComponent } from './auto-complete-field.component';
import { MaterialModule } from 'src/app/shared/module/material.module';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AutoCompleteFieldComponent', () => {
  let component: AutoCompleteFieldComponent;
  let fixture: ComponentFixture<AutoCompleteFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AutoCompleteFieldComponent],
      imports:[MaterialModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: {destroyAfterEach: false}
    });
    fixture = TestBed.createComponent(AutoCompleteFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filteredValue correctly when valueChanges emits a value', () => {
    const mockSiteData = ['Option 1', 'Option 2', 'Option 3'];
    component.siteData = mockSiteData;
    component.fieldName = new FormControl('');
    const expectedFilteredValue = mockSiteData.slice();
    component.fieldName.setValue('Option');

    component.filteredValue.subscribe(res=>{
      expect(res).toEqual(expectedFilteredValue);
    })    
  });

  it('should initialize filteredValue correctly when valueChanges emits null', () => {
    const mockSiteData = ['Option 1', 'Option 2', 'Option 3'];
    component.siteData = mockSiteData;
    component.fieldName = new FormControl('');
    const expectedFilteredValue = mockSiteData.slice();
    component.fieldName.setValue(null);

    component.filteredValue.subscribe(res=>{
      expect(res).toEqual(expectedFilteredValue);
    })  
  });
  it('should initialize filteredValue correctly when siteData is empty', () => {
    const mockSiteData: string[] = [];
    component.siteData = mockSiteData;
    component.fieldName = new FormControl('');
    const expectedFilteredValue: string[] = [];
    component.fieldName.setValue('Option');

    component.filteredValue.subscribe(res=>{
      expect(res).toEqual(expectedFilteredValue);
    })  
  });

  it('should not add value if input is empty', () => {
    const mockValue = '';
    component.addSiteData(mockValue);
    expect(component.selectedValues).not.toContain(mockValue);
    expect(component.fieldName.value).toBeNull();
  })

  it('should  add value if input is not empty', () => {
    const mockValue = 'Site1';
    component.addSiteData(mockValue);
    
    expect(component.selectedValues).toContain(mockValue);
    expect(component.fieldName.value).toBeNull();
  })

  it('should remove value from selectedValues and emit event', () => {
    const mockValue = 'Site 1';
    component.selectedValues = ['Site 1','Site 2'];
    component.removeSiteData(mockValue);
    expect(component.selectedValues).not.toContain(mockValue);
    
  });

  it('should remove value if selected value already exists', () => {
    const mockValue = 'Test Value';
    spyOn(component,'removeSiteData')
    component.selectedValues = [mockValue];
    component.selectedSiteData(mockValue);

    expect(component.removeSiteData).toHaveBeenCalledWith(mockValue);
    expect(component.fieldName.value).toBeNull();
  });

  it('should add value if selected value does not exist', () => {
    const mockValue = 'Site2';
    component.selectedValues = ['Site5'];
    component.selectedSiteData(mockValue);

    expect(component.selectedValues).toContain(mockValue);
    expect(component.filterInput.nativeElement.value).toBe('');
    expect(component.fieldName.value).toBeNull();
  });

  it('should reset input and open autocomplete after selection', () => {
    const mockValue = 'Test Value';
    spyOn(window, 'requestAnimationFrame')
    spyOn(component, 'openAuto')
    component.selectedSiteData(mockValue);


    expect(component.filterInput.nativeElement.value).toBe('');
    expect(component.fieldName.value).toBeNull();
    requestAnimationFrame(() => {
      expect(component.openAuto).toHaveBeenCalledWith(component.matACTrigger);   
     })
    
  });

  it('should return filtered values based on input', () => {
    component.siteData = ['Site1', 'Site2', 'Site3', 'Site4'];
    const result1 = component._filter('S');
    const result2 = component._filter('5');

    expect(result1).toEqual(['Site1', 'Site2', 'Site3', 'Site4']);
    expect(result2).toEqual([]);
  });

});
