type modalInfoTextPartType = {
  type: 'text';
  content: string[];
  compact?: boolean;
};

type modalInfoListPartType = {
  type: 'list';
  items: string[];
  icon?: 'dash' | 'dot' | 'faq';
  compact?: boolean;
  punctuate?: boolean;
};

type modalInfoImagePartType = {
  type: 'image';
  src: string;
  alt?: string;
};

type modalInfoTableColumnType = {
  id: string;
  accessorKey: string;
  header: string;
  subHeader?: string;
};

type modalInfoTableRowType = Record<string, string | number>;

type modalInfoTablePartType = {
  type: 'table';
  variant?: 'default' | 'discounts' | 'size_chart';
  columns: modalInfoTableColumnType[];
  data: modalInfoTableRowType[];
  rowIcon?: 'doubleArrow';
};

type modalInfoPartType = modalInfoTextPartType | modalInfoListPartType | modalInfoImagePartType | modalInfoTablePartType;

type modalInfoSectionType = {
  id: string;
  heading?: string;
  headingClassName?: string;
  parts: modalInfoPartType[];
};

type modalInfoTabType = {
  title?: string;
  sections: modalInfoSectionType[];
};

export type {
  modalInfoImagePartType,
  modalInfoListPartType,
  modalInfoPartType,
  modalInfoSectionType,
  modalInfoTabType,
  modalInfoTableColumnType,
  modalInfoTablePartType,
  modalInfoTableRowType,
  modalInfoTextPartType,
};
