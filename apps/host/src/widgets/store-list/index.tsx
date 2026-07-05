import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreStore } from '@entities/store';
import { CreateStoreModal } from '@features/create-store';
import { Button, Card, CardContent, Spinner, Badge } from '@shop-builder/shared';

export const StoreList: React.FC = () => {
	const navigate = useNavigate();
	const { stores, isLoading } = useStoreStore();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<>
			<div className="mb-6">
				<Button onClick={() => setIsCreateModalOpen(true)}>
					<svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Создать магазин
				</Button>
			</div>

			{stores.length === 0 ? (
				<Card className="text-center py-12">
					<CardContent>
						<div className="text-gray-400 mb-4">
							<svg
								className="w-16 h-16 mx-auto"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">У вас пока нет магазинов</h3>
						<p className="text-gray-600 mb-6">
							Создайте свой первый интернет-магазин за несколько минут
						</p>
						<Button onClick={() => setIsCreateModalOpen(true)}>Создать магазин</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{stores.map((store) => (
						<Card key={store.id} className="hover:shadow-md transition-shadow">
							<CardContent className="pt-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h3 className="font-semibold text-gray-900">{store.name}</h3>
										<p className="text-sm text-gray-500">{store.subdomain}.shopbuilder.com</p>
									</div>
									<Badge variant={store.isPublished ? 'success' : 'warning'}>
										{store.isPublished ? 'Опубликован' : 'Черновик'}
									</Badge>
								</div>

								<div className="flex gap-2 flex-wrap">
									<Button
										size="sm"
										className="flex-1"
										onClick={() => navigate(`/editor/${store.id}`)}
									>
										Редактор
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate(`/stores/${store.id}/products`)}
									>
										Товары
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate(`/stores/${store.id}/orders`)}
									>
										Заказы
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate(`/preview/${store.id}`, { replace: false })}
									>
										Просмотр
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											const port = window.location.port ? `:${window.location.port}` : '';
											window.open(`http://${store.subdomain}.localhost${port}`, '_blank');
										}}
									>
										<svg
											className="w-4 h-4 mr-1"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
										Поддомен
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<CreateStoreModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</>
	);
};
