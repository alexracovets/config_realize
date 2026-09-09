import { assertMailConfigured, getMailTestRedirectEmail, getShopOwnerEmail, isMailEnabled } from '@mail/config';
import { buildCustomerOrderEmail, buildOwnerOrderEmail } from '@mail/orderEmailTemplates';
import { getMailTransporter } from '@mail/transport';

type sendOrderEmailsContextType = {
  orderNumber: string;
  orderDate: string;
  customer: { name: string; email: string; phone: string };
  shippingSummary: string;
  orderPdfUrl: string;
  cuttingPdfUrl: string;
  orderPdfBuffer: Buffer;
  cuttingPdfBuffer: Buffer;
};

type orderEmailDeliveryType = 'sent' | 'skipped' | 'failed';

type sendOrderEmailsResultType = {
  customer: orderEmailDeliveryType;
  owner: orderEmailDeliveryType;
};

const buildPdfFilename = (prefix: string, orderNumber: string): string => {
  const slug = orderNumber.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'order';
  return `${prefix}-${slug}.pdf`;
};

const sendOrderEmails = async (context: sendOrderEmailsContextType): Promise<sendOrderEmailsResultType> => {
  if (!isMailEnabled()) {
    console.warn('[mail] SMTP is not configured — skipping order emails.');
    return { customer: 'skipped', owner: 'skipped' };
  }

  const { from } = assertMailConfigured();
  const transporter = getMailTransporter();
  const ownerEmail = getShopOwnerEmail();
  const testRedirectEmail = getMailTestRedirectEmail();

  const resolveRecipient = (intended: string | undefined, label: string): string | undefined => {
    if (!testRedirectEmail) return intended;
    console.warn(
      `[mail] MAIL_TEST_REDIRECT_EMAIL is set — ${label} email for order ${context.orderNumber} goes to ${testRedirectEmail} instead of ${intended || '(none)'}.`,
    );
    return testRedirectEmail;
  };

  const sendCustomerEmail = async (): Promise<orderEmailDeliveryType> => {
    const recipientEmail = resolveRecipient(context.customer.email, 'customer');

    if (!recipientEmail) {
      console.warn(`[mail] Order ${context.orderNumber} has no customer email — skipping customer email.`);
      return 'skipped';
    }

    const body = buildCustomerOrderEmail({
      orderNumber: context.orderNumber,
      orderDate: context.orderDate,
      customerName: context.customer.name,
    });

    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: body.subject,
      text: body.text,
      html: body.html,
      attachments: [
        {
          filename: buildPdfFilename('riepilogo-ordine', context.orderNumber),
          content: context.orderPdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return 'sent';
  };

  const sendOwnerEmail = async (): Promise<orderEmailDeliveryType> => {
    const recipientEmail = resolveRecipient(ownerEmail, 'owner');

    if (!recipientEmail) {
      console.warn('[mail] ORDER_NOTIFICATION_EMAIL is not configured — skipping owner email.');
      return 'skipped';
    }

    const body = buildOwnerOrderEmail({
      orderNumber: context.orderNumber,
      orderDate: context.orderDate,
      customerName: context.customer.name,
      customerEmail: context.customer.email,
      customerPhone: context.customer.phone,
      shippingSummary: context.shippingSummary,
      orderPdfUrl: context.orderPdfUrl,
      cuttingPdfUrl: context.cuttingPdfUrl,
    });

    await transporter.sendMail({
      from,
      to: recipientEmail,
      replyTo: context.customer.email || undefined,
      subject: body.subject,
      text: body.text,
      html: body.html,
      attachments: [
        {
          filename: buildPdfFilename('distinta-taglio', context.orderNumber),
          content: context.cuttingPdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return 'sent';
  };

  const [customerResult, ownerResult] = await Promise.allSettled([sendCustomerEmail(), sendOwnerEmail()]);

  if (customerResult.status === 'rejected') {
    console.error(`[mail] Customer email failed for order ${context.orderNumber}:`, customerResult.reason);
  }
  if (ownerResult.status === 'rejected') {
    console.error(`[mail] Owner email failed for order ${context.orderNumber}:`, ownerResult.reason);
  }

  return {
    customer: customerResult.status === 'fulfilled' ? customerResult.value : 'failed',
    owner: ownerResult.status === 'fulfilled' ? ownerResult.value : 'failed',
  };
};

export { sendOrderEmails };
export type { orderEmailDeliveryType, sendOrderEmailsContextType, sendOrderEmailsResultType };
