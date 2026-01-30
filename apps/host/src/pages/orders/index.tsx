import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '@entities/order';
import { useStoreStore } from '@entities/store';
import { OrderDetailModal } from '@features/order-detail';
import { Button, Card, CardContent, Spinner } from '@shop-builder/shared';
import type { Order, OrderStatus } from '@shop-builder/shared';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const OrdersPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { orders, isLoading, error, total, currentPage, totalPages, fetchOrders, setCurrentOrder } = useOrderStore();
  const { currentStore, fetchStore } = useStoreStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchOrders(storeId);
      if (!currentStore || currentStore.id !== storeId) {
        fetchStore(storeId);
      }
    }
  }, [storeId, fetchOrders, fetchStore, currentStore]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setCurrentOrder(order);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
    setCurrentOrder(null);
  };

  const handlePageChange = (page: number) => {
    if (storeId) {
      fetchOrders(storeId, page);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                Заказы {currentStore ? `- ${currentStore.name}` : ''}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Заказов пока нет
              </h3>
              <p className="text-gray-600">
                Когда покупатели оформят заказы в вашем магазине, они появятся здесь
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500">Всего заказов</p>
                  <p className="text-2xl font-bold">{total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500">Ожидают</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'PENDING').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500">В обработке</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'CONFIRMED' || o.status === 'SHIPPED').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500">Выполнено</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'DELIVERED').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Номер заказа
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Дата
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Покупатель
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Товары
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Сумма
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Статус
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-sm">{order.customer.name}</p>
                            <p className="text-sm text-gray-500">{order.customer.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {order.items.length} шт.
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(order)}
                          >
                            Подробнее
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Назад
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Страница {currentPage} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Вперёд
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={selectedOrder}
        storeId={storeId || ''}
      />
    </div>
  );
};

export default OrdersPage;
