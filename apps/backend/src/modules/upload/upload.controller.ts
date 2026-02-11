import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { PresignRequestDto } from './dto/presign.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  async presign(@Body() dto: PresignRequestDto) {
    const presignedUrls = await this.uploadService.generatePresignedUrls(dto.files);
    return { presignedUrls };
  }
}
