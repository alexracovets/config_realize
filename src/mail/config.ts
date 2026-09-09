const readEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

type smtpConfigType = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

const DEFAULT_SMTP_HOST = 'smtp.hostinger.com';
const DEFAULT_SMTP_PORT = 465;

const getSmtpHost = (): string => readEnv('SMTP_HOST') ?? DEFAULT_SMTP_HOST;

const getSmtpPort = (): number => {
  const parsed = Number(readEnv('SMTP_PORT'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SMTP_PORT;
};

const getSmtpSecure = (): boolean => {
  const raw = readEnv('SMTP_SECURE');
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return getSmtpPort() === 465;
};

const getSmtpUser = (): string | undefined => readEnv('SMTP_USER');

const getSmtpPassword = (): string | undefined => readEnv('SMTP_PASSWORD');

const getSmtpFrom = (): string | undefined => readEnv('SMTP_FROM') ?? getSmtpUser();

const getShopOwnerEmail = (): string | undefined => readEnv('ORDER_NOTIFICATION_EMAIL');

const getMailTestRedirectEmail = (): string | undefined => readEnv('MAIL_TEST_REDIRECT_EMAIL');

const isMailEnabled = (): boolean => Boolean(getSmtpUser() && getSmtpPassword());

const assertMailConfigured = (): smtpConfigType => {
  const user = getSmtpUser();
  const password = getSmtpPassword();
  const from = getSmtpFrom();

  if (!user || !password || !from) {
    throw new Error('[mail] Missing SMTP_USER or SMTP_PASSWORD. See .env.example.');
  }

  return {
    host: getSmtpHost(),
    port: getSmtpPort(),
    secure: getSmtpSecure(),
    user,
    password,
    from,
  };
};

export { assertMailConfigured, getMailTestRedirectEmail, getShopOwnerEmail, getSmtpFrom, getSmtpHost, getSmtpPort, getSmtpSecure, getSmtpUser, isMailEnabled };
export type { smtpConfigType };
