import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableHeadersDropdownComponent } from './table-headers-dropdown.component';
import { MaterialModule } from '../../module/material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TableHeadersDropdownComponent', () => {
  let component: TableHeadersDropdownComponent;
  let fixture: ComponentFixture<TableHeadersDropdownComponent>;

  const tableHeaders = [
    {
        field: "day-of-week",
        colId: "day",
        headerName: "Day of Week",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    },
    {
        field: "shrink-event-count",
        colId: "totalShrinkEvents",
        headerName: "Total Shrink Items",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    },
    {
        field: "bulk-event-count",
        colId: "bulkEventCount",
        headerName: "Bulk Events",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    },
    {
        field: "sweetheart-count",
        colId: "sweetheartCount",
        headerName: "Sweetheart",
        filter: "agTextColumnFilter",
        suppressMenu: true,
        unSortIcon: true,
        hide: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [TableHeadersDropdownComponent]
    });
    fixture = TestBed.createComponent(TableHeadersDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the fields of table headers', () => {
    component.tableHeaders = tableHeaders;
    const result = [ "day", "totalShrinkEvents", "bulkEventCount", "sweetheartCount" ];
    component.ngOnChanges();
    expect(component.newSelectedTableHeaders).toEqual(result);
  });

  it('should emit the selected headers field', () => {
    component.newSelectedTableHeaders = ['day', 'bulkEventCount', 'sweetheartCount'];
    spyOn(component.updatedHeaders,'emit');
    const event = {
      value: ["day", "bulkEventCount", "sweetheartCount"]
    }
    component.onColumnSelectionChange(event);
    expect(component.updatedHeaders.emit).toHaveBeenCalled();
  });
});
