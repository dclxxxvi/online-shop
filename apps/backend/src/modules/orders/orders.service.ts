import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private storesService: StoresService,
  ) {}

  async findAllByStore(storeId: string, userId: string, page = 1, limit = 10) {
    await this.storesService.findById(storeId, userId);

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { storeId } }),
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
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  async create(storeId: string, dto: CreateOrderDto) {
    // Calculate total
    const total = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return this.prisma.order.create({
      data: {
        storeId,
        items: JSON.parse(JSON.stringify(dto.items)) as Prisma.InputJsonValue,
        total,
        customer: JSON.parse(JSON.stringify(dto.customer)) as Prisma.InputJsonValue,
      },
    });
  }

  async updateStatus(id: string, userId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findById(id);
    await this.storesService.findById(order.storeId, userId);

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
