// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = promisify(fs.readFile);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'File parsing error' });
    }

    const fileField = files.file;
    const file: FormidableFile | undefined = Array.isArray(fileField)
      ? fileField[0]
      : fileField;

    const typeField = fields.type;
    const type: string | undefined = Array.isArray(typeField)
      ? typeField[0]
      : typeField;

    if (!file || !type || !['image', 'audio'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file or type' });
    }

    try {
      const fileBuffer = await readFile(file.filepath);
      const ext = file.originalFilename?.split('.').pop() || 'bin';
      const key = `media/${type}/${randomUUID()}.${ext}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream',
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return res.status(200).json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}