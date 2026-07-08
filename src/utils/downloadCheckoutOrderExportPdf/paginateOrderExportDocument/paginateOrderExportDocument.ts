const ORDER_EXPORT_PAGE_WIDTH_PX = 794;
const ORDER_EXPORT_PAGE_HEIGHT_PX = 1123;
const ORDER_EXPORT_PAGE_PADDING_TOP_PX = 24;
const ORDER_EXPORT_PAGE_PADDING_BOTTOM_PX = 20;
const ORDER_EXPORT_CONTENT_FOOTER_GAP_PX = 24;

type orderExportPagePartsType = {
  header: HTMLElement | null;
  info: HTMLElement | null;
  tableHead: HTMLTableSectionElement | null;
  tableRows: HTMLTableRowElement[];
  totalsDivider: HTMLElement | null;
  totals: HTMLElement | null;
  footer: HTMLElement;
};

type orderExportPageBuildType = {
  content: HTMLElement;
  isContinuation: boolean;
};

const cloneNode = <T extends Node>(node: T): T => node.cloneNode(true) as T;

const extractPageParts = (documentElement: HTMLElement): orderExportPagePartsType => {
  const content = documentElement.querySelector('.order-export__content');
  const table = content?.querySelector('.order-export__table');
  const footer = documentElement.querySelector('.order-export__footer');

  if (!(content instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
    throw new Error('Order export document is missing required sections.');
  }

  return {
    header: content.querySelector('.order-export__header'),
    info: content.querySelector('.order-export__info'),
    tableHead: table?.querySelector('thead') ?? null,
    tableRows: Array.from(table?.querySelectorAll('tbody tr') ?? []).filter((row): row is HTMLTableRowElement => row instanceof HTMLTableRowElement),
    totalsDivider: content.querySelector('.order-export__divider--totals'),
    totals: content.querySelector('.order-export__totals'),
    footer,
  };
};

const createMeasurementRoot = (documentElement: HTMLElement) => {
  const root = document.createElement('div');
  root.setAttribute('data-order-export-measure', '');
  root.style.cssText = `position:fixed;left:-20000px;top:0;width:${ORDER_EXPORT_PAGE_WIDTH_PX}px;visibility:hidden;pointer-events:none;background:#fff;`;

  const style = documentElement.parentElement?.querySelector('style');
  if (style) {
    root.appendChild(style.cloneNode(true));
  }

  document.body.appendChild(root);
  return root;
};

const measureBlockHeight = (measureRoot: HTMLElement, className: string, build: (container: HTMLElement) => void) => {
  const shell = document.createElement('div');
  shell.className = 'order-export-page';
  const inner = document.createElement('div');
  inner.className = 'order-export-page__inner';
  const container = document.createElement('div');
  container.className = className;
  build(container);
  inner.appendChild(container);
  shell.appendChild(inner);
  measureRoot.appendChild(shell);
  const height = container.getBoundingClientRect().height;
  measureRoot.removeChild(shell);
  return height;
};

const measureFooterHeight = (measureRoot: HTMLElement, footerTemplate: HTMLElement) =>
  measureBlockHeight(measureRoot, 'order-export-page__footer-measure', (container) => {
    const footer = cloneNode(footerTemplate);
    footer.classList.add('order-export__footer--page');
    container.appendChild(footer);
  });

const measureTableSectionHeight = (
  measureRoot: HTMLElement,
  tableHead: HTMLTableSectionElement | null,
  rows: HTMLTableRowElement[],
) =>
  measureBlockHeight(measureRoot, 'order-export-page__table-measure', (container) => {
    const table = document.createElement('table');
    table.className = 'order-export__table';
    if (tableHead) {
      table.appendChild(cloneNode(tableHead));
    }
    if (rows.length > 0) {
      const tbody = document.createElement('tbody');
      rows.forEach((row) => tbody.appendChild(cloneNode(row)));
      table.appendChild(tbody);
    }
    container.appendChild(table);
  });

const createTableWithRows = (tableHead: HTMLTableSectionElement | null, rows: HTMLTableRowElement[]) => {
  const table = document.createElement('table');
  table.className = 'order-export__table';

  if (tableHead) {
    table.appendChild(cloneNode(tableHead));
  }

  if (rows.length > 0) {
    const tbody = document.createElement('tbody');
    rows.forEach((row) => {
      const clonedRow = cloneNode(row);
      clonedRow.classList.add('order-export__table-row');
      tbody.appendChild(clonedRow);
    });
    table.appendChild(tbody);
  }

  return table;
};

const createPageElement = ({ content, isContinuation }: orderExportPageBuildType) => {
  const page = document.createElement('div');
  page.className = `order-export-page${isContinuation ? ' order-export-page--continuation' : ''}`;

  const inner = document.createElement('div');
  inner.className = 'order-export-page__inner';

  const contentSlot = document.createElement('div');
  contentSlot.className = 'order-export-page__content';
  contentSlot.appendChild(content);

  inner.appendChild(contentSlot);
  page.appendChild(inner);

  return { page, inner };
};

const appendFooter = (inner: HTMLElement, footerTemplate: HTMLElement) => {
  const footer = cloneNode(footerTemplate);
  footer.classList.add('order-export__footer--page');
  footer.removeAttribute('data-testid');
  inner.appendChild(footer);
};

const buildFirstPagePrefix = (parts: orderExportPagePartsType) => {
  const fragment = document.createDocumentFragment();

  if (parts.header) {
    fragment.appendChild(cloneNode(parts.header));
  }

  if (parts.info) {
    fragment.appendChild(cloneNode(parts.info));
  }

  return fragment;
};

const buildTotalsSection = (parts: orderExportPagePartsType) => {
  const fragment = document.createDocumentFragment();

  if (parts.totalsDivider) {
    fragment.appendChild(cloneNode(parts.totalsDivider));
  }

  if (parts.totals) {
    fragment.appendChild(cloneNode(parts.totals));
  }

  return fragment;
};

const paginateTableRows = (
  parts: orderExportPagePartsType,
  maxContentHeight: number,
  firstPagePrefixHeight: number,
  tableHeadHeight: number,
  rowHeights: number[],
  totalsSectionHeight: number,
) => {
  const pages: orderExportPageBuildType[] = [];
  let rowIndex = 0;
  let isFirstPage = true;

  const pushPage = (pageContent: HTMLElement, isContinuation: boolean) => {
    pages.push({ content: pageContent, isContinuation });
  };

  while (rowIndex < parts.tableRows.length) {
    const pageContent = document.createElement('div');
    let usedHeight = 0;

    if (isFirstPage) {
      pageContent.appendChild(buildFirstPagePrefix(parts));
      usedHeight += firstPagePrefixHeight;
      isFirstPage = false;
    }

    const pageRows: HTMLTableRowElement[] = [];
    usedHeight += tableHeadHeight;

    while (rowIndex < parts.tableRows.length) {
      const rowHeight = Math.max(rowHeights[rowIndex] ?? 0, 1);
      const rowsRemaining = parts.tableRows.length - rowIndex;
      const isLastRow = rowsRemaining === 1;
      const extraHeight = isLastRow ? totalsSectionHeight : 0;

      if (pageRows.length > 0 && usedHeight + rowHeight + extraHeight > maxContentHeight) {
        break;
      }

      if (pageRows.length === 0 && usedHeight + rowHeight + extraHeight > maxContentHeight) {
        pageRows.push(parts.tableRows[rowIndex]);
        usedHeight += rowHeight;
        rowIndex += 1;
        break;
      }

      pageRows.push(parts.tableRows[rowIndex]);
      usedHeight += rowHeight;
      rowIndex += 1;
    }

    pageContent.appendChild(createTableWithRows(parts.tableHead, pageRows));

    const allRowsPlaced = rowIndex >= parts.tableRows.length;

    if (allRowsPlaced && totalsSectionHeight > 0) {
      if (usedHeight + totalsSectionHeight > maxContentHeight) {
        pushPage(pageContent, pages.length > 0);

        const totalsPageContent = document.createElement('div');
        totalsPageContent.appendChild(buildTotalsSection(parts));
        pushPage(totalsPageContent, true);
        continue;
      }

      pageContent.appendChild(buildTotalsSection(parts));
    }

    pushPage(pageContent, pages.length > 0);
  }

  if (pages.length === 0) {
    const pageContent = document.createElement('div');
    pageContent.appendChild(buildFirstPagePrefix(parts));
    pageContent.appendChild(createTableWithRows(parts.tableHead, []));
    pageContent.appendChild(buildTotalsSection(parts));
    pages.push({ content: pageContent, isContinuation: false });
  }

  return pages;
};

const estimateSinglePageHeight = (
  parts: orderExportPagePartsType,
  firstPagePrefixHeight: number,
  tableHeadHeight: number,
  rowHeights: number[],
  totalsSectionHeight: number,
  footerHeight: number,
) =>
  ORDER_EXPORT_PAGE_PADDING_TOP_PX +
  ORDER_EXPORT_PAGE_PADDING_BOTTOM_PX +
  ORDER_EXPORT_CONTENT_FOOTER_GAP_PX +
  footerHeight +
  firstPagePrefixHeight +
  tableHeadHeight +
  rowHeights.reduce((sum, height) => sum + height, 0) +
  totalsSectionHeight;

const paginateOrderExportDocument = (documentElement: HTMLElement): HTMLElement => {
  documentElement.classList.add('order-export--pdf-capture');

  const parts = extractPageParts(documentElement);
  const measureRoot = createMeasurementRoot(documentElement);

  try {
    const footerHeight = measureFooterHeight(measureRoot, parts.footer);
    const firstPagePrefixHeight = measureBlockHeight(measureRoot, 'order-export-page__prefix-measure', (container) => {
      container.appendChild(buildFirstPagePrefix(parts));
    });
    const tableHeadHeight = measureTableSectionHeight(measureRoot, parts.tableHead, []);
    const rowHeights = parts.tableRows.map((row) => measureTableSectionHeight(measureRoot, parts.tableHead, [row]) - tableHeadHeight);
    const totalsSectionHeight = measureBlockHeight(measureRoot, 'order-export-page__totals-measure', (container) => {
      container.appendChild(buildTotalsSection(parts));
    });

    const pageInnerHeight = ORDER_EXPORT_PAGE_HEIGHT_PX - ORDER_EXPORT_PAGE_PADDING_TOP_PX - ORDER_EXPORT_PAGE_PADDING_BOTTOM_PX;
    const maxContentHeight = pageInnerHeight - footerHeight - ORDER_EXPORT_CONTENT_FOOTER_GAP_PX;

    const singlePageHeight = estimateSinglePageHeight(
      parts,
      firstPagePrefixHeight,
      tableHeadHeight,
      rowHeights,
      totalsSectionHeight,
      footerHeight,
    );

    if (singlePageHeight <= ORDER_EXPORT_PAGE_HEIGHT_PX) {
      documentElement.classList.add('order-export--pdf-single-page');
      return documentElement;
    }

    const pageBuilds = paginateTableRows(
      parts,
      maxContentHeight,
      firstPagePrefixHeight,
      tableHeadHeight,
      rowHeights,
      totalsSectionHeight,
    );

    const pagesRoot = document.createElement('div');
    pagesRoot.className = 'order-export-pages';
    pagesRoot.setAttribute('data-testid', 'checkout-order-export-pages');

    pageBuilds.forEach(({ content, isContinuation }) => {
      const { page, inner } = createPageElement({ content, isContinuation });
      appendFooter(inner, parts.footer);
      pagesRoot.appendChild(page);
    });

    const parent = documentElement.parentElement;
    if (parent) {
      parent.replaceChild(pagesRoot, documentElement);
    }

    return pagesRoot;
  } finally {
    measureRoot.remove();
  }
};

export {
  ORDER_EXPORT_PAGE_HEIGHT_PX,
  ORDER_EXPORT_PAGE_WIDTH_PX,
  paginateOrderExportDocument,
};
