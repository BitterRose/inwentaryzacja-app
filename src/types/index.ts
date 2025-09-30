export interface Product {
  id: number;
  sapCode: string;
  name: string;
  materialGroup: string;
  expectedQty: number;
  countedQty: number | null;
  assignedGroup?: string;
}

export interface InventoryEntry {
  id: number;
  quantity: number;
  timestamp: number;
  location: string;
}

export interface CountingGroup {
  id: string;
  name: string;
  materialGroups: string[];
  person1: string;
  person2: string;
}

export interface UserSession {
  groupId: string;
  personId: 'person1' | 'person2';
  personName: string;
}

export type ProductStatus = 'pending' | 'counted' | 'match' | 'diff' | 'person_diff' | 'verified';

export interface InventoryData {
  [groupId: string]: {
    [personId: string]: {
      [productId: number]: number;
    };
  };
}

export interface InventoryHistory {
  [groupId: string]: {
    [personId: string]: {
      [productId: number]: InventoryEntry[];
    };
  };
}

export interface ComparisonData {
  [groupId: string]: {
    [productId: number]: {
      resolved: boolean;
      finalQuantity?: number;
    };
  };
}