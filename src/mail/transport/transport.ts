import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { assertMailConfigured } from '@mail/config';

type mailTransportStateType = {
  transporter: Transporter | null;
};

const transportStateKey = '__orderMailTransportState__';
const globalTransportState = globalThis as typeof globalThis & {
  [transportStateKey]?: mailTransportStateType;
};

const mailTransportState: mailTransportStateType = globalTransportState[transportStateKey] ?? { transporter: null };
globalTransportState[transportStateKey] = mailTransportState;

const getMailTransporter = (): Transporter => {
  if (mailTransportState.transporter) return mailTransportState.transporter;

  const config = assertMailConfigured();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    pool: true,
    maxConnections: 2,
  });

  mailTransportState.transporter = transporter;
  return transporter;
};

export { getMailTransporter };
