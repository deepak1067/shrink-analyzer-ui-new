import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HierarchyFieldComponent } from "./hierarchy-field.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "src/app/shared/module/material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LocationFlatNode, LocationNode } from "../../dashboard.model";
import { TranslateModule } from "@ngx-translate/core";

describe("HierarchyFieldComponent", () => {
  let component: HierarchyFieldComponent;
  let fixture: ComponentFixture<HierarchyFieldComponent>;
  const mockDataSource: LocationNode[] = [
    {
      item: "Europe",
      children: [
        {
          item: "Portugal",
          children: [
            {
              item: "Porto",
              hierarchy: "Europe/Portugal/Porto",
            },
            {
              item: "Aveiro",

              hierarchy: "Europe/Portugal/Aveiro",
            },
          ],
          hierarchy: "Europe/Portugal",
        },
        {
          item: "England",
          children: [
            {
              item: "London",
              hierarchy: "Europe/England/London",
            },
          ],
          hierarchy: "Europe/England",
        },
      ],
      hierarchy: "Europe",
    },
  ];

  const mockInitialSelectedData: LocationFlatNode[] = [
    {
      item: "England",
      level: 1,
      expandable: true,
      hierarchy: "Europe/England",
    },
    {
      item: "London",
      level: 2,
      expandable: false,
      hierarchy: "Europe/England/London",
    },
  ];

  const mockTreeControlDataNode: LocationFlatNode[] = [
    {
      item: "Europe",
      level: 0,
      expandable: true,
      hierarchy: "Europe",
    },
    {
      item: "Portugal",
      level: 1,
      expandable: true,
      hierarchy: "Europe/Portugal",
    },
    {
      item: "Porto",
      level: 2,
      expandable: false,
      hierarchy: "Europe/Portugal/Porto",
    },
    {
      item: "Aveiro",
      level: 2,
      expandable: false,
      hierarchy: "Europe/Portugal/Aveiro",
    },
    {
      item: "England",
      level: 1,
      expandable: true,
      hierarchy: "Europe/England",
    },
    {
      item: "London",
      level: 2,
      expandable: false,
      hierarchy: "Europe/England/London",
    },
  ];

  const node = {
    item: "Europe",
    level: 0,
    expandable: true,
    hierarchy: "Europe",
  };

  const mockDescendants = [
    {
      item: "England",
      level: 1,
      expandable: true,
      hierarchy: "Europe/England",
    },
    {
      item: "Porto",
      level: 2,
      expandable: true,
      hierarchy: "Europe/England/Porto",
    },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HierarchyFieldComponent],
      imports:[MaterialModule, FormsModule,
        ReactiveFormsModule,BrowserAnimationsModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]

    });
    fixture = TestBed.createComponent(HierarchyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize data source when data is emitted", () => {
    spyOn(component.dataChange, "subscribe");
    spyOn(component.dataChange, "next");
    component.dataChange.next(mockDataSource);
    component.ngOnInit();

    component.dataChange.subscribe((res) => {
      expect(component.dataSource.data).toEqual(mockDataSource);
    });
  });

  it("should handle initial selection when transSiteHierarchySelected has length", () => {
    component.transSiteHierarchySelected = mockInitialSelectedData;
    spyOn(component, "initialSelectedSiteLocation");
    component.ngOnInit();

    expect(component.initialSelectedSiteLocation).toHaveBeenCalled();
  });

  it("should clear selection and reset field name when transSiteHierarchySelected is empty", () => {
    component.transSiteHierarchySelected = [];
    spyOn(component.checklistSelection, "clear");
    spyOn(component.fieldName, "setValue");
    component.ngOnInit();

    expect(component.checklistSelection.clear).toHaveBeenCalledWith(true);
    expect(component.fieldName.setValue).toHaveBeenCalledWith(null);
  });

  it("should clear selection and reset field name when transSiteHierarchySelected is empty at ngOnChange called", () => {
    component.transSiteHierarchySelected = [];
    spyOn(component.checklistSelection, "clear");
    spyOn(component.fieldName, "setValue");
    component.ngOnChanges();

    expect(component.checklistSelection.clear).toHaveBeenCalledWith(true);
    expect(component.fieldName.setValue).toHaveBeenCalledWith(null);
  });

  it("should toggle selection for items in transSiteHierarchySelected", () => {
    component.treeControl.dataNodes = [...mockTreeControlDataNode];
    component.transSiteHierarchySelected = [...mockInitialSelectedData];
    spyOn(component.checklistSelection, "toggle");
    component.initialSelectedSiteLocation();

    expect(component.checklistSelection.toggle).toHaveBeenCalledWith(
      mockTreeControlDataNode[4]
    );
    expect(component.checklistSelection.toggle).toHaveBeenCalledWith(
      mockTreeControlDataNode[5]
    );
  });

  it("should initialize tree with tree data", () => {
    component.treeData = mockTreeControlDataNode;
    spyOn(component.dataChange, "next");
    component.initialize();

    expect(component.dataChange.next).toHaveBeenCalledWith(
      mockTreeControlDataNode
    );
  });

  it("should create a new LocationFlatNode when there is no existing node", () => {
    const node = mockTreeControlDataNode[0];
    const result = component.transformer(node, 0);

    expect(component.flatNodeMap.has(result)).toBeTruthy();
    expect(component.nestedNodeMap.has(node)).toBeTruthy();
  });

  it("should create a new LocationFlatNode with correct level", () => {
    const node = mockTreeControlDataNode[0];
    const result = component.transformer(node, 1);

    expect(component.flatNodeMap.has(result)).toBeTruthy();
    expect(component.nestedNodeMap.has(node)).toBeTruthy();
    expect(result.level).toBe(1);
  });

  it("should create a new LocationFlatNode with children flag", () => {
    const nodeWithChildren = mockTreeControlDataNode[0];
    const result = component.transformer(nodeWithChildren, 0);

    expect(component.flatNodeMap.has(result)).toBeTruthy();
    expect(component.nestedNodeMap.has(nodeWithChildren)).toBeTruthy();
  });

  it("should create a new LocationFlatNode without children flag", () => {
    const nodeNoChildren = mockTreeControlDataNode[0];
    const result = component.transformer(nodeNoChildren, 0);

    expect(component.flatNodeMap.has(result)).toBeTruthy();
    expect(component.nestedNodeMap.has(nodeNoChildren)).toBeTruthy();
  });

  it("should collapse all tree nodes when opened", () => {
    spyOn(component.treeControl, "collapseAll");
    component.opened();

    expect(component.treeControl.collapseAll).toHaveBeenCalled();
  });

  it("should return true if all descendants are selected", () => {
    component.treeControl.dataNodes = [...mockDescendants];
    component.checklistSelection.select(mockDescendants[0]);
    spyOn(component.treeControl, "getDescendants").and.returnValue(
      mockDescendants
    );
    spyOn(mockDescendants, "every").and.returnValue(true);
    spyOn(component.checklistSelection, "isSelected").and.returnValue(true);
    const result = component.descendantsAllSelected(node);

    mockDescendants.every((child) =>
      expect(component.checklistSelection.isSelected).toHaveBeenCalledWith(
        child
      )
    );
    expect(result).toBeTruthy();
  });

  it("should return true if some descendants are selected and not all are selected", () => {
    component.treeControl.dataNodes = [...mockDescendants];
    component.checklistSelection.select(mockDescendants[0]);

    spyOn(component.treeControl, "getDescendants").and.returnValue( mockDescendants);
    spyOn(component, "descendantsAllSelected").and.returnValue(false);
    spyOn(mockDescendants, "some").and.returnValue(true);
    spyOn(component.checklistSelection, "isSelected").and.returnValue(true);
    component.descendantsPartiallySelected(node);

    mockDescendants.some((child) =>
      expect(component.checklistSelection.isSelected).toHaveBeenCalledWith(
        child
      )
    );

    const result = component.descendantsPartiallySelected(node) &&!component.descendantsAllSelected(node);
    expect(result).toBeTruthy();
  });

  it("should toggle selection and select/deselect descendants accordingly", () => {
    component.treeControl.dataNodes = [...mockDescendants];
    component.checklistSelection.select(mockDescendants[0]);
    spyOn(component.checklistSelection, "toggle");
    spyOn(component.treeControl, "getDescendants").and.returnValue(
      mockDescendants
    );
    spyOn(component.checklistSelection, "isSelected").and.returnValue(true);
    spyOn(component.checklistSelection, "select");
    spyOn(component.checklistSelection, "deselect");
    spyOn(mockDescendants, "every").and.returnValue(true);
    spyOn(component, "checkAllParentsSelection");
    component.todoItemSelectionToggle(node);

    expect(component.checklistSelection.toggle).toHaveBeenCalledWith(node);
    expect(component.treeControl.getDescendants).toHaveBeenCalledWith(node);
    expect(component.checklistSelection.isSelected).toHaveBeenCalledWith(node);
    expect(component.checklistSelection.select).toHaveBeenCalledWith(
      ...mockDescendants
    );
    expect(component.checklistSelection.deselect).not.toHaveBeenCalled();
    expect(mockDescendants.every).toHaveBeenCalled();
    expect(component.checkAllParentsSelection).toHaveBeenCalledWith(node);
  });

  it("should toggle Leaf Item Selection Toggle accordingly", () => {
    spyOn(component.checklistSelection, "toggle");
    spyOn(component, "checkAllParentsSelection");
    component.todoLeafItemSelectionToggle(node);

    expect(component.checklistSelection.toggle).toHaveBeenCalledWith(node);
    expect(component.checkAllParentsSelection).toHaveBeenCalledWith(node);
  });

  it("should iterate through all parents and update selection", () => {
    const node = {
      item: "Porto",
      level: 2,
      expandable: true,
      hierarchy: "Europe/England/Porto",
    };

    const parentNode1 = {
      item: "Europe",
      level: 0,
      expandable: true,
      hierarchy: "Europe",
    };

    const parentNode2 = {
      item: "England",
      level: 1,
      expandable: true,
      hierarchy: "Europe/England",
    };

    spyOn(component, "getParentNode").and.returnValues(parentNode1,parentNode2,null );
    spyOn(component, "checkRootNodeSelection");
    spyOn(component, "sendSelectedItems");
    spyOn(component.fieldName, "setValue");
    spyOn(component.autoInput.nativeElement, "value").and.returnValue("");
    component.checkAllParentsSelection(node);

    expect(component.getParentNode).toHaveBeenCalledTimes(3);
    expect(component.checkRootNodeSelection).toHaveBeenCalledTimes(2);
    expect(component.sendSelectedItems).toHaveBeenCalled();
    expect(component.fieldName.setValue).toHaveBeenCalledWith(null);
    expect(component.autoInput.nativeElement.value).toEqual("");
  });

  it("should deselect root node if some descendants are selected but not all", () => {
    spyOn(component.checklistSelection, "isSelected").and.returnValue(true);
    spyOn(component.treeControl, "getDescendants").and.returnValue(
      mockDescendants
    );
    spyOn(mockDescendants, "every").and.returnValue(false);
    spyOn(component.checklistSelection, "deselect");
    component.checkRootNodeSelection(node);

    expect(component.checklistSelection.isSelected).toHaveBeenCalledWith(node);
    expect(component.treeControl.getDescendants).toHaveBeenCalledWith(node);
    expect(mockDescendants.every).toHaveBeenCalled();
    expect(component.checklistSelection.deselect).toHaveBeenCalledWith(node);
  });

  it("should select root node if not selected but all descendants are selected", () => {
    spyOn(component.checklistSelection, "isSelected").and.returnValue(false);
    spyOn(component.treeControl, "getDescendants").and.returnValue(
      mockDescendants
    );
    spyOn(mockDescendants, "every").and.returnValue(true);
    spyOn(component.checklistSelection, "select");
    component.checkRootNodeSelection(node);
    expect(component.checklistSelection.isSelected).toHaveBeenCalledWith(node);
    expect(component.treeControl.getDescendants).toHaveBeenCalledWith(node);
    expect(mockDescendants.every).toHaveBeenCalled();
    expect(component.checklistSelection.select).toHaveBeenCalledWith(node);
  });

  it("should not perform selection/deselection if conditions are not met", () => {
    spyOn(component.checklistSelection, "isSelected").and.returnValue(true);
    spyOn(component.treeControl, "getDescendants").and.returnValue(
      mockDescendants
    );
    spyOn(mockDescendants, "every").and.returnValue(true);
    spyOn(component.checklistSelection, "deselect");
    spyOn(component.checklistSelection, "select");
    component.checkRootNodeSelection(node);

    expect(component.checklistSelection.isSelected).toHaveBeenCalledWith(node);
    expect(component.treeControl.getDescendants).toHaveBeenCalledWith(node);
    expect(mockDescendants.every).toHaveBeenCalled();
    expect(component.checklistSelection.deselect).not.toHaveBeenCalled();
    expect(component.checklistSelection.select).not.toHaveBeenCalled();
  });

  it("should return null if currentLevel is less than 1", () => {
    spyOn(component, "getLevel").and.returnValue(0);
    const result = component.getParentNode(node);

    expect(result).toBeNull();
  });

  it("should return the correct parent node", () => {
    const dataNodes = [...mockDescendants, node];
    component.treeControl.dataNodes = [...dataNodes];
    spyOn(component, "getLevel").and.returnValues(2, 1, 2);
    const result = component.getParentNode(node);
    
    expect(result).toEqual(dataNodes[1]);
  });

  it("should return null if no parent node is found", () => {
    const dataNodes = [...mockDescendants, node];
    component.treeControl.dataNodes = [...dataNodes];
    spyOn(component, "getLevel").and.returnValue(2);
    const result = component.getParentNode(node);

    expect(result).toBeNull();
  });

  it("should emit selected data if checklistSelection has selected items", () => {
    component.checklistSelection.select(node);
    spyOn(component.sendTransSiteHierarchySelected, "emit");
    component.sendSelectedItems();

    expect(component.sendTransSiteHierarchySelected.emit).toHaveBeenCalledWith(["Europe"]);
  });

  it("should emit empty array if checklistSelection has no selected items", () => {
    spyOn(component.sendTransSiteHierarchySelected, "emit");
    component.sendSelectedItems();
    expect(component.sendTransSiteHierarchySelected.emit).toHaveBeenCalledWith([]);
  });

  it("should filter the data and expand/collapse tree control accordingly", () => {
    const filterText = { value: "asia" };
    spyOn(component, "filter");
    spyOn(component.treeControl, "expandAll");
    spyOn(component.fieldName, "setValue");
    component.filterChanged(filterText);

    expect(component.filter).toHaveBeenCalledWith("asia");
    expect(component.treeControl.expandAll).toHaveBeenCalled();
    expect(component.fieldName.setValue).toHaveBeenCalledWith(null);
  });

  it("should collapse the tree control when filterText is falsy", () => {
    const filterText = { value: "" };
    spyOn(component, "filter");
    spyOn(component.treeControl, "collapseAll");
    spyOn(component.fieldName, "setValue");
    component.filterChanged(filterText);

    expect(component.filter).toHaveBeenCalledWith("");
    expect(component.fieldName.setValue).toHaveBeenCalledWith(null);
  });

  it("should filter the tree data based on filterText", () => {
    const filterText = "Porto";
    const mockFilteredTreeData = [
      {
        item: "Europe",
        children: [
          {
            item: "Portugal",
            children: [
              {
                item: "Porto",
                hierarchy: "Europe/Portugal/Porto",
              },
            ],
            hierarchy: "Europe/Portugal",
          },
        ],
        hierarchy: "Europe",
      },
    ];

    spyOn(component, "filter").and.callThrough();
    spyOn(component.treeData, "reduce").and.returnValue(mockFilteredTreeData);
    spyOn(component.dataChange, "next");
    component.filter(filterText);

    expect(component.filter).toHaveBeenCalledWith(filterText);
    expect(component.dataChange.next).toHaveBeenCalledWith( mockFilteredTreeData);
  });

  it("should reset the tree data when filterText is falsy", () => {
    const filterText = "";
    const mockTreeData = mockTreeControlDataNode;

    spyOn(component, "filter").and.callThrough();
    spyOn(component.treeData, "reduce").and.returnValue(mockTreeData);
    spyOn(component.dataChange, "next");

    component.filter(filterText);
    expect(component.filter).toHaveBeenCalledWith(filterText);
  });

  it("should toggle selection when the node is in the checklistSelection", () => {
    spyOn(component.checklistSelection.selected, "indexOf").and.returnValue(0);
    spyOn(component, "todoItemSelectionToggle");
    component.removeSelected(node);

    expect(component.checklistSelection.selected.indexOf).toHaveBeenCalledWith(node);
    expect(component.todoItemSelectionToggle).toHaveBeenCalledWith(node);
  });

  it("should not toggle selection when the node is not in the checklistSelection", () => {
    spyOn(component.checklistSelection.selected, "indexOf").and.returnValue(-1);
    spyOn(component, "todoItemSelectionToggle");
    component.removeSelected(node);

    expect(component.checklistSelection.selected.indexOf).toHaveBeenCalledWith(node);
    expect(component.todoItemSelectionToggle).not.toHaveBeenCalled();
  });
});
