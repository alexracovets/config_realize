import { ORDER_EXPORT_PAGE_HEIGHT_PX, ORDER_EXPORT_PAGE_WIDTH_PX } from '@utils/downloadCheckoutOrderExportPdf/paginateOrderExportDocument';

const ORDER_CUTTING_EXPORT_PAGE_PADDING_TOP_PX = 24;
const ORDER_CUTTING_EXPORT_PAGE_PADDING_BOTTOM_PX = 32;
const ORDER_CUTTING_EXPORT_BLOCK_GAP_PX = 12;
const ORDER_CUTTING_EXPORT_PAGE_CONTENT_HEIGHT_PX =
  ORDER_EXPORT_PAGE_HEIGHT_PX - ORDER_CUTTING_EXPORT_PAGE_PADDING_TOP_PX - ORDER_CUTTING_EXPORT_PAGE_PADDING_BOTTOM_PX;

type cuttingExportPageBuildType = {
  blocks: HTMLElement[];
};

const cloneNode = <T extends Node>(node: T): T => node.cloneNode(true) as T;

const createMeasurementRoot = (documentElement: HTMLElement) => {
  const root = document.createElement('div');
  root.setAttribute('data-cutting-export-measure', '');
  root.style.cssText = `position:fixed;left:-20000px;top:0;width:${ORDER_EXPORT_PAGE_WIDTH_PX}px;visibility:hidden;pointer-events:none;background:#fff;`;

  const style = documentElement.parentElement?.querySelector('style');
  if (style) {
    root.appendChild(style.cloneNode(true));
  }

  document.body.appendChild(root);
  return root;
};

const measureBlockHeight = (measureRoot: HTMLElement, block: HTMLElement) => {
  const shell = document.createElement('div');
  shell.className = 'cutting-export-page__measure';
  shell.style.width = `${ORDER_EXPORT_PAGE_WIDTH_PX}px`;
  shell.appendChild(cloneNode(block));
  measureRoot.appendChild(shell);
  const height = shell.getBoundingClientRect().height;
  measureRoot.removeChild(shell);
  return height;
};

const extractCuttingExportBlocks = (documentElement: HTMLElement): HTMLElement[] => {
  const blocks: HTMLElement[] = [];

  const title = documentElement.querySelector('.cutting-export__title');
  const subtitle = documentElement.querySelector('.cutting-export__subtitle');
  const customerTable = documentElement.querySelector('.cutting-export__table');
  const articlesTable = documentElement.querySelector('.cutting-export__articles-table');

  if (title instanceof HTMLElement) blocks.push(title);
  if (subtitle instanceof HTMLElement) blocks.push(subtitle);
  if (customerTable instanceof HTMLElement) blocks.push(customerTable);
  if (articlesTable instanceof HTMLElement) blocks.push(articlesTable);

  documentElement.querySelectorAll('.cutting-export__product').forEach((product) => {
    const header = product.querySelector('.cutting-export__product-header');
    if (header instanceof HTMLElement) {
      blocks.push(header);
    }

    product.querySelectorAll('.cutting-export__step').forEach((step) => {
      if (step instanceof HTMLElement) {
        blocks.push(step);
      }
    });
  });

  return blocks;
};

const packBlocksIntoPages = (blocks: HTMLElement[], blockHeights: number[]): cuttingExportPageBuildType[] => {
  const pages: cuttingExportPageBuildType[] = [];
  let currentPage: HTMLElement[] = [];
  let currentPageHeight = 0;

  const flushPage = () => {
    if (currentPage.length === 0) return;
    pages.push({ blocks: currentPage });
    currentPage = [];
    currentPageHeight = 0;
  };

  blocks.forEach((block, index) => {
    const blockHeight = Math.max(blockHeights[index] ?? 0, 1);
    const blockGap = currentPage.length > 0 ? ORDER_CUTTING_EXPORT_BLOCK_GAP_PX : 0;

    if (blockHeight > ORDER_CUTTING_EXPORT_PAGE_CONTENT_HEIGHT_PX) {
      flushPage();
      pages.push({ blocks: [block] });
      return;
    }

    if (currentPage.length > 0 && currentPageHeight + blockGap + blockHeight > ORDER_CUTTING_EXPORT_PAGE_CONTENT_HEIGHT_PX) {
      flushPage();
    }

    const nextGap = currentPage.length > 0 ? ORDER_CUTTING_EXPORT_BLOCK_GAP_PX : 0;
    currentPage.push(block);
    currentPageHeight += nextGap + blockHeight;
  });

  flushPage();

  return pages.length > 0 ? pages : [{ blocks: [] }];
};

const buildPageElement = ({ blocks }: cuttingExportPageBuildType) => {
  const page = document.createElement('div');
  page.className = 'cutting-export-page';

  const inner = document.createElement('div');
  inner.className = 'cutting-export-page__inner';

  blocks.forEach((block, index) => {
    const clone = cloneNode(block);
    if (index > 0) {
      clone.style.marginTop = `${ORDER_CUTTING_EXPORT_BLOCK_GAP_PX}px`;
    }
    inner.appendChild(clone);
  });

  page.appendChild(inner);
  return page;
};

const paginateOrderCuttingExportDocument = (documentElement: HTMLElement): HTMLElement => {
  const blocks = extractCuttingExportBlocks(documentElement);
  const measureRoot = createMeasurementRoot(documentElement);

  try {
    const blockHeights = blocks.map((block) => measureBlockHeight(measureRoot, block));
    const totalHeight = blockHeights.reduce((sum, height) => sum + height, 0);

    if (totalHeight <= ORDER_CUTTING_EXPORT_PAGE_CONTENT_HEIGHT_PX) {
      documentElement.classList.add('cutting-export--pdf-single-page');
      return documentElement;
    }

    const pageBuilds = packBlocksIntoPages(blocks, blockHeights);
    const pagesRoot = document.createElement('div');
    pagesRoot.className = 'cutting-export-pages';
    pagesRoot.setAttribute('data-testid', 'order-cutting-export-pages');

    pageBuilds.forEach((pageBuild) => {
      pagesRoot.appendChild(buildPageElement(pageBuild));
    });

    return pagesRoot;
  } finally {
    measureRoot.remove();
  }
};

export {
  ORDER_CUTTING_EXPORT_PAGE_CONTENT_HEIGHT_PX,
  ORDER_CUTTING_EXPORT_PAGE_PADDING_BOTTOM_PX,
  ORDER_CUTTING_EXPORT_PAGE_PADDING_TOP_PX,
  ORDER_EXPORT_PAGE_HEIGHT_PX,
  ORDER_EXPORT_PAGE_WIDTH_PX,
  paginateOrderCuttingExportDocument,
};
