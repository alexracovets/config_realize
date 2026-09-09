export { assertMailConfigured, getShopOwnerEmail, getSmtpFrom, isMailEnabled } from './config';
export type { smtpConfigType } from './config';
export { buildCustomerOrderEmail, buildOwnerOrderEmail } from './orderEmailTemplates';
export type { orderEmailBodyType, orderEmailCustomerContextType, orderEmailOwnerContextType } from './orderEmailTemplates';
export { sendOrderEmails } from './sendOrderEmails';
export type { orderEmailDeliveryType, sendOrderEmailsContextType, sendOrderEmailsResultType } from './sendOrderEmails';
