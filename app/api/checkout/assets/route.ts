import { uploadShopifyFile } from '@shopify';

export const dynamic = 'force-dynamic';

type uploadedUvImageType = {
  cartItemId: string;
  label: string;
  url: string;
};

type checkoutAssetsResultType = {
  orderPdfUrl: string | null;
  cuttingPdfUrl: string | null;
  uvImages: uploadedUvImageType[];
};

export async function POST(request: Request): Promise<Response> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid multipart form body.' }, { status: 400 });
  }

  try {
    const orderPdf = formData.get('orderPdf');
    const cuttingPdf = formData.get('cuttingPdf');
    const uvImages = formData.getAll('uvImage').filter((entry): entry is File => entry instanceof File);
    const uvImageCartItemIds = formData.getAll('uvImageCartItemId').map(String);
    const uvImageLabels = formData.getAll('uvImageLabel').map(String);

    const result: checkoutAssetsResultType = {
      orderPdfUrl: orderPdf instanceof File ? await uploadShopifyFile(orderPdf, orderPdf.name, orderPdf.type || 'application/pdf') : null,
      cuttingPdfUrl:
        cuttingPdf instanceof File ? await uploadShopifyFile(cuttingPdf, cuttingPdf.name, cuttingPdf.type || 'application/pdf') : null,
      uvImages: [],
    };

    for (let index = 0; index < uvImages.length; index += 1) {
      const file = uvImages[index];
      const url = await uploadShopifyFile(file, file.name, file.type || 'image/png');

      result.uvImages.push({
        cartItemId: uvImageCartItemIds[index] ?? '',
        label: uvImageLabels[index] ?? file.name,
        url,
      });
    }

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown asset upload error.';
    return Response.json({ error: message }, { status: 502 });
  }
}
