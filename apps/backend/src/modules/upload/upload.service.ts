import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as sharp from 'sharp';
import { Readable } from 'stream';
import { PresignFileDto } from './dto/presign.dto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const PRESIGN_EXPIRES_IN = 600; // 10 minutes
const ALLOWED_WIDTHS = [200, 400, 800];
const DEFAULT_QUALITY = 80;

export interface PresignedFile {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor(private config: ConfigService) {
    this.endpoint = this.config.getOrThrow<string>('S3_ENDPOINT');
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');

    this.s3 = new S3Client({
      region: this.config.getOrThrow<string>('S3_REGION'),
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  async generatePresignedUrls(files: PresignFileDto[]): Promise<PresignedFile[]> {
    return Promise.all(files.map((file) => this.generatePresignedUrl(file)));
  }

  private async generatePresignedUrl(file: PresignFileDto): Promise<PresignedFile> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new BadRequestException(
        `Недопустимый тип файла: ${file.type}. Разрешены: ${ALLOWED_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `Файл "${file.name}" превышает максимальный размер 5 МБ`,
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const key = `products/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: file.type,
      ContentLength: file.size,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGN_EXPIRES_IN,
    });

    const fileUrl = `${this.endpoint}/${this.bucket}/${key}`;

    return { uploadUrl, fileUrl, key };
  }

  async getResizedImage(
    key: string,
    width: number,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    if (!ALLOWED_WIDTHS.includes(width)) {
      throw new BadRequestException(
        `Недопустимая ширина: ${width}. Разрешены: ${ALLOWED_WIDTHS.join(', ')}`,
      );
    }

    const cacheKey = `cache/${width}/${key}`;

    // Check if cached version exists
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: cacheKey }),
      );
      const cached = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: cacheKey }),
      );
      const chunks: Buffer[] = [];
      for await (const chunk of cached.Body as Readable) {
        chunks.push(Buffer.from(chunk));
      }
      return { buffer: Buffer.concat(chunks), contentType: 'image/webp' };
    } catch {
      // Cache miss — resize
    }

    // Fetch original
    let originalBody: Readable;
    try {
      const original = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: `products/${key}` }),
      );
      originalBody = original.Body as Readable;
    } catch {
      throw new NotFoundException('Изображение не найдено');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of originalBody) {
      chunks.push(Buffer.from(chunk));
    }
    const originalBuffer = Buffer.concat(chunks);

    // Resize to webp
    const resized = await sharp(originalBuffer)
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality: DEFAULT_QUALITY })
      .toBuffer();

    // Cache in MinIO (fire and forget)
    this.s3
      .send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: cacheKey,
          Body: resized,
          ContentType: 'image/webp',
        }),
      )
      .catch(() => {});

    return { buffer: resized, contentType: 'image/webp' };
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getBucket(): string {
    return this.bucket;
  }
}
