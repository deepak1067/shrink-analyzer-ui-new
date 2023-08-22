export interface Site {
    code: string;
    name: string;
    timezone: string;
    'geo-location': {
        hierarchy: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    labels: string[];
    'exit-doors': {
        id: number;
        name: string;
    }[];
}
export interface LocationNode {
    children?: LocationNode[];
    item: string;
    hierarchy:string;
  }
  
  /** Flat to-do item node with expandable and level information */
  export class LocationFlatNode {
    item: string;
    level: number;
    hierarchy:string;
    expandable: boolean;
  
    constructor(item:string, level:number,hierarchy:string, expandable:boolean) {
      this.item = item;
      this.level = level;
      this.expandable = expandable;
      this.hierarchy = hierarchy
    }
  }