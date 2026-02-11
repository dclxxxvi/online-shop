import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PresignFileDto } from './dto/presign.dto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const PRESIGN_EXPIRES_IN = 600; // 10 minutes

interface PresignedFile {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private region: string;

  constructor(private config: ConfigService) {
    this.region = this.config.getOrThrow<string>('AWS_REGION');
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
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

    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  }
}
