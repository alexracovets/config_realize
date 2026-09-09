import { fetchSharedConfiguration } from '@shopify';

export const dynamic = 'force-dynamic';

type shareRouteContextType = {
  params: Promise<{ shareId: string }>;
};

const GET = async (_request: Request, { params }: shareRouteContextType) => {
  const { shareId } = await params;
  const shareExport = await fetchSharedConfiguration(shareId);

  if (!shareExport) {
    return Response.json({ error: 'Shared configuration not found.' }, { status: 404 });
  }

  return Response.json(shareExport, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
};

export { GET };
