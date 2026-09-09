type orderEmailCustomerContextType = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
};

type orderEmailOwnerContextType = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingSummary: string;
  orderPdfUrl: string;
  cuttingPdfUrl: string;
};

type orderEmailBodyType = {
  subject: string;
  text: string;
  html: string;
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const wrapHtml = (title: string, rows: string[]): string => `
  <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
    <h2 style="margin: 0 0 16px; font-size: 18px;">${escapeHtml(title)}</h2>
    ${rows.join('\n    ')}
  </div>
`;

const buildCustomerOrderEmail = (context: orderEmailCustomerContextType): orderEmailBodyType => {
  const greeting = context.customerName ? `Ciao ${context.customerName},` : 'Ciao,';
  const subject = `Riepilogo ordine ${context.orderNumber}`;

  const text = [
    greeting,
    '',
    `grazie per il tuo ordine ${context.orderNumber} del ${context.orderDate}.`,
    'In allegato trovi il riepilogo dell’ordine in formato PDF.',
    '',
    'Ti contatteremo appena la produzione sarà avviata.',
    '',
    'Realize Sportswear',
  ].join('\n');

  const html = wrapHtml(subject, [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>grazie per il tuo ordine <strong>${escapeHtml(context.orderNumber)}</strong> del ${escapeHtml(context.orderDate)}.</p>`,
    '<p>In allegato trovi il riepilogo dell&rsquo;ordine in formato PDF.</p>',
    '<p>Ti contatteremo appena la produzione sar&agrave; avviata.</p>',
    '<p style="margin-top: 24px; color: #666;">Realize Sportswear</p>',
  ]);

  return { subject, text, html };
};

const buildOwnerOrderEmail = (context: orderEmailOwnerContextType): orderEmailBodyType => {
  const subject = `Nuovo ordine ${context.orderNumber} — distinta di taglio`;

  const text = [
    `Nuovo ordine ${context.orderNumber} del ${context.orderDate}.`,
    '',
    `Cliente: ${context.customerName || '—'}`,
    `Email: ${context.customerEmail || '—'}`,
    `Telefono: ${context.customerPhone || '—'}`,
    `Spedizione: ${context.shippingSummary || '—'}`,
    '',
    'In allegato la distinta di taglio in formato PDF.',
    '',
    `Riepilogo ordine: ${context.orderPdfUrl}`,
    `Distinta di taglio: ${context.cuttingPdfUrl}`,
  ].join('\n');

  const html = wrapHtml(subject, [
    `<p>Nuovo ordine <strong>${escapeHtml(context.orderNumber)}</strong> del ${escapeHtml(context.orderDate)}.</p>`,
    '<table style="border-collapse: collapse; margin: 16px 0;">',
    `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Cliente</td><td style="padding: 4px 0;">${escapeHtml(context.customerName || '—')}</td></tr>`,
    `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td style="padding: 4px 0;">${escapeHtml(context.customerEmail || '—')}</td></tr>`,
    `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Telefono</td><td style="padding: 4px 0;">${escapeHtml(context.customerPhone || '—')}</td></tr>`,
    `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Spedizione</td><td style="padding: 4px 0;">${escapeHtml(context.shippingSummary || '—')}</td></tr>`,
    '</table>',
    '<p>In allegato la distinta di taglio in formato PDF.</p>',
    `<p><a href="${escapeHtml(context.orderPdfUrl)}">Riepilogo ordine (PDF)</a><br/><a href="${escapeHtml(context.cuttingPdfUrl)}">Distinta di taglio (PDF)</a></p>`,
  ]);

  return { subject, text, html };
};

export { buildCustomerOrderEmail, buildOwnerOrderEmail };
export type { orderEmailBodyType, orderEmailCustomerContextType, orderEmailOwnerContextType };
