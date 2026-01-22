import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@Injectable()
export class PagesService {
  constructor(
    private prisma: PrismaService,
    private storesService: StoresService,
  ) {}

  async findAllByStore(storeId: string, userId?: string) {
    if (userId) {
      await this.storesService.findById(storeId, userId);
    }

    return this.prisma.page.findMany({
      where: { storeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findBySlug(storeId: string, slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { storeId_slug: { storeId, slug } },
    });

    if (!page) {
      throw new NotFoundException('Страница не найдена');
    }

    return page;
  }

  async create(storeId: string, userId: string, dto: CreatePageDto) {
    await this.storesService.findById(storeId, userId);

    return this.prisma.page.create({
      data: {
        storeId,
        slug: dto.slug,
        title: dto.title,
        blocks: dto.blocks || [],
        isHome: dto.isHome || false,
      },
    });
  }

  async update(storeId: string, slug: string, userId: string, dto: UpdatePageDto) {
    await this.storesService.findById(storeId, userId);
    await this.findBySlug(storeId, slug);

    return this.prisma.page.update({
      where: { storeId_slug: { storeId, slug } },
      data: dto,
    });
  }

  async delete(storeId: string, slug: string, userId: string) {
    await this.storesService.findById(storeId, userId);
    const page = await this.findBySlug(storeId, slug);

    if (page.isHome) {
      throw new Error('Нельзя удалить главную страницу');
    }

    return this.prisma.page.delete({
      where: { storeId_slug: { storeId, slug } },
    });
  }
}
