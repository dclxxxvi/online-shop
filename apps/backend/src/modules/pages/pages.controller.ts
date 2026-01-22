import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('stores/:storeId/pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Param('storeId') storeId: string, @Request() req: any) {
    return this.pagesService.findAllByStore(storeId, req.user.userId);
  }

  @Get(':slug')
  async findOne(@Param('storeId') storeId: string, @Param('slug') slug: string) {
    return this.pagesService.findBySlug(storeId, slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreatePageDto,
    @Request() req: any,
  ) {
    return this.pagesService.create(storeId, req.user.userId, dto);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('storeId') storeId: string,
    @Param('slug') slug: string,
    @Body() dto: UpdatePageDto,
    @Request() req: any,
  ) {
    return this.pagesService.update(storeId, slug, req.user.userId, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('storeId') storeId: string,
    @Param('slug') slug: string,
    @Request() req: any,
  ) {
    return this.pagesService.delete(storeId, slug, req.user.userId);
  }
}
