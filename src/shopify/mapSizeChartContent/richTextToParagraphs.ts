type richTextInlineNodeType = {
  type: 'text';
  value?: string;
  bold?: boolean;
  italic?: boolean;
};

type richTextBlockNodeType = {
  type: string;
  listType?: 'unordered' | 'ordered';
  children?: (richTextInlineNodeType | richTextBlockNodeType)[];
};

const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const isInlineNode = (node: richTextInlineNodeType | richTextBlockNodeType): node is richTextInlineNodeType => node.type === 'text';

const inlineNodeToHtml = (node: richTextInlineNodeType): string => {
  const text = escapeHtml(node.value ?? '');
  const bolded = node.bold ? `<b>${text}</b>` : text;
  return node.italic ? `<i>${bolded}</i>` : bolded;
};

const childrenToHtml = (children: (richTextInlineNodeType | richTextBlockNodeType)[] = []): string =>
  children.map((child) => (isInlineNode(child) ? inlineNodeToHtml(child) : blockNodeToHtml(child))).join('');

const blockNodeToHtml = (node: richTextBlockNodeType): string => {
  switch (node.type) {
    case 'list': {
      const tag = node.listType === 'ordered' ? 'ol' : 'ul';
      const items = (node.children ?? [])
        .map((item) => `<li>${childrenToHtml((item as richTextBlockNodeType).children)}</li>`)
        .join('');
      return `<${tag}>${items}</${tag}>`;
    }
    default:
      return childrenToHtml(node.children);
  }
};

/** Converts a Shopify `rich_text_field` metafield JSON value into one HTML string per top-level block (paragraph/heading/list). */
const richTextJsonToParagraphs = (json: string): string[] => {
  try {
    const doc = JSON.parse(json) as richTextBlockNodeType;
    return (doc.children ?? []).map(blockNodeToHtml).filter((html) => html.trim().length > 0);
  } catch {
    return [];
  }
};

/** Splits a plain single/multi-line text metafield value into escaped paragraph strings. */
const plainTextToParagraphs = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(escapeHtml);

/** Converts a text-like metafield value to paragraph HTML strings, using the metafield `type` to pick the parser. */
const metafieldValueToParagraphs = (value: string, type?: string | null): string[] =>
  type === 'rich_text_field' ? richTextJsonToParagraphs(value) : plainTextToParagraphs(value);

export { metafieldValueToParagraphs };
