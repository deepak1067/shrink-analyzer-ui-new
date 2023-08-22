export interface RFIDList {
    "Event Time": string;
    "Event ID": string;
    "EPC": string;
    "Site Code": string;
    "Site Name"?: string;
    "Last Read Time": string;
    "Product Code": string;
    "Exit Door ID": string;
    "Last Prior Read": string;
    "Video URL": string;
    "Status": string;
    [product_attributes: string]: any;
  }