import type{ Product, CountingGroup } from '../types';

export const defaultGroups: CountingGroup[] = [
  {
    id: 'group1',
    name: 'Grupa A - Stickery',
    materialGroups: ['1002001'],
    person1: 'Anna Kowalska',
    person2: 'Jan Nowak'
  },
  {
    id: 'group2', 
    name: 'Grupa B - Opakowania',
    materialGroups: ['1004009', '1004003'],
    person1: 'Maria Wiśniewska',
    person2: 'Piotr Zieliński'
  }
];

export const defaultProducts: Product[] = [
  { id: 1, sapCode: '12000602', name: 'TOP/BOTTOM FOR BOX FOR PREFORMS', materialGroup: '1004009', expectedQty: 5885, countedQty: null },
  { id: 2, sapCode: '12000746', name: 'STICKER 330 CAN X24 COCA COLA', materialGroup: '1002001', expectedQty: 258500, countedQty: null },
  { id: 3, sapCode: '12006241', name: 'PALLET LAYER DIVIDER 1200MMX800MM CBC', materialGroup: '1004009', expectedQty: 3726, countedQty: null },
  { id: 4, sapCode: '12006259', name: 'SHRFLM TRANSPARENT 490 MM X 55 MIC', materialGroup: '1004003', expectedQty: 1898, countedQty: null },
  { id: 5, sapCode: '12006272', name: 'STICKER COKE ZERO 330 CAN', materialGroup: '1002001', expectedQty: 35500, countedQty: null },
  { id: 6, sapCode: '12006273', name: 'STICKER COKE ZERO 330 CAN VARIANT', materialGroup: '1002001', expectedQty: 75000, countedQty: null },
  { id: 7, sapCode: '12007889', name: 'STICKER 2.0 PET X8 COCA COLA', materialGroup: '1002001', expectedQty: 90000, countedQty: null },
  { id: 8, sapCode: '12007936', name: 'STICKER COKE ZERO 500 PET', materialGroup: '1002001', expectedQty: 25000, countedQty: null },
  { id: 9, sapCode: '12007937', name: 'STICKER COKE ZERO 500 PET VARIANT', materialGroup: '1002001', expectedQty: 28000, countedQty: null },
  { id: 10, sapCode: '12008134', name: 'SHRFLM CLEAR 510MMX60MIC', materialGroup: '1004003', expectedQty: 1779, countedQty: null },
];