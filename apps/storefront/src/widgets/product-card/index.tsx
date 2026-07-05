import React, { useEffect, useState } from 'react';
import {
	apiClient,
	Product,
	formatPrice,
	getResizedImageUrl,
	getImageSrcSet,
} from '@shop-builder/shared';
import { useCartStore } from '@entities/cart/model/cartStore';

interface ProductCardBlockProps {
	props: Record<string, unknown>;
	storeId: string;
}

export const ProductCardBlock: React.FC<ProductCardBlockProps> = ({ props, storeId }) => {
	const [product, setProduct] = useState<Product | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { addItem } = useCartStore();

	const productId = props.productId as string | null;
	const showPrice = props.showPrice !== false;
	const showRating = props.showRating !== false;
	const showAddToCart = props.showAddToCart !== false;

	useEffect(() => {
		const fetchProduct = async () => {
			setIsLoading(true);
			setError(null);

			try {
				if (productId) {
					// Fetch specific product
					const response = await apiClient.get<Product>(`/stores/${storeId}/products/${productId}`);
					setProduct(response);
				} else {
					// Fetch first product as demo
					const response = await apiClient.get<{ data: Product[] }>(`/stores/${storeId}/products`, {
						limit: 1,
					});
					setProduct(response.data[0] || null);
				}
			} catch (err) {
				console.error('Error fetching product:', err);
				setError('Не удалось загрузить товар');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProduct();
	}, [storeId, productId]);

	if (isLoading) {
		return (
			<section className="py-8 px-4">
				<div className="max-w-xs mx-auto">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
						<div className="h-64 bg-gray-200" />
						<div className="p-4">
							<div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
							<div className="h-4 bg-gray-200 rounded w-full mb-2" />
							<div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
							<div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
							<div className="h-10 bg-gray-200 rounded w-full" />
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (error || !product) {
		return (
			<section className="py-8 px-4">
				<div className="max-w-xs mx-auto">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
						<svg
							className="w-12 h-12 mx-auto text-gray-400 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
							/>
						</svg>
						<p className="text-gray-500">{error || 'Товар не найден'}</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-8 px-4">
			<div className="max-w-xs mx-auto">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
					{/* Product Image */}
					<div className="relative h-64 bg-gray-100">
						{product.images[0] ? (
							<img
								src={getResizedImageUrl(product.images[0], 400)}
								srcSet={getImageSrcSet(product.images[0])}
								sizes="(max-width: 640px) 100vw, 400px"
								alt={product.name}
								loading="lazy"
								decoding="async"
								onLoad={(e) => e.currentTarget.classList.add('loaded')}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-gray-400">
								<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="p-4">
						<h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
						{product.description && (
							<p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
						)}

						{showPrice && (
							<div className="flex items-center justify-between mb-3">
								<span className="text-xl font-bold text-emerald-600">
									{formatPrice(product.price)}
								</span>
								{product.inventory <= 0 && (
									<span className="text-xs text-red-500 font-medium">Нет в наличии</span>
								)}
							</div>
						)}

						{showRating && (
							<div className="flex items-center gap-1 mb-4">
								{[1, 2, 3, 4, 5].map((star) => (
									<svg
										key={star}
										className="w-4 h-4 text-yellow-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
								<span className="text-sm text-gray-500 ml-1">(0 отзывов)</span>
							</div>
						)}

						{showAddToCart && (
							<button
								onClick={() => addItem(product)}
								disabled={product.inventory <= 0}
								className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
							>
								{product.inventory > 0 ? 'В корзину' : 'Нет в наличии'}
							</button>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
