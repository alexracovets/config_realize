import { createStagedUploadTargets } from '@shopify/createStagedUploadTargets';

export const dynamic = 'force-dynamic';

type stagedTargetRequestFileType = {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
};

export async function POST(request: Request): Promise<Response> {
  let body: { files?: stagedTargetRequestFileType[] };

  try {
    body = (await request.json()) as { files?: stagedTargetRequestFileType[] };
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const files = body.files ?? [];
  if (!files.length) {
    return Response.json({ error: 'Missing files.' }, { status: 400 });
  }

  try {
    const targets = await createStagedUploadTargets(
      files.map((file) => ({
        filename: file.filename,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
      })),
    );

    return Response.json({
      targets: files.map((file, index) => ({
        id: file.id,
        target: targets[index],
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown staged target error.';
    return Response.json({ error: message }, { status: 502 });
  }
}
