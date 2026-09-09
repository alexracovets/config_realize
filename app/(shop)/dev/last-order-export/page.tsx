import { LastOrderExportPage } from '@pages';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const LastOrderExport = () => {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <LastOrderExportPage />;
};

export default LastOrderExport;
