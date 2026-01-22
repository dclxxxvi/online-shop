import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private storesService: StoresService,
  ) {}

  async findAllByStore(storeId: string, page = 1, limit = 10, categoryId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { storeId, isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async create(storeId: string, userId: string, dto: CreateProductDto) {
    await this.storesService.findById(storeId, userId);

    return this.prisma.product.create({
      data: {
        storeId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        images: dto.images || [],
        inventory: dto.inventory || 0,
        categoryId: dto.categoryId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProductDto) {
    const product = await this.findById(id);
    await this.storesService.findById(product.storeId, userId);

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const product = await this.findById(id);
    await this.storesService.findById(product.storeId, userId);

    return this.prisma.product.delete({ where: { id } });
  }
}
