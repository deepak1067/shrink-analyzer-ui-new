import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-table-headers-dropdown',
  templateUrl: './table-headers-dropdown.component.html',
  styleUrls: ['./table-headers-dropdown.component.scss']
})
export class TableHeadersDropdownComponent {
  @Input() tableHeaders: ColDef[] = [];
  @Input() allTableHeaders!: ColDef[];
  @Output() updatedHeaders: EventEmitter<string[]> = new EventEmitter<string[]>();
  newSelectedTableHeaders!: any[];
  allNewTableHeaders!: any[];

  ngOnInit(){
    this.allNewTableHeaders = this.newSelectedTableHeaders;
  }


  ngOnChanges(){
    this.newSelectedTableHeaders = this.tableHeaders
    .filter((header) => header.colId !== undefined)
    .map((header) => header.colId as string);
  }

  onColumnSelectionChange(event: any){
    this.allNewTableHeaders = this.newSelectedTableHeaders;
    this.newSelectedTableHeaders = this.allNewTableHeaders.filter(item => event.value.includes(item));
    this.updatedHeaders.emit(this.newSelectedTableHeaders);
  }

}
