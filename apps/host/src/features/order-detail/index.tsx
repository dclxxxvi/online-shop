import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Spinner,
} from '@shop-builder/shared';
import type { Order, OrderStatus } from '@shop-builder/shared';
import { useOrderStore } from '@entities/order';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  storeId: string;
}

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

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  storeId,
}) => {
  const { updateOrderStatus, isUpdating } = useOrderStore();

  if (!order) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(storeId, order.id, newStatus);
    } catch {
      // Error handled in store
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
    return new Date(dateStr).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const canConfirm = order.status === 'PENDING';
  const canShip = order.status === 'CONFIRMED';
  const canDeliver = order.status === 'SHIPPED';
  const canCancel = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Заказ #{order.id.slice(0, 8)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Order Progress */}
          {order.status !== 'CANCELLED' && (
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((status, index) => (
                <React.Fragment key={status}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStatusIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">{STATUS_LABELS[status]}</span>
                  </div>
                  {index < STATUS_FLOW.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStatusIndex ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Информация о покупателе</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Имя:</span>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              {order.customer.phone && (
                <div>
                  <span className="text-gray-500">Телефон:</span>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-gray-500">Адрес:</span>
                <p className="font-medium">
                  {order.customer.postalCode}, {order.customer.city}, {order.customer.address}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Товары</h4>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-medium">Итого:</span>
            <span className="text-xl font-bold">{formatPrice(order.total)}</span>
          </div>

          {/* Order Date */}
          <div className="text-sm text-gray-500">
            Заказ создан: {formatDate(order.createdAt)}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {canConfirm && (
              <Button
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating && <Spinner size="sm" className="mr-2" />}
                Подтвердить
              </Button>
            )}
            {canShip && (
              <Button
                onClick={() => handleStatusChange('SHIPPED')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating && <Spinner size="sm" className="mr-2" />}
                Отправить
              </Button>
            )}
            {canDeliver && (
              <Button
                onClick={() => handleStatusChange('DELIVERED')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating && <Spinner size="sm" className="mr-2" />}
                Доставлен
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={isUpdating}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Отменить
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
