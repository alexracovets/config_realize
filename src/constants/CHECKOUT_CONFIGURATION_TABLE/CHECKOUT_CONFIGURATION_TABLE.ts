import { CHECKOUT_SIZES } from '../CHECKOUT_SIZES';

const CHECKOUT_CONFIGURATION_TABLE_COLUMNS = [
  { id: 'row', header: 'Riga', size: 60, minSize: 60, maxSize: 60 },
  { id: 'size', header: 'Taglia', size: 88, minSize: 88, maxSize: 88 },
  { id: 'name', header: 'Nome', size: 213, minSize: 213, maxSize: 213 },
  { id: 'number', header: 'Numero', size: 116, minSize: 116, maxSize: 116 },
  { id: 'testo', header: 'Testo', size: 213, minSize: 213, maxSize: 213 },
  { id: 'quantity', header: 'Quantità', size: 116, minSize: 116, maxSize: 116 },
  { id: 'actions', header: 'Modifica', size: 116, minSize: 116, maxSize: 116 },
] as const;

const CHECKOUT_CONFIGURATION_TABLE_MIN_WIDTH = CHECKOUT_CONFIGURATION_TABLE_COLUMNS.reduce((total, column) => total + column.minSize, 0);

const CHECKOUT_SIZE_SELECT_OPTIONS = CHECKOUT_SIZES.map((size) => ({ label: size, value: size }));

const CHECKOUT_TABLE_ADD_ROW_LABEL = 'Aggiungi riga';

export { CHECKOUT_CONFIGURATION_TABLE_COLUMNS, CHECKOUT_CONFIGURATION_TABLE_MIN_WIDTH, CHECKOUT_SIZE_SELECT_OPTIONS, CHECKOUT_TABLE_ADD_ROW_LABEL };
