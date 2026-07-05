import React, { useEffect, useState } from 'react';
import { useEditorStore, blockNames } from '@entities/block';
import {
	Input,
	Button,
	Label,
	Checkbox,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	apiClient,
	Product,
	PaginatedResponse,
	formatPrice,
} from '@shop-builder/shared';

const parsePx = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		const num = parseFloat(value);
		return isNaN(num) ? 0 : num;
	}
	return 0;
};

export const PropertiesPanel: React.FC = () => {
	const { blocks, selectedBlockId, updateBlock, deleteBlock } = useEditorStore();
	const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

	if (!selectedBlock) {
		return (
			<aside className="w-80 bg-gray-50 border-l border-gray-200 p-4">
				<div className="text-center text-gray-400 py-12">
					<svg
						className="w-12 h-12 mx-auto mb-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
						/>
					</svg>
					<p className="text-sm">Выберите блок для редактирования</p>
				</div>
			</aside>
		);
	}

	const desktop = selectedBlock.styles?.desktop || {};

	const handlePropChange = (key: string, value: unknown) => {
		updateBlock(selectedBlock.id, {
			props: { ...selectedBlock.props, [key]: value },
		});
	};

	const handleStyleChange = (key: string, value: number) => {
		updateBlock(selectedBlock.id, {
			styles: {
				...selectedBlock.styles,
				desktop: { ...desktop, [key]: value },
			},
		});
	};

	return (
		<aside className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
			<div className="p-4 border-b border-gray-200 bg-white">
				<h2 className="font-semibold text-gray-900">{blockNames[selectedBlock.type]}</h2>
				<p className="text-sm text-gray-500">Настройки блока</p>
			</div>

			<div className="p-4 space-y-4">
				{/* Render props based on block type */}
				<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
					<h3 className="text-sm font-medium text-gray-900 mb-3">Контент</h3>
					<div className="space-y-4">
						<PropsEditor block={selectedBlock} onPropChange={handlePropChange} />
					</div>
				</div>

				{/* Padding Settings */}
				<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
					<h3 className="text-sm font-medium text-gray-900 mb-3">Внутренние отступы (padding)</h3>
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-1">
							<Label htmlFor="paddingTop">Сверху</Label>
							<Input
								id="paddingTop"
								type="number"
								min={0}
								value={parsePx(desktop.paddingTop)}
								onChange={(e) => handleStyleChange('paddingTop', Number(e.target.value))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="paddingRight">Справа</Label>
							<Input
								id="paddingRight"
								type="number"
								min={0}
								value={parsePx(desktop.paddingRight)}
								onChange={(e) => handleStyleChange('paddingRight', Number(e.target.value))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="paddingBottom">Снизу</Label>
							<Input
								id="paddingBottom"
								type="number"
								min={0}
								value={parsePx(desktop.paddingBottom)}
								onChange={(e) => handleStyleChange('paddingBottom', Number(e.target.value))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="paddingLeft">Слева</Label>
							<Input
								id="paddingLeft"
								type="number"
								min={0}
								value={parsePx(desktop.paddingLeft)}
								onChange={(e) => handleStyleChange('paddingLeft', Number(e.target.value))}
							/>
						</div>
					</div>
				</div>

				{/* Margin Settings */}
				<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
					<h3 className="text-sm font-medium text-gray-900 mb-3">Внешние отступы (margin)</h3>
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-1">
							<Label htmlFor="marginTop">Сверху</Label>
							<Input
								id="marginTop"
								type="number"
								value={parsePx(desktop.marginTop)}
								onChange={(e) => handleStyleChange('marginTop', Number(e.target.value))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="marginRight">Справа</Label>
							<Input
								id="marginRight"
								type="number"
								value={parsePx(desktop.marginRight)}
								onChange={(e) => handleStyleChange('marginRight', Number(e.target.value))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="marginBottom">Снизу</Label>
							<Input
								id="marginBottom"
								type="number"
								value={parsePx(desktop.marginBottom)}
								onChange={(e) => handleStyleChange('marginBottom', Number(e.target.value))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="marginLeft">Слева</Label>
							<Input
								id="marginLeft"
								type="number"
								value={parsePx(desktop.marginLeft)}
								onChange={(e) => handleStyleChange('marginLeft', Number(e.target.value))}
							/>
						</div>
					</div>
				</div>

				{/* Delete Block */}
				<div className="pt-2">
					<Button
						variant="destructive"
						className="w-full"
						onClick={() => deleteBlock(selectedBlock.id)}
					>
						Удалить блок
					</Button>
				</div>
			</div>
		</aside>
	);
};

// Props editor component
interface PropsEditorProps {
	block: ReturnType<typeof useEditorStore.getState>['blocks'][0];
	onPropChange: (key: string, value: unknown) => void;
}

const PropsEditor: React.FC<PropsEditorProps> = ({ block, onPropChange }) => {
	const { type, props } = block;

	switch (type) {
		case 'header':
			return (
				<>
					<div className="space-y-1">
						<Label htmlFor="logo">Логотип</Label>
						<Input
							id="logo"
							value={(props.logo as string) || ''}
							onChange={(e) => onPropChange('logo', e.target.value)}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id="showCart"
							checked={(props.showCart as boolean) || false}
							onCheckedChange={(checked) => onPropChange('showCart', checked)}
						/>
						<Label htmlFor="showCart">Показывать корзину</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id="showSearch"
							checked={(props.showSearch as boolean) || false}
							onCheckedChange={(checked) => onPropChange('showSearch', checked)}
						/>
						<Label htmlFor="showSearch">Показывать поиск</Label>
					</div>
				</>
			);

		case 'hero':
			return (
				<>
					<div className="space-y-1">
						<Label htmlFor="title">Заголовок</Label>
						<Input
							id="title"
							value={(props.title as string) || ''}
							onChange={(e) => onPropChange('title', e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="subtitle">Подзаголовок</Label>
						<Input
							id="subtitle"
							value={(props.subtitle as string) || ''}
							onChange={(e) => onPropChange('subtitle', e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="buttonText">Текст кнопки</Label>
						<Input
							id="buttonText"
							value={(props.buttonText as string) || ''}
							onChange={(e) => onPropChange('buttonText', e.target.value)}
						/>
					</div>
				</>
			);

		case 'text':
			return (
				<div className="space-y-1">
					<Label htmlFor="content">Текст</Label>
					<textarea
						id="content"
						className="w-full h-32 px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
						value={(props.content as string) || ''}
						onChange={(e) => onPropChange('content', e.target.value)}
					/>
				</div>
			);

		case 'product-card':
			return (
				<ProductCardProps
					productId={props.productId as string | null}
					showPrice={props.showPrice as boolean}
					showRating={props.showRating as boolean}
					showAddToCart={props.showAddToCart as boolean}
					onPropChange={onPropChange}
				/>
			);

		case 'product-grid':
			return (
				<>
					<div className="space-y-1">
						<Label htmlFor="columns">Колонок</Label>
						<Input
							id="columns"
							type="number"
							min={1}
							max={6}
							value={(props.columns as number) || 4}
							onChange={(e) => onPropChange('columns', parseInt(e.target.value))}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="limit">Количество товаров</Label>
						<Input
							id="limit"
							type="number"
							min={1}
							max={20}
							value={(props.limit as number) || 8}
							onChange={(e) => onPropChange('limit', parseInt(e.target.value))}
						/>
					</div>
				</>
			);

		case 'footer':
			return (
				<div className="space-y-1">
					<Label htmlFor="copyright">Копирайт</Label>
					<Input
						id="copyright"
						value={(props.copyright as string) || ''}
						onChange={(e) => onPropChange('copyright', e.target.value)}
					/>
				</div>
			);

		default:
			return <p className="text-sm text-gray-500">Нет доступных настроек для этого блока</p>;
	}
};

// Product Card Props Editor with product select
interface ProductCardPropsEditorProps {
	productId: string | null;
	showPrice: boolean;
	showRating: boolean;
	showAddToCart: boolean;
	onPropChange: (key: string, value: unknown) => void;
}

const ProductCardProps: React.FC<ProductCardPropsEditorProps> = ({
	productId,
	showPrice,
	showRating,
	showAddToCart,
	onPropChange,
}) => {
	const { storeId } = useEditorStore();
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!storeId) return;

		const fetchProducts = async () => {
			setIsLoading(true);
			try {
				const response = await apiClient.get<PaginatedResponse<Product>>(
					`/stores/${storeId}/products`,
					{ limit: 100 },
				);
				setProducts(response.data);
			} catch (error) {
				console.error('Failed to load products:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, [storeId]);

	return (
		<>
			<div className="space-y-1">
				<Label htmlFor="productId">Товар</Label>
				<Select
					value={productId || '__none__'}
					onValueChange={(value) => onPropChange('productId', value === '__none__' ? null : value)}
				>
					<SelectTrigger>
						<SelectValue placeholder={isLoading ? 'Загрузка...' : 'Выберите товар'} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="__none__">
							<span className="text-gray-500">Первый товар (демо)</span>
						</SelectItem>
						{products.map((product) => (
							<SelectItem key={product.id} value={product.id}>
								<div className="flex items-center justify-between gap-2">
									<span className="truncate">{product.name}</span>
									<span className="text-xs text-gray-500 shrink-0">
										{formatPrice(product.price)}
									</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{products.length === 0 && !isLoading && (
					<p className="text-xs text-amber-600">Нет товаров в магазине</p>
				)}
			</div>
			<div className="flex items-center gap-2">
				<Checkbox
					id="showPrice"
					checked={showPrice !== false}
					onCheckedChange={(checked) => onPropChange('showPrice', checked)}
				/>
				<Label htmlFor="showPrice">Показывать цену</Label>
			</div>
			<div className="flex items-center gap-2">
				<Checkbox
					id="showRating"
					checked={showRating !== false}
					onCheckedChange={(checked) => onPropChange('showRating', checked)}
				/>
				<Label htmlFor="showRating">Показывать рейтинг</Label>
			</div>
			<div className="flex items-center gap-2">
				<Checkbox
					id="showAddToCart"
					checked={showAddToCart !== false}
					onCheckedChange={(checked) => onPropChange('showAddToCart', checked)}
				/>
				<Label htmlFor="showAddToCart">Кнопка "В корзину"</Label>
			</div>
		</>
	);
};
