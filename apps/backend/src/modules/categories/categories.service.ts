import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private storesService: StoresService,
  ) {}

  async findAllByStore(storeId: string) {
    return this.prisma.category.findMany({
      where: { storeId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async create(storeId: string, userId: string, dto: CreateCategoryDto) {
    await this.storesService.findById(storeId, userId);

    return this.prisma.category.create({
      data: {
        storeId,
        name: dto.name,
        slug: dto.slug,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.findById(id);
    await this.storesService.findById(category.storeId, userId);

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const category = await this.findById(id);
    await this.storesService.findById(category.storeId, userId);

    return this.prisma.category.delete({ where: { id } });
  }
}
