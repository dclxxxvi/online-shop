import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Prisma, Product } from '@prisma/client';
import ProductWhereInput = Prisma.ProductWhereInput;

@Injectable()
export class ProductsService {
	constructor(
		private prisma: PrismaService,
		private storesService: StoresService,
	) {}

	async findAllByStore(
		storeId: string,
		cursor: Product['id'] | null,
		limit = 10,
		categoryId?: string,
		search?: string,
	) {
		const where: ProductWhereInput = { storeId, isActive: true };
		if (categoryId) {
			where.categoryId = categoryId;
		}
		if (search) {
			where.name = { contains: search, mode: 'insensitive' };
		}

		if (cursor) {
			where.id = {
				lt: cursor,
			};
		}

		const [dataWithCursor] = await Promise.all([
			this.prisma.product.findMany({
				where,
				take: limit + 1,
				include: { category: true },
				orderBy: { id: 'desc' },
			}),
		]);

		const hasNext = dataWithCursor.length > limit;
		const nextCursor = dataWithCursor?.at(-1)?.id;
		const data = dataWithCursor.slice(0, limit);

		return {
			data,
			hasNext,
			nextCursor,
			limit,
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
				isActive: dto.isActive,
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
