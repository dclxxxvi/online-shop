import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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

	@Get('resize/:key')
	async resize(@Param('key') key: string, @Query('w') width: string, @Res() res: Response) {
		const w = parseInt(width, 10);
		const { buffer, contentType } = await this.uploadService.getResizedImage(key, w);
		res.set({
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000, immutable',
		});
		res.send(buffer);
	}
}
