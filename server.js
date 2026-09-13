import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:4566';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || 'financial-vault';
const S3_KEY = process.env.S3_KEY || 'vault/financial-data.dat';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test';

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for LocalStack / Floci S3 emulator path-style requests
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure S3 bucket exists on startup
async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    console.log(`[S3] Connected to Floci S3. Bucket "${S3_BUCKET}" ready on ${S3_ENDPOINT}`);
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      try {
        console.log(`[S3] Bucket "${S3_BUCKET}" not found. Creating bucket on Floci...`);
        await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
        console.log(`[S3] Bucket "${S3_BUCKET}" created successfully`);
      } catch (createErr) {
        console.error(`[S3] Failed to create bucket:`, createErr.message);
      }
    } else {
      console.warn(`[S3] Warning checking bucket:`, err.message);
    }
  }
}

// 1. Vault Status & Health Endpoint
app.get('/api/vault/status', async (req, res) => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    res.json({
      success: true,
      connected: true,
      provider: 'AWS S3 (Floci Cloud)',
      bucket: S3_BUCKET,
      endpoint: S3_ENDPOINT,
      key: S3_KEY,
    });
  } catch (err) {
    res.json({
      success: false,
      connected: false,
      provider: 'AWS S3 (Floci Cloud)',
      bucket: S3_BUCKET,
      endpoint: S3_ENDPOINT,
      error: err.message,
    });
  }
});

// 2. Fetch User Vault from S3
app.get('/api/vault', async (req, res) => {
  try {
    const s3Res = await s3.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: S3_KEY,
      })
    );
    const bodyStr = await s3Res.Body.transformToString();
    const parsed = JSON.parse(bodyStr);

    res.json({
      success: true,
      data: parsed,
      lastModified: s3Res.LastModified,
      source: 's3',
    });
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return res.json({
        success: true,
        data: null,
        source: 's3_empty',
      });
    }
    console.error('[S3 Read Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Persist User Vault to S3
app.put('/api/vault', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid vault payload' });
    }

    const payload = JSON.stringify(data);
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: S3_KEY,
        Body: Buffer.from(payload, 'utf-8'),
        ContentType: 'application/octet-stream',
      })
    );

    res.json({
      success: true,
      message: 'Vault securely stored in S3',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[S3 Write Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Serve Static Frontend Files (SPA fallback)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start listening
app.listen(PORT, async () => {
  console.log(`[App Server] Personal Financial Planner running on port ${PORT}`);
  await ensureBucket();
});
