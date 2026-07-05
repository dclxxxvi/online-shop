import {
	IsArray,
	IsObject,
	IsEnum,
	ValidateNested,
	IsString,
	IsNumber,
	IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

class OrderItemDto {
	@IsString()
	productId: string;

	@IsString()
	name: string;

	@Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
	@IsNumber()
	price: number;

	@IsNumber()
	quantity: number;

	@IsOptional()
	@IsString()
	image?: string;
}

class OrderCustomerDto {
	@IsString()
	email: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsString()
	name: string;

	@IsString()
	address: string;

	@IsString()
	city: string;

	@IsString()
	postalCode: string;

	@IsString()
	country: string;
}

export class CreateOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items: OrderItemDto[];

	@IsObject()
	@ValidateNested()
	@Type(() => OrderCustomerDto)
	customer: OrderCustomerDto;
}

export class UpdateOrderStatusDto {
	@IsEnum(OrderStatus)
	status: OrderStatus;
}
