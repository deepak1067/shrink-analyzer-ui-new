import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FilterComponent} from './filter.component';
import {MaterialModule} from 'src/app/shared/module/material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SiteApiResponseService} from "../../../core/services/site-api-response.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CookieModule} from "ngx-cookie";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import { Site } from '../../dashboard.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let siteApiResponseService: SiteApiResponseService;

    const site1: Site = {
        code: "SiteCode1",
        name: "Site Name 1",
        timezone: "Asia/Jakarta",
        "geo-location": {
            hierarchy: "Asia/Jakarta/Sapat",
            coordinates: {
                latitude: -0.3372032,
                longitude: 103.3702811,
            },
        },
        labels: ["Label 1", "Label 2", "Label 3", "Label 4"],
        "exit-doors": [
            {id: 1, name: "Exit Door 1"},
            {id: 2, name: "Exit Door 2"},
            {id: 3, name: "Exit Door 3"},
        ],
    };

    const site2: Site = {
        code: "SiteCode2",
        name: "Site Name 2",
        timezone: "Asia/Yekaterinburg",
        "geo-location": {
            hierarchy: "Asia/Yekaterinburg/Pokrovskoye",
            coordinates: {
                latitude: 57.3579277,
                longitude: 61.6905815,
            },
        },
        labels: ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5", "Label 6", "Label 7"],
        "exit-doors": [
            {id: 1, name: "Exit Door 1"},
        ],
    };

    const site3: Site = {
        code: "SiteCode3",
        name: "Site Name 3",
        timezone: "Asia/Chongqing",
        "geo-location": {
            hierarchy: "Asia/Chongqing/Bayan",
            coordinates: {
                latitude: 46.085536,
                longitude: 127.403337,
            },
        },
        labels: ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5", "Label 6", "Label 7"],
        "exit-doors": [
            {id: 1, name: "Exit Door 1"},
            {id: 2, name: "Exit Door 2"},
            {id: 3, name: "Exit Door 3"},
            {id: 4, name: "Exit Door 4"},
            {id: 5, name: "Exit Door 5"},
        ],
    };

    const siteApiResponseServiceStub: Partial<SiteApiResponseService> = {

        labelMap: new Map<string, Site[]>([
            ['SiteCode1', [site1]],
            ['SiteCode2', [site2]],
            ['SiteCode3', [site3]],
        ]),
        hierarchyMap: new Map<string, Site>([
            ['Asia/Jakarta/Sapat', site1],
            ['Asia/Yekaterinburg/Pokrovskoye', site2],
            ['Asia/Chongqing/Bayan', site3],
        ]),
        nameMap: new Map<string, Site>([
            ['Site Name 1', site1],
            ['Site Name 2', site2],
            ['Site Name 3', site3],
        ]),
        siteCodeMap: new Map<string, Site>([
            ['SiteCode1', site1],
            ['SiteCode2', site2],
            ['SiteCode3', site3],
        ]),
    };

    const data = {
        title: 'title',
        message: 'message',
        summary: 'my summary'
    };


    beforeEach(async () => {
        const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['onNoClick', 'closeDialog']);
        await TestBed.configureTestingModule({
            declarations: [FilterComponent],
            imports: [MaterialModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule,
                BrowserAnimationsModule, CookieModule.forRoot(), MatDialogModule, TranslateModule.forRoot()],
            providers: [DatePipe,
                { provide: SiteApiResponseService, useValue: siteApiResponseServiceStub },
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: data }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FilterComponent);
        component = fixture.componentInstance;
        siteApiResponseService = TestBed.inject(SiteApiResponseService);
        fixture.detectChanges();
    });

    afterEach(async () => {
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the filter applied to true', () => {
        component.onFormSubmit(true);
        expect(component.filterApplied).toBe(true);
    });

    it('should clear the form on clicking the clearFilter button', () => {
        component.clearFilter();
        expect(component.isChecked).toBe(false);
        expect(component.filterForm.value).toEqual({
            startDate: null, endDate: null, startTime: null, endTime: 24, hierarchy: null,
            siteCode: null, siteName: null, siteLabel: null, itemLabel: null, excludeInCatalog: null
        });
    });

    it('should update excludeInCatalog control in filterForm correctly', () => {
        component.filterForm.controls['excludeInCatalog'].setValue(false);
        const event = {checked: true};
        component.onChange(event);
        expect(component.filterForm.controls['excludeInCatalog'].value).toBe(true);
        component.filterForm.controls['excludeInCatalog'].setValue(true);
    });

});