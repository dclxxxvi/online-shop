import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where: { userId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId?: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        pages: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Магазин не найден');
    }

    if (userId && store.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому магазину');
    }

    return store;
  }

  async findByIdPublic(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Магазин не найден');
    }

    return store;
  }

  async findBySubdomain(subdomain: string) {
    const store = await this.prisma.store.findUnique({
      where: { subdomain },
    });

    if (!store) {
      throw new NotFoundException('Магазин не найден');
    }

    return store;
  }

  async create(userId: string, dto: CreateStoreDto) {
    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        subdomain: dto.subdomain,
        userId,
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
        },
        settings: {
          currency: 'RUB',
          language: 'ru',
          timezone: 'Europe/Moscow',
        },
      },
    });

    // Create default home page
    await this.prisma.page.create({
      data: {
        storeId: store.id,
        slug: 'home',
        title: 'Главная',
        isHome: true,
        blocks: [],
      },
    });

    return store;
  }

  async update(id: string, userId: string, dto: UpdateStoreDto) {
    await this.findById(id, userId);

    return this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.store.delete({ where: { id } });
  }

  async publish(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.store.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.store.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}
