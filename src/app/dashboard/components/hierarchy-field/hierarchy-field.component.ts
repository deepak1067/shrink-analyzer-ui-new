import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { LocationNode, LocationFlatNode } from '../../dashboard.model';

@Component({
  selector: 'app-hierarchy-field',
  templateUrl: './hierarchy-field.component.html',
  styleUrls: ['./hierarchy-field.component.scss'],
})
export class HierarchyFieldComponent {
  @Input() treeData: LocationNode[] = []
  @Input() fieldName: FormControl = new FormControl([])
  @Input() transSiteHierarchySelected: LocationFlatNode[] = []
  @Output() sendTransSiteHierarchySelected = new EventEmitter<string[]>()

  @ViewChild("auto") autocomplete!: MatAutocomplete;
  @ViewChild("autoTreeInput") autoInput!: ElementRef;
  getLevel = (node: LocationFlatNode) => node.level;
  isExpandable = (node: LocationFlatNode) => node.expandable;
  getChildren = (node: LocationNode): LocationNode[] => node.children ?? [];
  hasChild = (_: number, _nodeData: LocationFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: LocationFlatNode) => _nodeData.item === "";
  expandAll = () => console.log("expandAll");
  initialTreeData:LocationNode[] = []
  checklistSelection = new SelectionModel<LocationFlatNode>(true);
  dataChange = new BehaviorSubject<LocationNode[]>([]);
  flatNodeMap = new Map<LocationFlatNode, LocationNode>();
  nestedNodeMap = new Map<LocationNode, LocationFlatNode>();
  treeControl!: FlatTreeControl<LocationFlatNode>;
  treeFlattener!: MatTreeFlattener<LocationNode, LocationFlatNode>;
  dataSource!: MatTreeFlatDataSource<LocationNode, LocationFlatNode>;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  ngOnInit(): void {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<LocationFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    if (this.transSiteHierarchySelected?.length) {
      this.initialSelectedSiteLocation();
    } else {
      this.checklistSelection.clear(true)
      this.fieldName.setValue(null);
    }

  }

  ngOnChanges(): void {
    this.initialize()
    if (!this.transSiteHierarchySelected?.length) {
      this.checklistSelection.clear(true)
      this.fieldName.setValue(null);
    }
  }

  initialSelectedSiteLocation() {
    this.transSiteHierarchySelected.forEach((node) => {
      let index = this.treeControl?.dataNodes?.findIndex(item => item.hierarchy === node.hierarchy && item.item === node.item);
      this.checklistSelection.toggle(this.treeControl.dataNodes[index])
    })
  }

  initialize() {
    this.initialTreeData =this.treeData 
    const data = this.treeData;
    this.dataChange.next(data);
  }

  transformer = (node: LocationNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new LocationFlatNode(node.item, level, node.hierarchy, !!node.children);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  opened() {
    this.treeControl.collapseAll()
  }

  descendantsAllSelected(node: LocationFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  descendantsPartiallySelected(node: LocationFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  todoItemSelectionToggle(node: LocationFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.every(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  todoLeafItemSelectionToggle(node: LocationFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: LocationFlatNode): void {
    let parent: LocationFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
    this.sendSelectedItems();
    this.fieldName.setValue(null);
    this.autoInput.nativeElement.value = '';
    this.dataChange.next(this.initialTreeData)
  }

  checkRootNodeSelection(node: LocationFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: LocationFlatNode): LocationFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  sendSelectedItems() {
    if (this.checklistSelection.selected.length) {
      let data: string[] = this.checklistSelection.selected.map(s => s.hierarchy);
      this.sendTransSiteHierarchySelected.emit(data)
    }else{
      this.sendTransSiteHierarchySelected.emit([]);
    }
  }

  filterChanged(filterText: any) {
    this.filter(filterText.value);
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
    this.fieldName.setValue(null);
  }

  filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      // Filter the tree
      function filter(array: any, text: any) {
        const getChildren = (result: any, object: any) => {
          if (object.item.toLowerCase().includes(text.toLowerCase())) {
            result.push(object);
            return result;
          }
          if (Array.isArray(object.children)) {
            const children = object.children.reduce(getChildren, []);
            if (children.length) result.push({ ...object, children });
          }
          return result;
        };
        return array.reduce(getChildren, []);
      }
      filteredTreeData = filter(this.treeData, filterText);
    } else {
      filteredTreeData = this.treeData;
    }
    const data = filteredTreeData;
    this.dataChange.next(data);
  }

  removeSelected(node: LocationFlatNode) {
    const index = this.checklistSelection.selected.indexOf(node);
    if (index >= 0) {
      this.todoItemSelectionToggle(node);
    }
  }
}

