import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SiteApiResponseService } from "../../../core/services/site-api-response.service";
import { FilterChange, FilterFields } from "../../../modules/shrink-visibility/shrink-visibility.model";
import { DatePipe } from "@angular/common";
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from '../../../shared/services/common.service';
import { LocationNode, LocationFlatNode, Site } from '../../dashboard.model';
import {DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import {LanguageTranslationService} from "../../../shared/services/language-translation.service";

@Component({
    selector: 'app-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss'],
    providers: [DatePipe,
        { provide: MAT_DATE_LOCALE, useValue: localStorage.getItem('selectedLanguage') }]
})
export class FilterComponent implements OnInit {
    transformedSiteHierarchy: LocationNode[] = [];
    transSiteHierarchySelected: LocationFlatNode[] = [];
    siteLabels: string[] = [];
    siteNames: string[] = [];
    siteHierarchy: string[] = [];
    siteCodes: string[] = [];
    language!: string;
    eventLabels: string[] = ['Organized Crime', 'External Theft', 'Employee', 'Omni Sale', 'Transfer', 'Others', 'Not a Loss Event', 'Mixed'];

    siteHierarchySelected: string[] = [];
    siteCodesSelected: string[] = [];
    siteNamesSelected: string[] = [];
    siteLabelsSelected: string[] = [];


    filterForm: FormGroup = new FormGroup({
        startDate: new FormControl(null, Validators.required),
        endDate: new FormControl(null, Validators.required),
        startTime: new FormControl(0),
        endTime: new FormControl(24, Validators.min(1)),
        hierarchy: new FormControl([]),
        siteCode: new FormControl([]),
        siteName: new FormControl([]),
        siteLabel: new FormControl([]),
        itemLabel: new FormControl([]),
        excludeInCatalog: new FormControl(false)
    });
    isChecked: boolean = false;
    filterApplied: boolean = true;
    filterAppliedValues: any;


    constructor(private siteApiResponseService: SiteApiResponseService,
        private commonService: CommonService,
        public datePipe: DatePipe,
        private dialogRef: MatDialogRef<any>,
        private dateAdapter : DateAdapter<any>,
        private languageService: LanguageTranslationService,
        private router: Router,) { }

    ngOnInit(): void {
        this.language = this.languageService.initializeLanguage();
        this.dateAdapter.setLocale(this.language);
        this.setAllData();
        this.setFilterForm()
    }
    setFilterForm() {
        if (localStorage.getItem('isFilterApplied') === 'true') {
            let appliedValues = localStorage.getItem('filterValues');
            this.filterAppliedValues = JSON.parse(appliedValues ?? '');
            this.siteCodesSelected = this.filterAppliedValues['site-code-for-filter'] || [];
            this.siteNamesSelected = this.filterAppliedValues['site-name'] || [];
            this.siteLabelsSelected = this.filterAppliedValues['site-label'] || [];
            this.siteHierarchySelected = this.filterAppliedValues['site-directory'] || [];
            this.filterForm.controls['startDate'].setValue(this.filterAppliedValues['start-date']);
            this.filterForm.controls['endDate'].setValue(this.filterAppliedValues['end-date']);
            this.filterForm.controls['startTime'].setValue(this.filterAppliedValues['start-time-for-filter']);
            this.filterForm.controls['endTime'].setValue(this.filterAppliedValues['end-time-for-filter']);
            if (this.filterAppliedValues['include-not-in-catalog'] === true) {
                this.isChecked = true;
                this.filterForm.controls['excludeInCatalog'].setValue(true);
            }
            let itemLabel = localStorage.getItem('itemLabel');
            let selectedItemLabel = JSON.parse(itemLabel ?? '');
            this.filterForm.controls['itemLabel'].setValue(selectedItemLabel);

            const nestedData = this.transformSiteHierarchyData(this.siteHierarchySelected);
            this.transSiteHierarchySelected = this.convertToFlatNodes(nestedData);
        }

    }
    setAllData(resetLabels: boolean = true) {
        const labelMapString = localStorage.getItem("labelMap");
        if (labelMapString && resetLabels) {
            this.siteApiResponseService.labelMap = new Map<string, Site[]>(JSON.parse(labelMapString));
            this.siteLabels = Array.from(this.siteApiResponseService.labelMap.keys());
        }
        const nameMapString = localStorage.getItem("nameMap");
        if (nameMapString) {
            this.siteApiResponseService.nameMap = new Map<string, Site>(JSON.parse(nameMapString));
            this.siteNames = Array.from(this.siteApiResponseService.nameMap.keys());
        }
        const siteCodeMapString = localStorage.getItem("siteCodeMap");
        if (siteCodeMapString) {
            this.siteApiResponseService.siteCodeMap = new Map<string, Site>(JSON.parse(siteCodeMapString));
            this.siteCodes = Array.from(this.siteApiResponseService.siteCodeMap.keys());
        }
        const hierarchyMapString = localStorage.getItem("hierarchyMap");
        if (hierarchyMapString) {
            this.siteApiResponseService.hierarchyMap = new Map<string, Site>(JSON.parse(hierarchyMapString));
            this.siteHierarchy = Array.from(this.siteApiResponseService.hierarchyMap.keys());
        }
        this.transformedSiteHierarchy = this.transformSiteHierarchyData(this.siteHierarchy)
    }

    clearFilter() {
        this.isChecked = false;
        this.siteCodesSelected = [];
        this.siteNamesSelected = [];
        this.siteHierarchySelected = [];
        this.transSiteHierarchySelected = []
        this.siteLabelsSelected = [];
        this.filterForm.reset();
        this.filterForm.controls['endTime'].setValue(24)
        localStorage.setItem('isFilterApplied', 'false');
        this.sendFilterAction(false, true);
        this.setAllData();
    }

    transformSiteHierarchyData(data: any) {
        const locationsMap: Map<string, LocationNode> = new Map();
        for (const locationString of data) {
            const [continent, city, district] = locationString.split('/');
            if (!locationsMap.has(continent)) {
                locationsMap.set(continent, { item: continent, children: [], hierarchy: continent });
            }
            const continentLocation = locationsMap.get(continent);
            if (continentLocation) {
                if (!continentLocation.children) {
                    continentLocation.children = [];
                }
                if (!continentLocation.children.some(child => child.item === city)) {
                    continentLocation.children.push({ item: city, children: [], hierarchy: continent + '/' + city });
                }
                const cityLocation = continentLocation.children.find(child => child.item === city);
                cityLocation?.children?.push({ item: district, hierarchy: locationString });
            }
        }
        let transformedSiteHierarchy = Array.from(locationsMap.values());
        return transformedSiteHierarchy


    }

    convertToFlatNodes(data: any, level = 0) {
        const flatNodes: any[] = [];
        data.forEach((item: any) => {
            flatNodes.push(new LocationFlatNode(item.item, level, item.hierarchy, !!item.children));
            if (item.children) {
                flatNodes.push(...this.convertToFlatNodes(item.children, level + 1));
            }
        });
        return flatNodes;
    }

    onChange(event: any) {
        let checked = event.checked;
        this.filterForm.controls['excludeInCatalog'].setValue(checked);
    }

    onFormSubmit(testCase: boolean = false) {
        this.filterApplied = true;
        const startDateValue = this.filterForm.get('startDate')?.value;
        const endDateValue = this.filterForm.get('endDate')?.value;
        const startTime = this.filterForm.get('startTime')?.value;
        const endTime = this.filterForm.get('endTime')?.value;
        const endTimeCalculation = endTime === 24 ? 0 : endTime;

        console.log(this.filterForm.get('startTime')?.value)
        const filterFields: FilterFields = {
            "start-date": startDateValue ? this.datePipe.transform(new Date(startDateValue), 'yyyy-MM-dd') : null,
            "end-date": endDateValue ? this.datePipe.transform(new Date(endDateValue), 'yyyy-MM-dd') : null,
            "start-time": startTime === 24 || 0 ? 0 : startTime,
            "end-time": startTime === null ? null : endTimeCalculation,
            "start-time-for-filter": this.filterForm.get('startTime')?.value || 0,
            "end-time-for-filter": this.filterForm.get('endTime')?.value || 24,
            "site-code": this.getSiteCodeForAll(),
            "site-code-for-filter": this.siteCodesSelected,
            "site-name": this.siteNamesSelected,
            "site-label": this.siteLabelsSelected,
            "itemLabel": this.filterForm.get('itemLabel')?.value,
            "include-not-in-catalog": this.filterForm.get('excludeInCatalog')?.value,
            "site-directory": this.siteHierarchySelected
        };
        localStorage.setItem('itemLabel', JSON.stringify(this.filterForm.controls['itemLabel'].value));
        localStorage.setItem('filterValues', JSON.stringify(filterFields));
        localStorage.setItem("isFilterApplied", String(this.filterApplied));
        this.sendFilterAction(true, false);
        if (!testCase) {
            this.dialogRef.close('save');
        }
    }

    closeDialog(){
        this.dialogRef.close('close');
    }

    getSiteCodeForAll() {
        let finalSiteCode: string[] = [...this.siteCodesSelected];
        if (this.siteNamesSelected.length) {
            this.siteNamesSelected.forEach(item => {
                let code = this.siteApiResponseService.getSiteCodeBySiteName(item) ?? ''
                if (!finalSiteCode.includes(code) && code !== '') {
                    finalSiteCode.push(code)
                }
            });
        }
        if (this.siteHierarchySelected.length) {
            this.siteHierarchySelected.forEach(item => {
                let code: string = this.siteApiResponseService.getSiteCodeByHierarchy(item) ?? ''
                if (!finalSiteCode.includes(code) && code !== '') {
                    finalSiteCode.push(code)
                }
            });
        }
        if (this.siteLabelsSelected.length) {
            this.siteLabelsSelected.forEach(item => {
                let data: string[] = this.siteApiResponseService.getSiteCodeByLabel(item) ?? []
                data?.forEach(code => {
                    if (!finalSiteCode.includes(code)) {
                        finalSiteCode.push(code)
                    }
                })
            });
        }
        return finalSiteCode;
    }

    sendFilterAction(applied: boolean, clearAction: boolean) {
        const updateFilter: FilterChange = {
            applied: applied,
            clearAction: clearAction,
            pageUrl: this.router.url
        };
        this.commonService.sendFilterAppliedValue(updateFilter);
    }

    sendSelectedValues(event: any) {
        if (event.label == 'Site ID') {
            this.siteCodesSelected = event.value
        }
        else if (event.label == 'Site Label') {
            this.siteLabelsSelected = event.value
        }
        else if (event.label == 'Site Name') {
            this.siteNamesSelected = event.value
        }
    }

    sendSelectedHierarchy(event: any) {
        if (event) {
            const result: string[] = [];
            for (const s of event) {
                const parts = s.split('/');
                if (parts.length > 2) {
                    result.push(s);
                }
            }
            this.siteHierarchySelected = result
        }
    }

}
